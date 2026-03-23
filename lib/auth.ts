import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { SESSION_COOKIE, createSessionValue, verifySessionValue } from "@/lib/auth-shared";
export { hashPassword, needsPasswordRehash, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const sessionUserSelect = {
  id: true,
  salonId: true,
  isPlatformAdmin: true,
  naam: true,
  email: true,
  sessionVersion: true,
  moetWachtwoordWijzigen: true,
  rol: true,
  status: true,
  salon: {
    select: {
      id: true,
      naam: true,
      email: true,
      telefoonnummer: true,
      adres: true,
      slug: true,
      status: true,
      instellingen: {
        select: {
          weergavenaam: true,
          branchType: true,
          logoUrl: true,
          primaireKleur: true,
          contactEmail: true,
          contactTelefoon: true,
          adres: true,
          treatmentPresets: true
        }
      }
    }
  }
} satisfies Prisma.UserSelect;

type SessionUser = Prisma.UserGetPayload<{ select: typeof sessionUserSelect }>;
type SalonSessionUser = SessionUser & {
  salonId: number;
  salon: NonNullable<SessionUser["salon"]>;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  const sessionData = verifySessionValue(session);
  if (!sessionData) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionData.userId },
    select: sessionUserSelect
  });

  if (!user || user.sessionVersion !== sessionData.sessionVersion) {
    await clearSession();
    return null;
  }

  return user;
}

export async function requireSession(options?: { allowPasswordChange?: boolean }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  if (user.moetWachtwoordWijzigen && !options?.allowPasswordChange) {
    redirect("/account/wachtwoord");
  }

  return user;
}

export async function requireSalonSession() {
  const user = await requireSession();
  if (user.isPlatformAdmin) {
    redirect("/platform");
  }

  if (!user.salon || !user.salonId) {
    redirect("/login");
  }

  if (user.salon.status === "GEPAUZEERD") {
    await clearSession();
    redirect(`/login?salon=${user.salon.slug}&fout=gepauzeerd`);
  }

  return user as SalonSessionUser;
}

export async function requirePlatformAdmin() {
  const user = await requireSession();
  if (!user.isPlatformAdmin) {
    redirect("/dashboard");
  }

  return user;
}

export async function setSession(userId: number, sessionVersion: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(userId, sessionVersion), {
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
