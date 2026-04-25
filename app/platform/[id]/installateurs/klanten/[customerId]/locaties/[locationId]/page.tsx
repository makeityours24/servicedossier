import Link from "next/link";
import { notFound } from "next/navigation";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { isMissingInstallateurSchemaError, loadInstallateursData } from "@/app/platform/[id]/installateurs/data";
import { formatDate, formatDateOnly } from "@/lib/utils";

type PlatformInstallateursLocatieDetailPageProps = {
  params: Promise<{ id: string; customerId: string; locationId: string }>;
};

export default async function PlatformInstallateursLocatieDetailPage({
  params
}: PlatformInstallateursLocatieDetailPageProps) {
  const { id, customerId, locationId } = await params;
  const salonId = Number(id);
  const resolvedCustomerId = Number(customerId);
  const resolvedLocationId = Number(locationId);

  if (!Number.isInteger(resolvedCustomerId) || !Number.isInteger(resolvedLocationId)) {
    notFound();
  }

  try {
    const data = await loadInstallateursData(salonId);
    const customer = data.customerAccounts.find((entry) => entry.id === resolvedCustomerId);
    const location = customer?.locations.find((entry) => entry.id === resolvedLocationId);

    if (!customer || !location) {
      notFound();
    }

    const relatedWorkOrders = customer.workOrders.filter((workOrder) => workOrder.serviceLocationId === location.id);

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="klanten">
        <section className="bovenbalk">
          <div>
            <span className="logo-label">Servicelocatie</span>
            <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
              {location.naam ?? `${location.adresregel1}, ${location.plaats}`}
            </h2>
            <p className="subtitel">
              Locatiedetail met adres, toegang, gekoppelde installaties en alle werkbonnen op deze plek.
            </p>
          </div>

          <div className="acties">
            <Link href={`/platform/${salonId}/installateurs/klanten/${customer.id}`} className="knop-zacht">
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
            <h3>Installaties</h3>
            <strong>{location.assets.length}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Werkbonnen</h3>
            <strong>{relatedWorkOrders.length}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Aangemaakt</h3>
            <strong>{formatDateOnly(location.createdAt)}</strong>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Adres en toegang</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>Adres</h4>
                <p className="meta">
                  {location.adresregel1}
                  {location.adresregel2 ? `, ${location.adresregel2}` : ""}
                  <br />
                  {location.postcode} {location.plaats}
                  <br />
                  {location.land}
                </p>
              </div>
              <div className="lijst-item">
                <h4>Locatiegegevens</h4>
                <p className="meta">
                  Naam: {location.naam || "Geen locatienaam"}
                  <br />
                  Toegevoegd op {formatDate(location.createdAt)}
                  <br />
                  Laatst bijgewerkt op {formatDate(location.updatedAt)}
                </p>
              </div>
              {location.toegangsinstructies ? (
                <div className="lijst-item">
                  <h4>Toegangsinstructies</h4>
                  <p className="meta">{location.toegangsinstructies}</p>
                </div>
              ) : null}
            </div>
            {location.locatieNotities ? (
              <div className="kaart" style={{ marginTop: 18, padding: 18 }}>
                <h4>Locatienotities</h4>
                <p className="meta" style={{ marginTop: 8 }}>{location.locatieNotities}</p>
              </div>
            ) : null}
          </article>

          <article className="kaart">
            <h3>Installaties op deze locatie</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              {location.assets.length === 0 ? (
                <div className="leeg">Nog geen installaties gekoppeld aan deze servicelocatie.</div>
              ) : (
                location.assets.map((asset) => (
                  <div className="lijst-item" key={asset.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <h4>
                        {asset.type}
                        {asset.merk || asset.model ? ` · ${[asset.merk, asset.model].filter(Boolean).join(" ")}` : ""}
                      </h4>
                      <Link
                        href={`/platform/${salonId}/installateurs/klanten/${customer.id}/installaties/${asset.id}`}
                        className="knop-zacht"
                      >
                        Open installatie
                      </Link>
                    </div>
                    <p className="meta">
                      Status: {asset.status}
                      {asset.serienummer ? ` · Serienummer: ${asset.serienummer}` : ""}
                      {asset.internNummer ? ` · Intern nr: ${asset.internNummer}` : ""}
                      {asset.plaatsingsDatum ? ` · Geplaatst op ${formatDateOnly(asset.plaatsingsDatum)}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="kaart">
          <h3>Werkbonnen op deze locatie</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {relatedWorkOrders.length === 0 ? (
              <div className="leeg">Er zijn nog geen werkbonnen op deze servicelocatie.</div>
            ) : (
              relatedWorkOrders.map((workOrder) => (
                <div className="lijst-item" key={workOrder.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h4>{workOrder.titel}</h4>
                    <div className="acties" style={{ gap: 10 }}>
                      <span className="badge">
                        {workOrder.type} · {workOrder.status}
                      </span>
                      <Link href={`/platform/${salonId}/installateurs/werkbonnen/${workOrder.id}`} className="knop-zacht">
                        Open werkbon
                      </Link>
                    </div>
                  </div>
                  <p className="meta">
                    Prioriteit: {workOrder.prioriteit}
                    {workOrder.asset ? ` · Installatie: ${workOrder.asset.type}` : ""}
                    <br />
                    Aangemaakt op {formatDate(workOrder.createdAt)}
                    {workOrder.geplandStart ? ` · Gepland vanaf ${formatDate(workOrder.geplandStart)}` : ""}
                  </p>
                  {workOrder.serviceReport ? (
                    <p className="meta" style={{ marginTop: 8 }}>
                      Servicerapport afgerond op {formatDate(workOrder.serviceReport.afgerondOp)}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
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
