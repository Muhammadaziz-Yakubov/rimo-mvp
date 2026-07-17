import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FinancialsController } from "./financials.controller";
import { FinancialsService } from "./financials.service";
import { GroqService } from "./groq.service";
import { Transaction, TransactionSchema } from "../schemas/transaction.schema";
import { FinancialInsight, FinancialInsightSchema } from "../schemas/financial-insight.schema";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: FinancialInsight.name, schema: FinancialInsightSchema }
    ]),
    RedisModule,
  ],
  controllers: [FinancialsController],
  providers: [FinancialsService, GroqService],
  exports: [FinancialsService, GroqService],
})
export class FinancialsModule {}
