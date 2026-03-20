import { headers } from "next/headers";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LoginForm } from "@/components/login-form";
import { getCurrentLocale, loginDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type LoginPageProps = {
  searchParams: Promise<{
    salon?: string;
    fout?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const locale = await getCurrentLocale();
  const dict = loginDictionary[locale];
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
      ? dict.pausedError
      : params.fout === "niet-gevonden"
        ? dict.notFoundError
        : undefined;

  const redirectPath = `/login${params.salon || params.fout ? `?${new URLSearchParams(
    Object.entries({
      ...(params.salon ? { salon: params.salon } : {}),
      ...(params.fout ? { fout: params.fout } : {})
    })
  ).toString()}` : ""}`;

  return (
    <main className="inlog-scherm">
      <div className="container" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <LanguageSwitcher currentLocale={locale} redirectPath={redirectPath} />
      </div>
      <LoginForm
        salonSlug={tenantGedetecteerd ? salonSlug : slugUitQuery || undefined}
        salonNaam={salon?.instellingen?.weergavenaam ?? salon?.naam ?? "SalonDossier"}
        logoUrl={salon?.instellingen?.logoUrl}
        tenantGedetecteerd={tenantGedetecteerd}
        presetError={presetError}
        dictionary={dict}
      />
    </main>
  );
}
