import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./auth/auth.module";
import { IntegrationModule } from "./integration/integration.module";
import { WorkflowModule } from "./workflow/workflow.module";
import { AuthoritiesModule } from "./authorities/authorities.module";
import { ReportsModule } from "./reports/reports.module";
import { FinancialsModule } from "./financials/financials.module";

// Import schemas
import { User, UserSchema } from "./schemas/user.schema";
import { Workspace, WorkspaceSchema } from "./schemas/workspace.schema";
import { WorkspaceMember, WorkspaceMemberSchema } from "./schemas/workspace-member.schema";
import { Authority, AuthoritySchema } from "./schemas/authority.schema";
import { Task, TaskSchema } from "./schemas/task.schema";
import { TaskLog, TaskLogSchema } from "./schemas/task-log.schema";
import { ApiLog, ApiLogSchema } from "./schemas/api-log.schema";
import { Notification, NotificationSchema } from "./schemas/notification.schema";
import { AuditLog, AuditLogSchema } from "./schemas/audit-log.schema";
import { Transaction, TransactionSchema } from "./schemas/transaction.schema";
import { FinancialInsight, FinancialInsightSchema } from "./schemas/financial-insight.schema";

@Module({
  imports: [
    // Config configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Redis global module
    RedisModule,

    // Auth module
    AuthModule,

    // Integration module
    IntegrationModule,

    // Workflow module
    WorkflowModule,

    // Authorities module
    AuthoritiesModule,

    // Reports module
    ReportsModule,

    // Financials module
    FinancialsModule,

    // MongoDB connection setup
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI") || "mongodb://localhost:27017/soliqly",
      }),
    }),

    // Register models globally for dependency injection
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
      { name: Authority.name, schema: AuthoritySchema },
      { name: Task.name, schema: TaskSchema },
      { name: TaskLog.name, schema: TaskLogSchema },
      { name: ApiLog.name, schema: ApiLogSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: FinancialInsight.name, schema: FinancialInsightSchema },
    ]),

    // Rate Limiting: max 100 requests within 60 seconds
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Enable rate limit guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
