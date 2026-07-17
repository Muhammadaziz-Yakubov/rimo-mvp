import { Injectable, BadRequestException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as XLSX from "xlsx";
import { Transaction, TransactionDocument } from "../schemas/transaction.schema";
import { FinancialInsight, FinancialInsightDocument } from "../schemas/financial-insight.schema";
import { GroqService } from "./groq.service";

@Injectable()
export class FinancialsService implements OnModuleInit {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(FinancialInsight.name) private financialInsightModel: Model<FinancialInsightDocument>,
    private groqService: GroqService
  ) {}

  async onModuleInit() {
    await this.normalizeExistingTransactions();
  }

  async normalizeExistingTransactions() {
    try {
      console.log("[MIGRATION] Checking for transactions to normalize...");
      const list = await this.transactionModel.find({}).exec();
      let updatedCount = 0;

      for (const tx of list) {
        let rawType = "";
        if (tx.rawData) {
          const foundKey = Object.keys(tx.rawData).find(k => 
            /type|turi|тип|status|kirim|chiqim|debit|credit|operation/i.test(k)
          );
          if (foundKey) {
            rawType = (tx.rawData[foundKey] || "").toString().trim().toLowerCase();
          }
        }

        const correctedType = this.determineType(rawType, tx.category, tx.description);

        if (tx.type !== correctedType) {
          const category = tx.category === "Sales" && correctedType === "expense" ? "General Expense" : tx.category;
          const taxCategory = tx.taxCategory === "turnover_taxable" && correctedType === "expense" ? "vat_deductible" : tx.taxCategory;

          await this.transactionModel.updateOne(
            { _id: tx._id },
            { type: correctedType, category, taxCategory }
          );
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`[MIGRATION] Successfully normalized ${updatedCount} transactions in the database.`);
      } else {
        console.log("[MIGRATION] No transactions needed normalization.");
      }
    } catch (e) {
      console.error("[MIGRATION] Failed to normalize transactions:", e.message);
    }
  }

  determineType(rawType: string, category: string, description: string): string {
    const typeStr = (rawType || "").toString().trim().toLowerCase();
    const catStr = (category || "").toString().trim().toLowerCase();
    const descStr = (description || "").toString().trim().toLowerCase();

    // 1. Check explicit raw type keywords
    if (/chiqim|expense|rashod|расход|debet|debit|xarajat|-/i.test(typeStr)) {
      return "expense";
    }
    if (/kirim|income|dohod|доход|kredit|credit|daromad|\+/i.test(typeStr)) {
      return "income";
    }

    // 2. Check AI category keywords
    if (/sales|revenue|daromad|sotuv|income/i.test(catStr)) {
      return "income";
    }
    if (/xarajat|chiqim|expense|ish haqi|salary|maosh|marketing|rent|ijara|tax|soliq|supplies|material|equipment|jihoz/i.test(catStr)) {
      return "expense";
    }

    // 3. Check description keywords
    if (/sotildi|sales|sotuv|tushum|kirim|income/i.test(descStr)) {
      return "income";
    }
    if (/xarajat|chiqim|expense|maosh|salary|marketing|ijara|rent|soliq|tax|material|jihoz|jihozlar|supplies|equipment/i.test(descStr)) {
      return "expense";
    }

    // Default fallback
    return "income"; // default to income
  }

  // Parse file and import transactions
  async importTransactions(workspaceId: string, fileBuffer: Buffer, fileName: string): Promise<any> {
    try {
      // 1. Read workbook (XLSX handles CSV too)
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to 2D array
      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (rawRows.length < 2) {
        throw new BadRequestException("Hujjatda etarli ma'lumotlar mavjud emas (kamida sarlavha va bitta qator bo'lishi kerak).");
      }

      // 2. Identify headers and map column indices
      const headerRowIndex = 0;
      const headers = rawRows[headerRowIndex].map((h) => h?.toString().trim().toLowerCase() || "");
      
      let dateIdx = -1;
      let descIdx = -1;
      let amountIdx = -1;
      let typeIdx = -1;

      headers.forEach((h, idx) => {
        if (/sana|date|дата|vaqt|time/i.test(h)) dateIdx = idx;
        else if (/description|описание|izoh|nomi|name|kontragent|details|mahsulot/i.test(h)) descIdx = idx;
        else if (/amount|summa|сумма|narxi|price|value/i.test(h)) amountIdx = idx;
        else if (/type|turi|тип|status|kirim|chiqim|debit|credit|operation/i.test(h)) typeIdx = idx;
      });

      // Default fallback mappings if detection fails
      if (dateIdx === -1) dateIdx = 0;
      if (descIdx === -1) descIdx = headers.length > 1 ? 1 : 0;
      if (amountIdx === -1) amountIdx = headers.length > 2 ? 2 : 0;
      if (typeIdx === -1) typeIdx = headers.length > 3 ? 3 : -1;

      const parsedTransactions: any[] = [];

      // 3. Parse data rows
      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (row.length === 0 || row.every((cell) => cell === undefined || cell === "")) {
          continue; // Skip empty rows
        }

        // Date parsing
        const rawDate = row[dateIdx];
        let date = new Date();
        if (rawDate !== undefined) {
          if (typeof rawDate === "number") {
            // Excel serial date representation
            date = new Date((rawDate - 25569) * 86400 * 1000);
          } else {
            const parsed = Date.parse(rawDate.toString());
            if (!isNaN(parsed)) {
              date = new Date(parsed);
            }
          }
        }

        // Description parsing
        const description = row[descIdx]?.toString() || "Tranzaksiya";

        // Amount parsing
        const rawAmount = row[amountIdx];
        let amount = 0;
        if (rawAmount !== undefined) {
          amount = parseFloat(rawAmount.toString().replace(/[^0-9.-]/g, ""));
          if (isNaN(amount)) amount = 0;
        }

        // Type parsing
        const rawType = typeIdx !== -1 ? row[typeIdx]?.toString().trim().toLowerCase() || "" : "";
        if (amount < 0) {
          amount = Math.abs(amount);
        }
        const type = this.determineType(rawType, "", description);

        // Capture raw row data
        const rawData: Record<string, any> = {};
        row.forEach((cell, idx) => {
          const headerName = rawRows[headerRowIndex][idx] || `Col_${idx}`;
          rawData[headerName] = cell;
        });

        parsedTransactions.push({
          date,
          description,
          originalDescription: description,
          amount,
          type,
          rawData,
        });
      }

      if (parsedTransactions.length === 0) {
        throw new BadRequestException("Yuklangan hujjatdan tranzaksiyalarni o'qib bo'lmadi.");
      }

      // 4. Batch-categorize transactions using AI (GROQ)
      const batchSize = 25;
      const categorizedTransactions: any[] = [];
      
      for (let i = 0; i < parsedTransactions.length; i += batchSize) {
        const batch = parsedTransactions.slice(i, i + batchSize);
        const categories = await this.groqService.categorizeTransactions(batch);
        
        batch.forEach((t, idx) => {
          const aiCat = categories[idx]?.category || "";
          const taxCat = categories[idx]?.taxCategory || "";

          // Re-evaluate type using AI Category
          const rawType = t.rawData ? (
            t.rawData["Operatsiya turi"] || 
            t.rawData["type"] || 
            t.rawData["turi"] || 
            t.rawData["Turi"] || 
            t.rawData["тип"] || 
            ""
          ).toString().trim().toLowerCase() : "";

          const finalType = this.determineType(rawType, aiCat, t.description);

          categorizedTransactions.push({
            ...t,
            type: finalType,
            workspaceId: new Types.ObjectId(workspaceId),
            category: aiCat || (finalType === "income" ? "Sales" : "General Expense"),
            taxCategory: taxCat || (finalType === "income" ? "turnover_taxable" : "exempt"),
            confidenceScore: categories[idx]?.confidence !== undefined ? categories[idx].confidence : 85,
          });
        });
      }

      // 5. Save to MongoDB
      await this.transactionModel.insertMany(categorizedTransactions);

      // 6. Generate and save AI Insights
      try {
        const stats = await this.getStats(workspaceId);
        const insights = await this.groqService.generateInsights(stats, categorizedTransactions);
        
        // Remove old insights for this workspace
        await this.financialInsightModel.deleteMany({ workspaceId: new Types.ObjectId(workspaceId) }).exec();
        
        if (insights.length > 0) {
          const insightsToSave = insights.map((ins: any) => ({
            workspaceId: new Types.ObjectId(workspaceId),
            type: ins.type || "info",
            title: ins.title || "Tahlil",
            description: ins.description || "",
            priority: ins.priority || "medium",
          }));
          await this.financialInsightModel.insertMany(insightsToSave);
        }
      } catch (insErr) {
        console.error("Failed to generate or save insights during import:", insErr.message);
      }

      return {
        success: true,
        count: categorizedTransactions.length,
      };
    } catch (e) {
      console.error("Excel Import Error:", e.message);
      throw new BadRequestException(`Faylni o'qishda xatolik: ${e.message}`);
    }
  }

  // Get list of transactions
  async getTransactions(
    workspaceId: string,
    filters: {
      type?: string;
      category?: string;
      taxCategory?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const query: any = { workspaceId: new Types.ObjectId(workspaceId) };

    if (filters.type) {
      // Support case-insensitive query or direct matching
      query.type = filters.type.trim().toLowerCase();
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.taxCategory) {
      query.taxCategory = filters.taxCategory;
    }
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }
    if (filters.search) {
      query.description = { $regex: filters.search, $options: "i" };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(query).exec(),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Clear all transactions
  async clearTransactions(workspaceId: string) {
    await this.transactionModel.deleteMany({ workspaceId: new Types.ObjectId(workspaceId) }).exec();
    return { success: true };
  }

  // Get statistics for financial dashboard
  async getStats(workspaceId: string, queryParams?: { startDate?: string; endDate?: string }) {
    const query: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (queryParams?.startDate || queryParams?.endDate) {
      query.date = {};
      if (queryParams.startDate) {
        query.date.$gte = new Date(queryParams.startDate);
      }
      if (queryParams.endDate) {
        query.date.$lte = new Date(queryParams.endDate);
      }
    }

    const transactions = await this.transactionModel
      .find(query)
      .sort({ date: 1 })
      .exec();

    let revenue = 0;
    let expenses = 0;

    // Type counters for debugging
    let incomeCount = 0;
    let expenseCount = 0;
    let unknownCount = 0;

    // Categories breakdown
    const categoryMap: Record<string, number> = {};
    
    // Monthly history
    const monthsUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    monthsUz.forEach((m) => {
      monthlyMap[m] = { income: 0, expense: 0 };
    });

    // Tax Estimate Calculations
    let turnoverTaxableIncome = 0;
    let vatDeductibleExpenses = 0;
    let salaryExpenses = 0;

    transactions.forEach((t) => {
      const amount = t.amount || 0;
      const monthIndex = new Date(t.date).getMonth();
      const monthName = monthsUz[monthIndex];
      const typeLower = (t.type || "").toString().trim().toLowerCase();

      const isIncome = ["income", "daromad", "kirim"].includes(typeLower);
      const isExpense = ["expense", "xarajat", "chiqim"].includes(typeLower);

      if (isIncome) {
        incomeCount++;
        revenue += amount;
        if (monthName) monthlyMap[monthName].income += amount;
        if (t.taxCategory === "turnover_taxable" || !t.taxCategory) {
          turnoverTaxableIncome += amount;
        }
      } else if (isExpense) {
        expenseCount++;
        expenses += amount;
        if (monthName) monthlyMap[monthName].expense += amount;
        
        // Expense breakdown
        const cat = t.category || "General Expense";
        categoryMap[cat] = (categoryMap[cat] || 0) + amount;

        if (t.taxCategory === "vat_deductible") {
          vatDeductibleExpenses += amount;
        }
        if (t.category?.toLowerCase()?.includes("salary") || t.category?.toLowerCase()?.includes("maosh")) {
          salaryExpenses += amount;
        }
      } else {
        unknownCount++;
        // Fallback: Default to expense if not matching income
        expenses += amount;
        if (monthName) monthlyMap[monthName].expense += amount;
      }
    });

    const netProfit = revenue - expenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Convert monthly map to list
    const monthlyHistory = monthsUz.map((m) => ({
      month: m,
      income: monthlyMap[m].income,
      expense: monthlyMap[m].expense,
    }));

    // Convert category map to list
    const expenseCategories = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat],
    }));

    // Tax Estimations based on actual rules in Uzbekistan
    const estimates = {
      turnoverTax: turnoverTaxableIncome * 0.04, // 4% Turnover tax
      vat: Math.max(0, (turnoverTaxableIncome * 0.12) - (vatDeductibleExpenses * 0.12)), // 12% VAT
      profitTax: Math.max(0, netProfit * 0.15), // 15% Profit Tax
      socialTax: salaryExpenses * 0.12, // 12% Social Tax
      incomeTax: salaryExpenses * 0.12, // 12% Personal Income Tax
    };

    // Determine the active tax regime
    const activeRegime = revenue > 1000000000 ? "general" : "turnover";
    const turnoverRegimeTotalTax = estimates.turnoverTax + estimates.socialTax + estimates.incomeTax;
    const generalRegimeTotalTax = estimates.vat + estimates.profitTax + estimates.socialTax + estimates.incomeTax;
    
    const totalEstimatedTax = activeRegime === "general" ? generalRegimeTotalTax : turnoverRegimeTotalTax;

    // 5. Financial Health Score Calculation (out of 100)
    let healthScore = 100;
    const healthBreakdown: string[] = [];

    // Indicator 1: Profitability (Rentabellik)
    if (revenue === 0 && expenses === 0) {
      healthScore -= 15;
      healthBreakdown.push("Tranzaksiyalar mavjud emas, hisob-kitoblar kutilmoqda (-15 ball)");
    } else if (netProfit < 0) {
      healthScore -= 30;
      healthBreakdown.push("Kompaniya zarar ko'rmoqda, xarajatlarni optimallashtiring (-30 ball)");
    } else if (profitMargin < 12) {
      healthScore -= 10;
      healthBreakdown.push(`Rentabellik darajasi past (${profitMargin.toFixed(1)}%), me'yor 15%+ (-10 ball)`);
    } else {
      healthBreakdown.push("Rentabellik darajasi barqaror va yuqori");
    }

    // Indicator 2: Cost-to-Income Control (Xarajatlar nazorati)
    const expenseToRev = revenue > 0 ? (expenses / revenue) * 100 : 0;
    if (revenue > 0) {
      if (expenseToRev > 85) {
        healthScore -= 20;
        healthBreakdown.push("Xarajatlar aylanmaning 85% dan yuqori, kritik holat (-20 ball)");
      } else if (expenseToRev > 65) {
        healthScore -= 10;
        healthBreakdown.push("Xarajatlar salmog'i balandroq (65%-85%), xavf ostida (-10 ball)");
      } else {
        healthBreakdown.push("Xarajatlar darajasi oqilona boshqarilmoqda");
      }
    }

    // Indicator 3: 1B UZS Tax Regime Threshold Alert (Soliq rejimi bo'sag'asi)
    // In Uzbekistan, if annual turnover is close to 1 billion UZS, company must switch from Turnover Tax (4%) to general VAT (12%) and Profit tax (15%).
    if (revenue > 800000000 && revenue <= 1000000000) {
      healthScore -= 8;
      healthBreakdown.push("Aylanma 1 mlrd so'mga yaqinlashmoqda, QQS rejimiga tayyorlaning (-8 ball)");
    } else if (revenue > 1000000000 && activeRegime === "turnover") {
      healthScore -= 15;
      healthBreakdown.push("Kritik: Aylanma 1 mlrd so'mdan oshdi, zudlik bilan umumiy soliq rejimiga o'ting (-15 ball)");
    }

    // Indicator 4: Non-Deductible Expense Risk (Chegirilmaydigan xarajatlar yuki)
    // Non-deductible expenses (e.g. without corporate cards or proper invoices) don't reduce taxable profits.
    const nonDeductibleCount = transactions.filter(t => t.taxCategory === "non_deductible_expense").length;
    if (nonDeductibleCount > 0) {
      const nonDeductibleTotal = transactions
        .filter(t => t.taxCategory === "non_deductible_expense")
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const nonDeductiblePercent = expenses > 0 ? (nonDeductibleTotal / expenses) * 100 : 0;
      
      if (nonDeductiblePercent > 15) {
        healthScore -= 12;
        healthBreakdown.push(`Chegirilmaydigan xarajatlar yuki juda yuqori (${nonDeductiblePercent.toFixed(1)}%) (-12 ball)`);
      } else if (nonDeductiblePercent > 5) {
        healthScore -= 5;
        healthBreakdown.push(`Xarajat hujjatlarida kamchiliklar bor (${nonDeductiblePercent.toFixed(1)}% chegirilmaydi) (-5 ball)`);
      }
    }

    // Indicator 5: Operating Cash Flow Stability (Pul oqimlari barqarorligi)
    const negativeCashFlowMonths = monthlyHistory.filter(m => (m.income > 0 || m.expense > 0) && (m.income - m.expense < 0)).length;
    if (negativeCashFlowMonths > 2) {
      healthScore -= 10;
      healthBreakdown.push(`Muntazam operatsion kamomad: ${negativeCashFlowMonths} ta oy salbiy balansda (-10 ball)`);
    }

    // Indicator 6: AI Audit Findings & Low Confidence Classifications (Tasniflash ishonchliligi)
    const lowConfidenceCount = transactions.filter(t => t.confidenceScore !== undefined && t.confidenceScore < 70).length;
    if (lowConfidenceCount > 0) {
      healthScore -= 10;
      healthBreakdown.push(`Noma'lum yoki shubhali tranzaksiyalar mavjud: ${lowConfidenceCount} ta (-10 ball)`);
    }

    healthScore = Math.max(10, Math.min(100, healthScore));
    let healthStatus = "Good";
    if (healthScore >= 88) healthStatus = "Excellent";
    else if (healthScore < 65) healthStatus = "Warning";

    // 6. Fetch insights from database
    let insights = await this.financialInsightModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .exec();

    // Fallback: Generate insights on the fly if DB is empty but transactions exist
    if (insights.length === 0 && transactions.length > 0) {
      try {
        const statsObj = { stats: { revenue, expenses, netProfit, profitMargin, estimatedTax: totalEstimatedTax } };
        const generated = await this.groqService.generateInsights(statsObj, transactions);
        if (generated.length > 0) {
          const insightsToSave = generated.map((ins: any) => ({
            workspaceId: new Types.ObjectId(workspaceId),
            type: ins.type || "info",
            title: ins.title || "Tahlil",
            description: ins.description || "",
            priority: ins.priority || "medium",
          }));
          await this.financialInsightModel.insertMany(insightsToSave);
          insights = await this.financialInsightModel.find({ workspaceId: new Types.ObjectId(workspaceId) }).exec();
        }
      } catch (e) {
        console.error("Failed to generate insights on the fly:", e.message);
      }
    }

    if (insights.length === 0) {
      insights = [
        {
          type: "info",
          title: "Tranzaksiyalar tahlili kutilmoqda",
          description: "Jurnalga ma'lumotlar yuklangandan so'ng, bu yerda o'sish va rentabellik to'g'risidagi AI tahlillari ko'rinadi.",
          priority: "low",
        } as any
      ];
    }

    return {
      stats: {
        revenue,
        expenses,
        netProfit,
        profitMargin: parseFloat(profitMargin.toFixed(1)),
        estimatedTax: totalEstimatedTax,
        healthScore,
        healthStatus,
        healthBreakdown,
      },
      estimates,
      monthlyHistory,
      expenseCategories,
      recentTransactions: transactions.slice(-10).reverse(),
      insights,
      debug: {
        totalCount: transactions.length,
        incomeCount,
        expenseCount,
        unknownCount,
        samples: transactions.slice(0, 5).map((t) => ({
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
        })),
      },
    };
  }

  // AI Chat Assistant
  async chatWithAi(workspaceId: string, query: string, chatHistory: any[]) {
    // 1. Get financial statistics
    const stats = await this.getStats(workspaceId);
    
    // 2. Fetch latest 50 transactions for granular context
    const transactions = await this.transactionModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ date: -1 })
      .limit(50)
      .exec();

    // 3. Prompt GROQ
    const aiResponse = await this.groqService.chat(query, stats, transactions, chatHistory);
    return { response: aiResponse };
  }
}
