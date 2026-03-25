import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const PORTAL_SESSION_COOKIE = "installateur_portal_session";

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

function createPortalSessionValue(portalUserId: number, sessionVersion: number) {
  const payload = `${portalUserId}:${sessionVersion}:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function verifyPortalSessionValue(value: string) {
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

  const [portalUserId, sessionVersion] = payload.split(":");
  const parsedPortalUserId = Number(portalUserId);
  const parsedSessionVersion = Number(sessionVersion);

  if (!Number.isInteger(parsedPortalUserId) || !Number.isInteger(parsedSessionVersion)) {
    return null;
  }

  return {
    portalUserId: parsedPortalUserId,
    sessionVersion: parsedSessionVersion
  };
}

export async function getPortalSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  const sessionData = verifyPortalSessionValue(session);
  if (!sessionData) {
    return null;
  }

  const portalUser = await prisma.customerPortalUser.findUnique({
    where: {
      id: sessionData.portalUserId
    },
    select: {
      id: true,
      salonId: true,
      customerAccountId: true,
      naam: true,
      email: true,
      sessionVersion: true,
      status: true,
      salon: {
        select: {
          id: true,
          naam: true,
          slug: true,
          instellingen: {
            select: {
              weergavenaam: true,
              logoUrl: true,
              primaireKleur: true
            }
          }
        }
      },
      customerAccount: {
        select: {
          id: true,
          naam: true
        }
      }
    }
  });

  if (!portalUser || portalUser.sessionVersion !== sessionData.sessionVersion || portalUser.status !== "ACTIEF") {
    await clearPortalSession();
    return null;
  }

  return portalUser;
}

export async function requirePortalSession() {
  const portalUser = await getPortalSessionUser();

  if (!portalUser) {
    redirect("/portaal/login");
  }

  return portalUser;
}

export async function setPortalSession(portalUserId: number, sessionVersion: number) {
  const cookieStore = await cookies();
  cookieStore.set(PORTAL_SESSION_COOKIE, createPortalSessionValue(portalUserId, sessionVersion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearPortalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PORTAL_SESSION_COOKIE);
}
