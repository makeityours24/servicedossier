import Image from "next/image";
import { requireSalonSession } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { LogoutForm } from "@/components/logout-form";

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSalonSession();
  const salonNaam = user.salon.instellingen?.weergavenaam ?? user.salon.naam;
  const salonLogo = user.salon.instellingen?.logoUrl || "/logo-salon.svg";

  return (
    <div className="shell">
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
              <p>Professioneel salonbeheer</p>
              <h1>{salonNaam}</h1>
            </div>
          </div>
        </div>

        <SidebarNav />

        <div className="zijbalk-voet">
          <div className="kaart">
            <h3>Ingelogd als</h3>
            <p className="meta">
              <strong>{user.naam}</strong>
              <br />
              {user.email}
              <br />
              {salonNaam}
            </p>
          </div>

          <LogoutForm />
        </div>
      </aside>

      <main className="hoofdinhoud">
        {children}
        <p className="footer-credits">
          Gemaakt door <a href="https://miy24.nl" target="_blank" rel="noreferrer">miy24.nl</a>
        </p>
      </main>
    </div>
  );
}
