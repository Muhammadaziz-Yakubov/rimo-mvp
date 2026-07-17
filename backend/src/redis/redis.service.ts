import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import * as fs from "fs";
import * as path from "path";

// Persistent fallback store — survives backend restarts in development
const CACHE_FILE = path.join(process.cwd(), ".sessions-cache.json");

function loadCache(): Map<string, string> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf8");
      const obj: Record<string, string> = JSON.parse(raw);
      return new Map(Object.entries(obj));
    }
  } catch {
    // Corrupt cache — start fresh
  }
  return new Map<string, string>();
}

function saveCache(db: Map<string, string>) {
  try {
    const obj: Record<string, string> = {};
    db.forEach((v, k) => { obj[k] = v; });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj), "utf8");
  } catch {
    // Ignore write errors in development
  }
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private isOffline = true;
  private memoryDb = loadCache(); // Load persisted sessions on startup

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>("REDIS_HOST") || "127.0.0.1";
    const port = this.configService.get<number>("REDIS_PORT") || 6379;
    const password = this.configService.get<string>("REDIS_PASSWORD") || undefined;

    this.client = new Redis({
      host,
      port,
      password,
      maxRetriesPerRequest: null, // Critical for BullMQ
      retryStrategy: (times) => {
        if (times > 2) {
          console.warn("Redis is offline. Falling back to local in-memory developer database.");
          return null; // Stop reconnecting to avoid console flooding
        }
        return 1000;
      }
    });

    this.client.on("connect", () => {
      this.isOffline = false;
      console.log("Redis connected successfully.");
    });

    this.client.on("error", (error) => {
      // Intercept connection failure logs gracefully
      if (this.isOffline) {
        return;
      }
      console.error("Redis connection error:", error);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.quit();
    }
  }

  getClient(): any {
    if (this.isOffline) {
      return {
        incr: async (key: string) => {
          const val = parseInt(this.memoryDb.get(key) || "0") + 1;
          this.memoryDb.set(key, val.toString());
          saveCache(this.memoryDb);
          return val;
        },
        expire: async (_key: string, _seconds: number) => {
          return 1;
        },
        set: async (key: string, value: string, mode?: string, _seconds?: number, flag?: string) => {
          // If flag === "NX" and key exists, return null (locked)
          const actualFlag = flag || mode;
          if (actualFlag === "NX" && this.memoryDb.has(key)) {
            return null;
          }
          this.memoryDb.set(key, value);
          saveCache(this.memoryDb);
          return "OK";
        },
        del: async (key: string) => {
          const existed = this.memoryDb.has(key) ? 1 : 0;
          this.memoryDb.delete(key);
          saveCache(this.memoryDb);
          return existed;
        }
      };
    }
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    if (this.isOffline) {
      return this.memoryDb.get(key) || null;
    }
    try {
      return await this.client.get(key);
    } catch {
      return this.memoryDb.get(key) || null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<string> {
    this.memoryDb.set(key, value);
    saveCache(this.memoryDb);
    if (this.isOffline) {
      return "OK";
    }
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, "EX", ttlSeconds);
      }
      return await this.client.set(key, value);
    } catch {
      return "OK";
    }
  }

  async del(key: string): Promise<number> {
    const existed = this.memoryDb.has(key) ? 1 : 0;
    this.memoryDb.delete(key);
    saveCache(this.memoryDb);
    if (this.isOffline) {
      return existed;
    }
    try {
      return await this.client.del(key);
    } catch {
      return existed;
    }
  }

  async exists(key: string): Promise<number> {
    if (this.isOffline) {
      return this.memoryDb.has(key) ? 1 : 0;
    }
    try {
      return await this.client.exists(key);
    } catch {
      return this.memoryDb.has(key) ? 1 : 0;
    }
  }
}
