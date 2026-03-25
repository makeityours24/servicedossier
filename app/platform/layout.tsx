import { requirePlatformAdmin } from "@/lib/core/auth";
import { LogoutForm } from "@/components/logout-form";

export default async function PlatformLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePlatformAdmin();

  return (
    <div className="shell">
      <aside className="zijbalk">
        <div className="merk">
          <p>Platformbeheer</p>
          <h1>Salon Platform</h1>
        </div>

        <nav className="navigatie">
          <a href="/platform" data-actief="true">
            Overzicht
          </a>
          <a href="/account/wachtwoord" data-actief="false">
            Wachtwoord
          </a>
        </nav>

        <div className="zijbalk-voet">
          <div className="kaart">
            <h3>Ingelogd als</h3>
            <p className="meta">
              <strong>{user.naam}</strong>
              <br />
              {user.email}
            </p>
          </div>
          <LogoutForm label="Uitloggen" busyLabel="Afmelden..." />
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
