import { headers } from "next/headers";
import { InstallateurPortalLoginForm } from "@/components/installateur-portal-login-form";
import { prisma } from "@/lib/prisma";
import { getSalonThemeStyle } from "@/lib/salon-theme";

type PortalLoginPageProps = {
  searchParams: Promise<{
    salon?: string;
    fout?: string;
  }>;
};

export default async function PortalLoginPage({ searchParams }: PortalLoginPageProps) {
  const params = await searchParams;
  const headerStore = await headers();
  const slugUitHeader = headerStore.get("x-tenant-slug")?.trim().toLowerCase() ?? "";
  const slugUitQuery = params.salon?.trim().toLowerCase() ?? "";
  const salonSlug = slugUitHeader || slugUitQuery;

  const salon = salonSlug
    ? await prisma.salon.findUnique({
        where: { slug: salonSlug },
        select: {
          naam: true,
          instellingen: {
            select: {
              weergavenaam: true,
              logoUrl: true,
              primaireKleur: true
            }
          }
        }
      })
    : null;

  const themeStyle = getSalonThemeStyle(salon?.instellingen?.primaireKleur);
  const presetError = params.fout === "uitgelogd" ? undefined : undefined;

  return (
    <main className="inlog-scherm" style={themeStyle}>
      <InstallateurPortalLoginForm
        salonSlug={salonSlug || undefined}
        salonNaam={salon?.instellingen?.weergavenaam ?? salon?.naam ?? "Klantportaal"}
        logoUrl={salon?.instellingen?.logoUrl}
        presetError={presetError}
      />
    </main>
  );
}
