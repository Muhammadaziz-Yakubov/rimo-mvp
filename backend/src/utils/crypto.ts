import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // IV is 12 bytes for GCM
const TAG_LENGTH = 16; // Auth tag is 16 bytes

// Retrieve key from environment or fallback to local development key (must be 32 bytes)
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || "soliqly-development-encryption-key-32-bytes";
  if (key.length < 32) {
    // If key is too short, pad it
    return Buffer.from(key.padEnd(32, "0").substring(0, 32));
  }
  return Buffer.from(key.substring(0, 32));
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Package as IV + AuthTag + Encrypted text, separated by colons
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted credentials format.");
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];
    
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("AES credential decryption failed:", error);
    throw new Error("Decryption failed. Please check encryption key configuration.");
  }
}
