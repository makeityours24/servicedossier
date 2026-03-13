import { headers } from "next/headers";
import { LoginForm } from "@/components/login-form";
import { prisma } from "@/lib/prisma";

type LoginPageProps = {
  searchParams: Promise<{
    salon?: string;
    fout?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const headerStore = await headers();
  const slugUitHeader = headerStore.get("x-tenant-slug")?.trim().toLowerCase() ?? "";
  const slugUitQuery = params.salon?.trim().toLowerCase() ?? "";
  const salonSlug = slugUitHeader || slugUitQuery;

  const salon = salonSlug
    ? await prisma.salon.findUnique({
        where: { slug: salonSlug },
        select: {
          status: true,
          naam: true,
          instellingen: {
            select: {
              weergavenaam: true,
              logoUrl: true
            }
          }
        }
      })
    : null;

  const tenantGedetecteerd = Boolean(salonSlug && salon);
  const presetError =
    params.fout === "gepauzeerd"
      ? "Deze salon is tijdelijk gepauzeerd. Neem contact op met de beheerder."
      : params.fout === "niet-gevonden"
        ? "Deze saloncode is niet gevonden."
        : undefined;

  return (
    <main className="inlog-scherm">
      <LoginForm
        salonSlug={tenantGedetecteerd ? salonSlug : slugUitQuery || undefined}
        salonNaam={salon?.instellingen?.weergavenaam ?? salon?.naam ?? "SalonDossier"}
        logoUrl={salon?.instellingen?.logoUrl}
        tenantGedetecteerd={tenantGedetecteerd}
        presetError={presetError}
      />
    </main>
  );
}
