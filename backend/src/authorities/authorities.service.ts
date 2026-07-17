import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Authority, AuthorityDocument } from "../schemas/authority.schema";
import { GovApiClient } from "../integration/gov-api.client";

@Injectable()
export class AuthoritiesService {
  constructor(
    @InjectModel(Authority.name) private authorityModel: Model<AuthorityDocument>,
    private govApiClient: GovApiClient
  ) {}

  // List connected authorities in workspace
  async list(workspaceId: string) {
    return this.authorityModel.find({ workspaceId: new Types.ObjectId(workspaceId) }).exec();
  }

  // Get single authority details in workspace
  async getDetails(id: string, workspaceId: string) {
    const authority = await this.authorityModel.findOne({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    }).exec();

    if (!authority) {
      throw new NotFoundException("Connected authority not found in this workspace.");
    }

    return authority;
  }

  // Force credentials re-sync with government API
  async sync(id: string, sessionToken: string, workspaceId: string) {
    const authority = await this.getDetails(id, workspaceId);
    
    try {
      await this.authorityModel.updateOne({ _id: authority._id }, { connectionStatus: "syncing" });

      // Request fresh lists from gov server to test credential health
      const govAuthorities = await this.govApiClient.request(
        {
          method: "GET",
          url: "/integration/v2/authorities",
        },
        sessionToken,
        workspaceId
      );

      // Successfully synced
      await this.authorityModel.updateOne(
        { _id: authority._id },
        { connectionStatus: "connected", lastSyncAt: new Date() }
      );

      return { success: true, count: govAuthorities.length };
    } catch (e) {
      // synching error
      await this.authorityModel.updateOne({ _id: authority._id }, { connectionStatus: "error" });
      throw e;
    }
  }
}
