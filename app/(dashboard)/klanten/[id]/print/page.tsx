import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type PrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PrintPage({ params }: PrintPageProps) {
  const user = await requireSalonSession();
  const { id } = await params;
  const klantId = Number(id);

  if (!Number.isInteger(klantId)) {
    notFound();
  }

  const klant = await prisma.customer.findFirst({
    where: {
      id: klantId,
      salonId: user.salonId
    },
    include: {
      behandelingen: {
        where: { salonId: user.salonId },
        orderBy: { datum: "asc" }
      }
    }
  });

  if (!klant) {
    notFound();
  }

  return (
    <div className="container pagina" style={{ padding: "28px 0 40px" }}>
      <div className="print-balk geen-print">
        <div>
          <span className="logo-label">Afdrukweergave</span>
          <h1 className="pagina-titel" style={{ fontSize: "2.3rem" }}>
            Behandelhistorie van {klant.naam}
          </h1>
          <p className="subtitel">{user.salon.instellingen?.weergavenaam ?? user.salon.naam}</p>
        </div>

        <PrintButton />
      </div>

      <section className="kaart">
        <h2>{klant.naam}</h2>
        <p className="meta">
          {klant.adres}
          <br />
          {klant.telefoonnummer}
        </p>

        <table className="tafel" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Behandeling</th>
              <th>Recept</th>
              <th>Behandelaar</th>
              <th>Notities</th>
            </tr>
          </thead>
          <tbody>
            {klant.behandelingen.map((behandeling) => (
              <tr key={behandeling.id}>
                <td>{formatDate(behandeling.datum)}</td>
                <td>{behandeling.behandeling}</td>
                <td>{behandeling.recept}</td>
                <td>{behandeling.behandelaar}</td>
                <td>{behandeling.notities || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
