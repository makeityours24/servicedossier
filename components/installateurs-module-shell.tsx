import Link from "next/link";

type InstallateursModuleShellProps = {
  salonId: number;
  salonNaam: string;
  active: "overzicht" | "klanten" | "werkbonnen" | "portaal";
  children: React.ReactNode;
};

const navigationItems = [
  { key: "overzicht", label: "Overzicht", href: "" },
  { key: "klanten", label: "Klanten", href: "/klanten" },
  { key: "werkbonnen", label: "Werkbonnen", href: "/werkbonnen" },
  { key: "portaal", label: "Portaal", href: "/portaal" }
] as const;

export function InstallateursModuleShell({
  salonId,
  salonNaam,
  active,
  children
}: InstallateursModuleShellProps) {
  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Installateurs module</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {salonNaam}
          </h2>
          <p className="subtitel">
            Demo-opzet met aparte schermen voor klanten, werkbonnen en klantportaal. Zo voelt de installateursvariant minder als pilotblad en meer als productmodule.
          </p>
        </div>

        <div className="acties">
          <Link href={`/platform/${salonId}`} className="knop-zacht">
            Terug naar tenantdetail
          </Link>
          <Link href="/platform" className="knop-secundair">
            Terug naar platform
          </Link>
        </div>
      </section>

      <section className="kaart">
        <div className="acties" style={{ gap: 12, flexWrap: "wrap" }}>
          {navigationItems.map((item) => {
            const href = `/platform/${salonId}/installateurs${item.href}`;
            const isActive = item.key === active;

            return (
              <Link
                key={item.key}
                href={href}
                className={isActive ? "knop" : "knop-zacht"}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      {children}
    </div>
  );
}
