import Image from "next/image";
import { requireSalonSession } from "@/lib/auth";
import { AppLanguageSwitcher } from "@/components/app-language-switcher";
import { SidebarNav } from "@/components/sidebar-nav";
import { LogoutForm } from "@/components/logout-form";
import { dashboardDictionary, getCurrentLocale } from "@/lib/i18n";
import { getSalonThemeStyle } from "@/lib/salon-theme";

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSalonSession();
  const locale = await getCurrentLocale();
  const dict = dashboardDictionary[locale];
  const salonNaam = user.salon.instellingen?.weergavenaam ?? user.salon.naam;
  const salonLogo = user.salon.instellingen?.logoUrl || "/logo-salon.svg";
  const themeStyle = getSalonThemeStyle(user.salon.instellingen?.primaireKleur);

  return (
    <div className="shell" style={themeStyle}>
      <aside className="zijbalk">
        <div className="merk">
          <div className="logo-blok">
            <Image
              src={salonLogo}
              alt="Salon logo"
              width={56}
              height={56}
              className="logo-afbeelding logo-afbeelding-klein"
            />
            <div>
              <p>{dict.sidebarTagline}</p>
              <h1>{salonNaam}</h1>
            </div>
          </div>
        </div>

        <SidebarNav labels={dict.nav} />

        <div className="zijbalk-voet">
          <AppLanguageSwitcher currentLocale={locale} />

          <div className="kaart">
            <h3>{dict.loggedInAs}</h3>
            <p className="meta">
              <strong>{user.naam}</strong>
              <br />
              {user.email}
              <br />
              {salonNaam}
            </p>
          </div>

          <LogoutForm label={dict.logout} busyLabel={dict.logoutBusy} />
        </div>
      </aside>

      <main className="hoofdinhoud">
        {children}
        <p className="footer-credits">
          {dict.madeBy} <a href="https://miy24.nl" target="_blank" rel="noreferrer">miy24.nl</a>
        </p>
      </main>
    </div>
  );
}
