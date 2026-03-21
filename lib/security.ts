import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_BLOCK_MINUTES = 15;
const SENSITIVE_ACTION_WINDOW_MINUTES = 10;
const SENSITIVE_ACTION_MAX_ATTEMPTS = 12;
const SENSITIVE_ACTION_BLOCK_MINUTES = 10;

function subtractMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() - minutes * 60_000);
}

export function getNextThrottleState(params: {
  currentWindowStart?: Date | null;
  currentAttemptCount?: number;
  now?: Date;
  windowMinutes: number;
  maxAttempts: number;
  blockMinutes: number;
}) {
  const now = params.now ?? new Date();
  const inCurrentWindow =
    Boolean(params.currentWindowStart) &&
    params.currentWindowStart! > subtractMinutes(now, params.windowMinutes);
  const nextCount = inCurrentWindow ? (params.currentAttemptCount ?? 0) + 1 : 1;

  return {
    nextCount,
    windowStart: inCurrentWindow && params.currentWindowStart ? params.currentWindowStart : now,
    blockedUntil:
      nextCount >= params.maxAttempts
        ? new Date(now.getTime() + params.blockMinutes * 60_000)
        : null
  };
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

  const nextState = getNextThrottleState({
    currentWindowStart: current?.windowStart,
    currentAttemptCount: current?.attemptCount,
    now,
    windowMinutes: LOGIN_WINDOW_MINUTES,
    maxAttempts: LOGIN_MAX_ATTEMPTS,
    blockMinutes: LOGIN_BLOCK_MINUTES
  });

  await prisma.loginThrottle.upsert({
    where: { key: params.key },
    update: {
      email: params.email.toLowerCase(),
      ipAddress: params.ipAddress,
      salonSlug: params.salonSlug || null,
      attemptCount: nextState.nextCount,
      windowStart: nextState.windowStart,
      blockedUntil: nextState.blockedUntil,
      lastAttemptAt: now
    },
    create: {
      key: params.key,
      email: params.email.toLowerCase(),
      ipAddress: params.ipAddress,
      salonSlug: params.salonSlug || null,
      attemptCount: 1,
      windowStart: nextState.windowStart,
      blockedUntil: nextState.blockedUntil,
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

function buildSensitiveActionThrottleKey(params: {
  action: string;
  actorUserId?: number | null;
  salonId?: number | null;
  ipAddress: string;
}) {
  return [
    params.action,
    params.actorUserId ?? "anonymous",
    params.salonId ?? "global",
    params.ipAddress
  ].join("::");
}

export async function assertSensitiveActionAllowed(params: {
  action: string;
  actorUserId?: number | null;
  salonId?: number | null;
  ipAddress: string;
}) {
  const key = buildSensitiveActionThrottleKey(params);
  const throttle = await prisma.actionThrottle.findUnique({
    where: { key }
  });

  if (throttle?.blockedUntil && throttle.blockedUntil > new Date()) {
    return {
      allowed: false as const,
      key,
      error: "Te veel gevoelige wijzigingen in korte tijd. Probeer het over enkele minuten opnieuw."
    };
  }

  return { allowed: true as const, key };
}

export async function registerSensitiveActionAttempt(params: {
  key: string;
  action: string;
  actorUserId?: number | null;
  salonId?: number | null;
  ipAddress: string;
}) {
  const now = new Date();
  const current = await prisma.actionThrottle.findUnique({
    where: { key: params.key }
  });

  const nextState = getNextThrottleState({
    currentWindowStart: current?.windowStart,
    currentAttemptCount: current?.attemptCount,
    now,
    windowMinutes: SENSITIVE_ACTION_WINDOW_MINUTES,
    maxAttempts: SENSITIVE_ACTION_MAX_ATTEMPTS,
    blockMinutes: SENSITIVE_ACTION_BLOCK_MINUTES
  });

  await prisma.actionThrottle.upsert({
    where: { key: params.key },
    update: {
      action: params.action,
      actorUserId: params.actorUserId ?? null,
      salonId: params.salonId ?? null,
      ipAddress: params.ipAddress,
      attemptCount: nextState.nextCount,
      windowStart: nextState.windowStart,
      blockedUntil: nextState.blockedUntil,
      lastAttemptAt: now
    },
    create: {
      key: params.key,
      action: params.action,
      actorUserId: params.actorUserId ?? null,
      salonId: params.salonId ?? null,
      ipAddress: params.ipAddress,
      attemptCount: nextState.nextCount,
      windowStart: nextState.windowStart,
      blockedUntil: nextState.blockedUntil,
      lastAttemptAt: now
    }
  });
}

export async function clearSensitiveActionThrottle(key: string) {
  await prisma.actionThrottle.deleteMany({
    where: { key }
  });
}

export async function revokeUserSessions(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      sessionVersion: {
        increment: 1
      }
    },
    select: {
      sessionVersion: true
    }
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
