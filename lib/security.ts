import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_BLOCK_MINUTES = 15;

function subtractMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() - minutes * 60_000);
}

export async function getRequestIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
}

function buildThrottleKey(email: string, ipAddress: string, salonSlug: string) {
  return `${email.toLowerCase()}::${ipAddress}::${salonSlug || "centraal"}`;
}

export async function assertLoginAllowed(params: {
  email: string;
  ipAddress: string;
  salonSlug?: string;
}) {
  const key = buildThrottleKey(params.email, params.ipAddress, params.salonSlug ?? "");
  const throttle = await prisma.loginThrottle.findUnique({
    where: { key }
  });

  if (throttle?.blockedUntil && throttle.blockedUntil > new Date()) {
    return {
      allowed: false as const,
      error:
        "Te veel mislukte inlogpogingen. Probeer het over 15 minuten opnieuw of neem contact op met de beheerder."
    };
  }

  return { allowed: true as const, key };
}

export async function registerFailedLogin(params: {
  key: string;
  email: string;
  ipAddress: string;
  salonSlug?: string;
}) {
  const now = new Date();
  const current = await prisma.loginThrottle.findUnique({
    where: { key: params.key }
  });

  const inCurrentWindow =
    current && current.windowStart > subtractMinutes(now, LOGIN_WINDOW_MINUTES);
  const nextCount = inCurrentWindow ? current.attemptCount + 1 : 1;
  const blockedUntil =
    nextCount >= LOGIN_MAX_ATTEMPTS
      ? new Date(now.getTime() + LOGIN_BLOCK_MINUTES * 60_000)
      : null;

  await prisma.loginThrottle.upsert({
    where: { key: params.key },
    update: {
      email: params.email.toLowerCase(),
      ipAddress: params.ipAddress,
      salonSlug: params.salonSlug || null,
      attemptCount: nextCount,
      windowStart: inCurrentWindow && current ? current.windowStart : now,
      blockedUntil,
      lastAttemptAt: now
    },
    create: {
      key: params.key,
      email: params.email.toLowerCase(),
      ipAddress: params.ipAddress,
      salonSlug: params.salonSlug || null,
      attemptCount: 1,
      windowStart: now,
      blockedUntil,
      lastAttemptAt: now
    }
  });
}

export async function clearLoginThrottle(params: {
  email: string;
  ipAddress: string;
  salonSlug?: string;
}) {
  const key = buildThrottleKey(params.email, params.ipAddress, params.salonSlug ?? "");

  await prisma.loginThrottle.deleteMany({
    where: { key }
  });
}

export async function createAuditLog(params: {
  salonId?: number | null;
  actorUserId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  message?: string;
  ipAddress?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      salonId: params.salonId ?? null,
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId !== undefined && params.entityId !== null ? String(params.entityId) : null,
      message: params.message ?? null,
      ipAddress: params.ipAddress ?? null,
      metadata: params.metadata
    }
  });
}
