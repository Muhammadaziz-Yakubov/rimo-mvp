import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthoritiesService } from "./authorities.service";
import { AuthoritiesController } from "./authorities.controller";
import { Authority, AuthoritySchema } from "../schemas/authority.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Authority.name, schema: AuthoritySchema }]),
  ],
  providers: [AuthoritiesService],
  controllers: [AuthoritiesController],
  exports: [AuthoritiesService],
})
export class AuthoritiesModule {}
