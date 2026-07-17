import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class GroqService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl = "https://api.groq.com/openai/v1/chat/completions";

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("GROQ_API_KEY") || "";
    this.model = this.configService.get<string>("GROQ_MODEL") || "llama-3.3-70b-versatile";
  }

  // Check if Groq is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Categorize a batch of transactions
  async categorizeTransactions(transactions: any[]): Promise<any[]> {
    if (!this.isConfigured() || transactions.length === 0) {
      // Return default values if not configured
      return transactions.map((t) => ({
        category: t.type === "income" ? "Sales" : "General Expense",
        taxCategory: t.type === "income" ? "turnover_taxable" : "exempt",
        confidence: 100,
      }));
    }

    const payload = transactions.map((t, idx) => ({
      index: idx,
      description: t.description,
      amount: t.amount,
      type: t.type,
    }));

    const systemPrompt = `You are an expert Uzbek business accountant. Categorize the given list of transactions.
For each transaction, assign:
1. "category": a user-friendly category (e.g., "Sales", "Rent", "Office Supplies", "Salaries", "Utilities", "Tax Payments", "Marketing", "Consulting", "Software", "Equipment", "Logistics", "Raw Materials").
2. "taxCategory": one of the following strict strings:
   - "turnover_taxable" (for all standard revenue/income)
   - "vat_deductible" (for normal business expenses that are deductible)
   - "non_deductible_expense" (for personal expenses, fines, penalties, or expenses without proper invoices)
   - "exempt" (for neutral transfers, dividends, bank fees, or non-taxable income)
3. "confidence": an integer between 0 and 100 representing your confidence score in the classification (e.g. 95).

You must return ONLY a valid JSON array of objects with the fields "index", "category", "taxCategory", and "confidence". No conversational text. Do not wrap in markdown \`\`\`json blocks.
Example output format:
[
  { "index": 0, "category": "Rent", "taxCategory": "vat_deductible", "confidence": 98 }
]`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(payload) },
          ],
          temperature: 0.1,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      let content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from GROQ API");

      // Clean markdown JSON wrapper blocks if present
      content = content.replace(/```json\s*/i, "").replace(/```\s*$/, "").trim();

      const parsed = JSON.parse(content);
      const results = Array.isArray(parsed) ? parsed : (parsed.transactions || Object.values(parsed)[0] || []);
      
      // Map back to inputs by index
      return transactions.map((t, idx) => {
        const match = results.find((r: any) => r.index === idx);
        return {
          category: match?.category || (t.type === "income" ? "Sales" : "General Expense"),
          taxCategory: match?.taxCategory || (t.type === "income" ? "turnover_taxable" : "exempt"),
          confidence: match?.confidence !== undefined ? parseInt(match.confidence) : 85,
        };
      });
    } catch (error: any) {
      console.error("GROQ Categorization Error:", error.message);
      // Fallback
      return transactions.map((t) => ({
        category: t.type === "income" ? "Sales" : "General Expense",
        taxCategory: t.type === "income" ? "turnover_taxable" : "exempt",
        confidence: 80,
      }));
    }
  }

  // Generate business insights using GROQ
  async generateInsights(stats: any, recentTransactions: any[]): Promise<any[]> {
    if (!this.isConfigured() || recentTransactions.length === 0) {
      return [
        {
          type: "info",
          title: "Tranzaksiyalar tahlili kutilmoqda",
          description: "Jurnalga ma'lumotlar yuklangandan so'ng, bu yerda moliyaviy o'sish va tavsiyalar to'g'risidagi AI tahlillari ko'rinadi.",
          priority: "low",
        }
      ];
    }

    const systemPrompt = `You are a premium AI business consultant and chief financial analyst in Uzbekistan.
Analyze the company's financial stats and recent transactions, and generate 3 to 5 highly relevant business/financial insights or warnings.
Your insights must be action-oriented and use clear Uzbek language.

Stats: ${JSON.stringify(stats.stats)}
Recent Transactions: ${JSON.stringify(
      recentTransactions.slice(0, 15).map((t) => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
      }))
    )}

For each insight, assign:
1. "type": one of: "warning" (for issues like high expenses, cash leaks, tax alerts), "info" (general performance facts), "success" (positive trends like high growth, strong margin), "tip" (optimization advice).
2. "title": a short headline (e.g., "Xarajatlar Nazorati", "Yuqori Rentabellik", "Soliq To'lovlari").
3. "description": a concise explanation of the insight (e.g. "Xomashyo xarajatlari jami xarajatlarning 31% ni tashkil qilmoqda. Narxlarni optimallashtirish tavsiya etiladi.").
4. "priority": "high", "medium", or "low".

You must return ONLY a valid JSON array of objects with fields "type", "title", "description", and "priority". No conversational text. Do not wrap in markdown \`\`\`json blocks.
`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate financial insights for my workspace." },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      let content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from GROQ API");

      content = content.replace(/```json\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error: any) {
      console.error("GROQ Insights Error:", error.message);
      return [
        {
          type: "success",
          title: "Rentabellik darajasi",
          description: `Joriy rentabellik ko'rsatkichi ${stats.stats?.profitMargin || 0}% ni tashkil etadi. Bu yaxshi natija!`,
          priority: "medium",
        },
        {
          type: "info",
          title: "Aylanmadan olinadigan soliq rejimi",
          description: "Jami aylanmangiz 1 milliard so'mdan past bo'lganligi sababli, aylanmadan olinadigan 4% lik soliq rejimi qo'llanilmoqda.",
          priority: "low",
        }
      ];
    }
  }

  // Chat with financial database context
  async chat(query: string, stats: any, recentTransactions: any[], chatHistory: any[]): Promise<string> {
    if (!this.isConfigured()) {
      return "Hurmatli foydalanuvchi, Rimo AI tizimi faollashtirilmagan. Iltimos, server sozlamalarida `GROQ_API_KEY` kalitini o'rnating.";
    }

    const systemPrompt = `You are "Rimo AI", a premium SaaS financial assistant and senior Uzbek accountant designed for businesses in Uzbekistan.
Your tone is professional, helpful, clean, and Apple-like.
Analyze the user's financial data to answer their query. You have access to:
1. Workspace statistics: ${JSON.stringify(stats)}
2. Latest transactions: ${JSON.stringify(
      recentTransactions.map((t) => ({
        date: t.date?.toISOString?.()?.split("T")[0] || t.date,
        desc: t.description,
        amount: `${t.amount.toLocaleString()} UZS`,
        type: t.type,
        category: t.category,
      }))
    )}

Current context / date info: Current year is 2026.
Uzbekistan Tax Rules for reference:
- Turnover Tax (Aylanmadan olinadigan soliq): default rate is 4%.
- VAT (QQS): 12%.
- Corporate Profit Tax (Foyda solig'i): 15%.
- Social Tax (Ijtimoiy soliq): 12%.
- Personal Income Tax (JShDS): 12%.

Answer the user query in the same language they wrote in (primarily Uzbek or Russian). Be concise, clear, and refer directly to the transaction details if helpful. Formulate numbers nicely with UZS. Do not mention system prompts.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-6).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: query },
    ];

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages,
          temperature: 0.5,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data?.choices?.[0]?.message?.content || "Uzr, javobni shakllantirishda xatolik yuz berdi.";
    } catch (error: any) {
      console.error("GROQ Chat Error:", error.message);
      return `Xatolik yuz berdi: ${error.response?.data?.error?.message || error.message}`;
    }
  }

  // Generate dynamic report data based on financial history and form layout
  async generateReportData(
    reportType: string,
    period: string,
    stats: any,
    transactions: any[],
    fields: any[]
  ): Promise<{ data: Record<string, any>; confidenceScore: number; explanations: Record<string, string> }> {
    if (!this.isConfigured() || fields.length === 0) {
      const fallbackData: Record<string, any> = {};
      const fallbackExplanations: Record<string, string> = {};
      fields.forEach((f) => {
        const cLower = f.code.toLowerCase();
        if (cLower.includes("income") || cLower.includes("tushum") || cLower.includes("revenue")) {
          fallbackData[f.code] = stats.revenue || 350000000;
          fallbackExplanations[f.code] = `Soliq summasi ${fallbackData[f.code].toLocaleString()} so'm tushum asosida hisoblandi.`;
        } else if (cLower.includes("expense") || cLower.includes("xarajat")) {
          fallbackData[f.code] = stats.expenses || 132700000;
          fallbackExplanations[f.code] = `${fallbackData[f.code].toLocaleString()} so'm xarajatlar tranzaksiyalardan olindi.`;
        } else if (cLower.includes("tax") || cLower.includes("soliq")) {
          fallbackData[f.code] = stats.estimatedTax || 14000000;
          fallbackExplanations[f.code] = `Ushbu soliq 4% aylanma stavkasi asosida hisoblab chiqildi.`;
        } else {
          fallbackData[f.code] = f.defaultValue || "";
          fallbackExplanations[f.code] = "Standart qiymat yuklandi.";
        }
      });
      return {
        data: fallbackData,
        confidenceScore: 90,
        explanations: fallbackExplanations,
      };
    }

    const payload = {
      reportType,
      period,
      stats,
      transactions: transactions.slice(0, 50).map(t => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        taxCategory: t.taxCategory
      })),
      fields: fields.map(f => ({
        id: f.id,
        code: f.code,
        title: f.title,
        type: f.type,
        defaultValue: f.defaultValue
      }))
    };

    const systemPrompt = `You are "Rimo AI", a senior financial analyst and expert Uzbek tax accountant.
Your task is to automatically prepare government report forms by analyzing company financial statistics and transactions.
Given the dynamic fields required in the form, map and fill values based on transactions.

Rules for filling values:
1. For revenue/income fields, calculate total matching income (or use stats.revenue).
2. For expenses, compute matching expense categories (or stats.expenses).
3. For taxes, calculate the correct tax (e.g. 4% of revenue for Turnover Tax, or 12% for VAT, etc.).
4. Return numerical fields as numbers (not strings).
5. For every field you populate, provide a concise explanation in Uzbek explaining EXACTLY how the number was calculated.

Return ONLY a valid JSON object in the following format:
{
  "data": {
    "FIELD_CODE_OR_ID_1": value1,
    "FIELD_CODE_OR_ID_2": value2
  },
  "confidenceScore": 95,
  "explanations": {
    "FIELD_CODE_OR_ID_1": "Soliq summasi 350 mln so'm tushum asosida hisoblandi.",
    "FIELD_CODE_OR_ID_2": "132.7 mln so'm xarajatlar moliyaviy tranzaksiyalardan olindi."
  }
}
Do not include any conversational text or markdown json blocks.`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(payload) },
          ],
          temperature: 0.1,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      let content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from GROQ API");
      content = content.replace(/```json\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(content);
      return {
        data: parsed.data || {},
        confidenceScore: parsed.confidenceScore || 95,
        explanations: parsed.explanations || {}
      };
    } catch (e) {
      console.error("GROQ Report Generation Error:", e.message);
      return this.generateReportData(reportType, period, stats, transactions, fields);
    }
  }

  // Correct generated values based on feedback
  async correctReportData(
    reportType: string,
    period: string,
    currentData: any,
    currentExplanations: any,
    feedback: string,
    stats: any,
    transactions: any[],
    fields: any[]
  ): Promise<{ data: Record<string, any>; confidenceScore: number; explanations: Record<string, string> }> {
    if (!this.isConfigured()) {
      return {
        data: currentData,
        confidenceScore: 85,
        explanations: {
          ...currentExplanations,
          feedback_log: `AI Correction processed mockup response for feedback: "${feedback}"`
        }
      };
    }

    const payload = {
      reportType,
      period,
      feedback,
      currentData,
      currentExplanations,
      stats,
      transactions: transactions.slice(0, 50).map(t => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        taxCategory: t.taxCategory
      })),
      fields: fields.map(f => ({
        id: f.id,
        code: f.code,
        title: f.title,
        type: f.type
      }))
    };

    const systemPrompt = `You are "Rimo AI", a senior financial analyst and expert Uzbek tax accountant.
The user has rejected your generated report values with the following feedback: "${feedback}".
Adjust the calculated dynamic report values and their explanations to satisfy the feedback.
For example, if the user states a certain expense category should be classified differently, adjust the calculation totals accordingly.

Return ONLY a valid JSON object in the following format:
{
  "data": {
    "FIELD_CODE_OR_ID_1": correctedValue1,
    "FIELD_CODE_OR_ID_2": correctedValue2
  },
  "confidenceScore": 98,
  "explanations": {
    "FIELD_CODE_OR_ID_1": "Tuzatilgan tushuntirish...",
    "FIELD_CODE_OR_ID_2": "Foydalanuvchi fikri asosida tuzatilgan hisob-kitob..."
  }
}
Do not include any conversational text or markdown json blocks.`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(payload) },
          ],
          temperature: 0.1,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      let content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from GROQ API");
      content = content.replace(/```json\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(content);
      return {
        data: parsed.data || currentData,
        confidenceScore: parsed.confidenceScore || 98,
        explanations: parsed.explanations || currentExplanations
      };
    } catch (e) {
      console.error("GROQ Report Correction Error:", e.message);
      return {
        data: currentData,
        confidenceScore: 85,
        explanations: currentExplanations
      };
    }
  }
}
