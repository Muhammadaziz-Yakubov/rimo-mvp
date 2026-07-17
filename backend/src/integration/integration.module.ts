import { Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GovApiClient } from "./gov-api.client";
import { ApiLog, ApiLogSchema } from "../schemas/api-log.schema";
import { Authority, AuthoritySchema } from "../schemas/authority.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApiLog.name, schema: ApiLogSchema },
      { name: Authority.name, schema: AuthoritySchema },
    ]),
  ],
  providers: [GovApiClient],
  exports: [GovApiClient],
})
export class IntegrationModule {}
