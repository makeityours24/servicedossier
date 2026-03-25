import Link from "next/link";
import { notFound } from "next/navigation";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { isMissingInstallateurSchemaError, loadInstallateursData } from "@/app/platform/[id]/installateurs/data";
import { formatDate, formatDateOnly } from "@/lib/utils";

type PlatformInstallateursInstallatieDetailPageProps = {
  params: Promise<{ id: string; customerId: string; assetId: string }>;
};

export default async function PlatformInstallateursInstallatieDetailPage({
  params
}: PlatformInstallateursInstallatieDetailPageProps) {
  const { id, customerId, assetId } = await params;
  const salonId = Number(id);
  const resolvedCustomerId = Number(customerId);
  const resolvedAssetId = Number(assetId);

  if (!Number.isInteger(resolvedCustomerId) || !Number.isInteger(resolvedAssetId)) {
    notFound();
  }

  try {
    const data = await loadInstallateursData(salonId);
    const customer = data.customerAccounts.find((entry) => entry.id === resolvedCustomerId);
    const asset = customer?.assets.find((entry) => entry.id === resolvedAssetId);

    if (!customer || !asset) {
      notFound();
    }

    const location = customer.locations.find((entry) => entry.id === asset.serviceLocationId);
    const relatedWorkOrders = customer.workOrders.filter((workOrder) => workOrder.assetId === asset.id);

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="klanten">
        <section className="bovenbalk">
          <div>
            <span className="logo-label">Installatie</span>
            <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
              {asset.type}
              {asset.merk || asset.model ? ` · ${[asset.merk, asset.model].filter(Boolean).join(" ")}` : ""}
            </h2>
            <p className="subtitel">
              Objectdetail met serienummer, status, servicelocatie en werkhistorie op installatieniveau.
            </p>
          </div>

          <div className="acties">
            {location ? (
              <Link
                href={`/platform/${salonId}/installateurs/klanten/${customer.id}/locaties/${location.id}`}
                className="knop-zacht"
              >
                Terug naar locatie
              </Link>
            ) : null}
            <Link href={`/platform/${salonId}/installateurs/klanten/${customer.id}`} className="knop-secundair">
              Terug naar klant
            </Link>
          </div>
        </section>

        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Klant</h3>
            <strong>{customer.naam}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Status</h3>
            <strong>{asset.status}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Werkbonnen</h3>
            <strong>{relatedWorkOrders.length}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Laatste onderhoud</h3>
            <strong>{asset.laatsteOnderhoudDatum ? formatDateOnly(asset.laatsteOnderhoudDatum) : "Onbekend"}</strong>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Objectgegevens</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>Specificaties</h4>
                <p className="meta">
                  Type: {asset.type}
                  <br />
                  Merk: {asset.merk || "Niet ingevuld"}
                  <br />
                  Model: {asset.model || "Niet ingevuld"}
                  <br />
                  Status: {asset.status}
                </p>
              </div>
              <div className="lijst-item">
                <h4>Registratie</h4>
                <p className="meta">
                  Serienummer: {asset.serienummer || "Niet ingevuld"}
                  <br />
                  Intern nummer: {asset.internNummer || "Niet ingevuld"}
                  <br />
                  Geplaatst op: {asset.plaatsingsDatum ? formatDateOnly(asset.plaatsingsDatum) : "Onbekend"}
                  <br />
                  Garantie tot: {asset.garantieTot ? formatDateOnly(asset.garantieTot) : "Onbekend"}
                </p>
              </div>
              {location ? (
                <div className="lijst-item">
                  <h4>Servicelocatie</h4>
                  <p className="meta">
                    {location.naam ?? `${location.adresregel1}, ${location.plaats}`}
                    <br />
                    {location.adresregel1}
                    <br />
                    {location.postcode} {location.plaats}
                  </p>
                </div>
              ) : null}
            </div>
            {asset.omschrijving ? (
              <div className="kaart" style={{ marginTop: 18, padding: 18 }}>
                <h4>Omschrijving</h4>
                <p className="meta" style={{ marginTop: 8 }}>{asset.omschrijving}</p>
              </div>
            ) : null}
            {asset.notities ? (
              <div className="kaart" style={{ marginTop: 18, padding: 18 }}>
                <h4>Notities</h4>
                <p className="meta" style={{ marginTop: 8 }}>{asset.notities}</p>
              </div>
            ) : null}
          </article>

          <article className="kaart">
            <h3>Werkhistorie</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              {relatedWorkOrders.length === 0 ? (
                <div className="leeg">Nog geen werkbonnen gekoppeld aan deze installatie.</div>
              ) : (
                relatedWorkOrders.map((workOrder) => (
                  <div className="lijst-item" key={workOrder.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <h4>{workOrder.titel}</h4>
                      <span className="badge">
                        {workOrder.type} · {workOrder.status}
                      </span>
                    </div>
                    <p className="meta">
                      Prioriteit: {workOrder.prioriteit}
                      <br />
                      Aangemaakt op {formatDate(workOrder.createdAt)}
                    </p>
                    {workOrder.serviceReport ? (
                      <div className="kaart" style={{ marginTop: 12, padding: 18 }}>
                        <h4>Laatste servicerapport</h4>
                        <p className="meta">
                          Afgerond op {formatDate(workOrder.serviceReport.afgerondOp)}
                          {workOrder.serviceReport.ingevuldDoorUser
                            ? ` · Door ${workOrder.serviceReport.ingevuldDoorUser.naam}`
                            : ""}
                        </p>
                        <p className="meta" style={{ marginTop: 8 }}>
                          <strong>Werkzaamheden:</strong> {workOrder.serviceReport.werkzaamhedenUitgevoerd}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </InstallateursModuleShell>
    );
  } catch (error) {
    if (!isMissingInstallateurSchemaError(error)) {
      throw error;
    }

    return <InstallateursSchemaFallback />;
  }
}
