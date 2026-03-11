"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/klanten", label: "Klanten" },
  { href: "/klanten/nieuwe", label: "Nieuwe klant" }
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
