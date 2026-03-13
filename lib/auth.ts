import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, createSessionValue, verifySessionValue } from "@/lib/auth-shared";
import { prisma } from "@/lib/prisma";

export function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;
type SalonSessionUser = SessionUser & {
  salonId: number;
  salon: NonNullable<SessionUser["salon"]>;
};

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
      salonId: true,
      isPlatformAdmin: true,
      naam: true,
      email: true,
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
    }
  });
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
