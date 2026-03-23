import { NextResponse } from "next/server";
import { requireSalonSession } from "@/lib/auth";
import { normalizeBranchType } from "@/lib/branch-profile";
import { getCustomerImportTemplate } from "@/lib/customer-import";
import { getCurrentLocale } from "@/lib/i18n";

export async function GET() {
  const [user, locale] = await Promise.all([requireSalonSession(), getCurrentLocale()]);
  const branchType = normalizeBranchType(user.salon.instellingen?.branchType);
  const template = getCustomerImportTemplate(locale, branchType);

  return new NextResponse(template.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${template.fileName}"`,
      "Cache-Control": "no-store"
    }
  });
}
