import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCsvRow, formatDate } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get("customerId");

  const behandelingen = await prisma.treatment.findMany({
    where: customerId ? { customerId: Number(customerId) } : undefined,
    include: {
      customer: true
    },
    orderBy: [{ datum: "desc" }, { id: "desc" }]
  });

  const rows = [
    buildCsvRow([
      "Klant",
      "Telefoonnummer",
      "Adres",
      "Datum",
      "Behandeling",
      "Recept",
      "Behandelaar",
      "Notities"
    ]),
    ...behandelingen.map((behandeling) =>
      buildCsvRow([
        behandeling.customer.naam,
        behandeling.customer.telefoonnummer,
        behandeling.customer.adres,
        formatDate(behandeling.datum),
        behandeling.behandeling,
        behandeling.recept,
        behandeling.behandelaar,
        behandeling.notities ?? ""
      ])
    )
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="salon-export.csv"`
    }
  });
}
