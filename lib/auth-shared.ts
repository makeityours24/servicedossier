import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "salon_session";

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();

  if (!secret) {
    throw new Error("SESSION_SECRET ontbreekt.");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function verifySignedValue(value: string) {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  return payload;
}

export function createSessionValue(userId: number, sessionVersion: number) {
  const payload = `${userId}:${sessionVersion}:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string) {
  const payload = verifySignedValue(value);
  if (!payload) {
    return null;
  }

  const [userId, sessionVersion] = payload.split(":");
  const parsedUserId = Number(userId);
  const parsedSessionVersion = Number(sessionVersion);

  if (!Number.isInteger(parsedUserId) || !Number.isInteger(parsedSessionVersion)) {
    return null;
  }

  return {
    userId: parsedUserId,
    sessionVersion: parsedSessionVersion
  };
}
