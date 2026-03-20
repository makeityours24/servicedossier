"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

type AppLanguageSwitcherProps = {
  currentLocale: Locale;
};

export function AppLanguageSwitcher({ currentLocale }: AppLanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const redirectPath = `${pathname}${query ? `?${query}` : ""}`;

  return <LanguageSwitcher currentLocale={currentLocale} redirectPath={redirectPath} />;
}
