import { createHash, randomBytes } from "crypto";
import { getAppUrl } from "@/lib/app-url";

const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TTL_MINUTES = 60;

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetToken(now = new Date()) {
  const token = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
  const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TTL_MINUTES * 60_000);

  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expiresAt
  };
}

export function getPasswordResetTokenError(params: {
  exists: boolean;
  usedAt?: Date | null;
  expiresAt?: Date | null;
  now?: Date;
}) {
  if (!params.exists || !params.expiresAt) {
    return "Deze resetlink is ongeldig of verlopen.";
  }

  if (params.usedAt) {
    return "Deze resetlink is ongeldig of verlopen.";
  }

  if (params.expiresAt <= (params.now ?? new Date())) {
    return "Deze resetlink is ongeldig of verlopen.";
  }

  return null;
}

export function getPasswordResetUrl(token: string) {
  const baseUrl = (process.env.PASSWORD_RESET_URL_BASE?.trim() || getAppUrl()).replace(/\/+$/, "");
  return `${baseUrl}/wachtwoord-reset?token=${encodeURIComponent(token)}`;
}
