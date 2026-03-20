"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/klanten", key: "customers" },
  { href: "/klanten/nieuwe", key: "newCustomer" },
  { href: "/agenda", key: "agenda" },
  { href: "/recepten", key: "recipes" },
  { href: "/pakketten", key: "packages" },
  { href: "/team", key: "team" },
  { href: "/instellingen", key: "settings" },
  { href: "/account/wachtwoord", key: "password" }
];

type SidebarNavProps = {
  labels: Record<string, string>;
};

export function SidebarNav({ labels }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="navigatie">
      {links.map((link) => {
        const actief =
          pathname === link.href ||
          (link.href !== "/dashboard" && pathname.startsWith(link.href));

        return (
          <Link href={link.href} key={link.href} data-actief={actief}>
            {labels[link.key] ?? link.key}
          </Link>
        );
      })}
    </nav>
  );
}
