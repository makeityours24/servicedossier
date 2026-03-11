import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, createSessionValue, verifySessionValue } from "@/lib/auth-shared";
import { prisma } from "@/lib/prisma";

export function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  const userId = verifySessionValue(session);
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      naam: true,
      email: true
    }
  });
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function setSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
