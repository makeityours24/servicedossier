"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/klanten", label: "Klanten" },
  { href: "/klanten/nieuwe", label: "Nieuwe klant (dossier)" },
  { href: "/agenda", label: "Agenda" },
  { href: "/recepten", label: "Receptsjablonen" },
  { href: "/pakketten", label: "Pakketten" },
  { href: "/team", label: "Team" },
  { href: "/instellingen", label: "Instellingen" },
  { href: "/account/wachtwoord", label: "Wachtwoord" }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="navigatie">
      {links.map((link) => {
        const actief =
          pathname === link.href ||
          (link.href !== "/dashboard" && pathname.startsWith(link.href));

        return (
          <Link href={link.href} key={link.href} data-actief={actief}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
