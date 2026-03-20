import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { getCurrentLocale } from "@/lib/i18n";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap"
});

export const metadata: Metadata = {
  title: "My Style",
  description: "Digitaal klanten- en behandelingenlogboek voor kapsalons."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale}>
      <body className={montserrat.variable}>{children}</body>
    </html>
  );
}
