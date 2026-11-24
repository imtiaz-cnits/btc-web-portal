import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { getProjectRoot } from "@/lib/upload";
import {
  EmailRecipientDirectory,
  MAIN_SENDER_EMAIL,
  getDefaultEmailDirectory,
  sanitizeEmailList,
} from "@/lib/defaultEmailRecipients";

export interface StoredEmailConfig extends EmailRecipientDirectory {
  customAppPassword?: string;
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function getDirectoryFilePath(): string {
  return path.join(getProjectRoot(), "data", "email-recipients.json");
}

export async function syncEmailSettingsToEnv(
  mainEmail: string,
  appPassword?: string,
): Promise<void> {
  const cleanEmail = mainEmail.trim().toLowerCase();
  const cleanPass = (appPassword || "").replace(/\s+/g, "").trim();

  // Immediately update in-memory process.env so live & local work without restart
  process.env.SMTP_USER = cleanEmail;
  if (cleanPass) {
    process.env.GMAIL_APP_PASSWORD = cleanPass;
  }

  const envPath = path.join(getProjectRoot(), ".env");
  try {
    let content = "";
    try {
      content = await readFile(envPath, "utf-8");
    } catch {
      content = "";
    }

    const newline = content.includes("\r\n") ? "\r\n" : "\n";
    const lines = content ? content.split(/\r?\n/) : [];

    const upsertEnvKey = (key: string, value: string) => {
      const escaped = `"${value.replace(/"/g, "")}"`;
      const idx = lines.findIndex((line) =>
        new RegExp(`^\\s*${key}\\s*=`).test(line),
      );
      if (idx !== -1) {
        lines[idx] = `${key}=${escaped}`;
      } else {
        lines.push(`${key}=${escaped}`);
      }
    };

    upsertEnvKey("SMTP_USER", cleanEmail);
    if (cleanPass) {
      upsertEnvKey("GMAIL_APP_PASSWORD", cleanPass);
    }

    await writeFile(envPath, lines.join(newline), "utf-8");
  } catch (err) {
    console.error("Failed to sync email settings to .env:", err);
  }
}

export async function readStoredEmailConfig(): Promise<StoredEmailConfig> {
  const defaults = getDefaultEmailDirectory();
  const filePath = getDirectoryFilePath();
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const savedMain =
      typeof parsed?.mainEmail === "string" && isValidEmail(parsed.mainEmail)
        ? parsed.mainEmail.trim().toLowerCase()
        : MAIN_SENDER_EMAIL;
    return {
      mainEmail: savedMain,
      bank: Array.isArray(parsed?.bank)
        ? sanitizeEmailList(parsed.bank)
        : defaults.bank,
      tenderer: Array.isArray(parsed?.tenderer)
        ? sanitizeEmailList(parsed.tenderer)
        : defaults.tenderer,
      customAppPassword:
        typeof parsed?.customAppPassword === "string"
          ? parsed.customAppPassword.replace(/\s+/g, "").trim()
          : "",
    };
  } catch {
    try {
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify(defaults, null, 2), "utf-8");
    } catch {
      // Non-fatal if filesystem is read-only
    }
    return { ...defaults, customAppPassword: "" };
  }
}

export async function writeStoredEmailConfig(
  config: StoredEmailConfig,
): Promise<boolean> {
  const filePath = getDirectoryFilePath();
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save email recipients file:", err);
    return false;
  }
}

export function toPublicDirectory(
  config: StoredEmailConfig,
): EmailRecipientDirectory {
  return {
    mainEmail: config.mainEmail,
    bank: config.bank,
    tenderer: config.tenderer,
  };
}
