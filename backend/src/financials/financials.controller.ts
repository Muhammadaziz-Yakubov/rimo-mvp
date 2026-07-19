import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FinancialsService } from "./financials.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("financials")
@UseGuards(AuthGuard)
export class FinancialsController {
  constructor(private financialsService: FinancialsService) {}

  // Excel / CSV File Import
  @Post("import")
  @UseInterceptors(FileInterceptor("file"))
  async importFile(
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    if (!file) {
      throw new Error("Fayl yuklanmadi. Iltimos Excel yoki CSV fayl yuboring.");
    }
    return this.financialsService.importTransactions(
      req.workspaceId,
      file.buffer,
      file.originalname
    );
  }

  // Get transactions lists
  @Get("transactions")
  async getTransactions(
    @Req() req: any,
    @Query("type") type?: string,
    @Query("category") category?: string,
    @Query("taxCategory") taxCategory?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.financialsService.getTransactions(req.workspaceId, {
      type,
      category,
      taxCategory,
      startDate,
      endDate,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // Clear all transactions
  @Delete("transactions/clear")
  @HttpCode(HttpStatus.OK)
  async clearTransactions(@Req() req: any) {
    return this.financialsService.clearTransactions(req.workspaceId);
  }

  // Get stats for CEO dashboard
  @Get("stats")
  async getStats(
    @Req() req: any,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    return this.financialsService.getStats(req.workspaceId, { startDate, endDate });
  }

  // AI chat assistant query
  @Post("ai-chat")
  @HttpCode(HttpStatus.OK)
  async chatWithAi(
    @Req() req: any,
    @Body() body: { query: string; history?: any[] }
  ) {
    if (!body.query) {
      throw new Error("Savol matni kiritilmadi.");
    }
    return this.financialsService.chatWithAi(req.workspaceId, body.query, body.history || []);
  }

  // Add transactions via unstructured Uzbek text analysis
  @Post("transactions/ai-add")
  @HttpCode(HttpStatus.CREATED)
  async addTransactionsViaAi(
    @Req() req: any,
    @Body() body: { text: string; type: "income" | "expense" }
  ) {
    if (!body.text) {
      throw new BadRequestException("Matn kiritilmadi.");
    }
    if (!body.type || !["income", "expense"].includes(body.type)) {
      throw new BadRequestException("Tranzaksiya turi noto'g'ri tanlangan.");
    }
    return this.financialsService.addTransactionsViaAi(req.workspaceId, body.text, body.type);
  }
}
