import Link from "next/link";
import { notFound } from "next/navigation";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { isMissingInstallateurSchemaError, loadInstallateursData } from "@/app/platform/[id]/installateurs/data";
import { formatDate, formatDateOnly } from "@/lib/utils";

type PlatformInstallateursKlantDetailPageProps = {
  params: Promise<{ id: string; customerId: string }>;
};

export default async function PlatformInstallateursKlantDetailPage({
  params
}: PlatformInstallateursKlantDetailPageProps) {
  const { id, customerId } = await params;
  const salonId = Number(id);
  const resolvedCustomerId = Number(customerId);

  if (!Number.isInteger(resolvedCustomerId)) {
    notFound();
  }

  try {
    const data = await loadInstallateursData(salonId);
    const customer = data.customerAccounts.find((entry) => entry.id === resolvedCustomerId);

    if (!customer) {
      notFound();
    }

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="klanten">
        <section className="bovenbalk">
          <div>
            <span className="logo-label">Klantdetail</span>
            <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
              {customer.naam}
            </h2>
            <p className="subtitel">
              Volledig klantbeeld met servicelocaties, installaties, werkbonnen en portaltoegang.
            </p>
          </div>

          <div className="acties">
            <Link href={`/platform/${salonId}/installateurs/klanten`} className="knop-zacht">
              Terug naar klanten
            </Link>
          </div>
        </section>

        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Klanttype</h3>
            <strong>{customer.type === "BEDRIJF" ? "Bedrijf" : "Particulier"}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Servicelocaties</h3>
            <strong>{customer.locations.length}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Installaties</h3>
            <strong>{customer.assets.length}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Werkbonnen</h3>
            <strong>{customer.workOrders.length}</strong>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Klantgegevens</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>Contact</h4>
                <p className="meta">
                  {customer.telefoon || "Geen telefoon"}
                  <br />
                  {customer.email || "Geen e-mailadres"}
                  <br />
                  {customer.factuurEmail || "Geen factuur e-mailadres"}
                </p>
              </div>
              <div className="lijst-item">
                <h4>Zakelijke gegevens</h4>
                <p className="meta">
                  Klantnummer: {customer.klantnummer || "Niet ingevuld"}
                  <br />
                  KvK: {customer.kvkNummer || "Niet ingevuld"}
                  <br />
                  BTW: {customer.btwNummer || "Niet ingevuld"}
                </p>
              </div>
              <div className="lijst-item">
                <h4>Historie</h4>
                <p className="meta">
                  Aangemaakt op {formatDate(customer.createdAt)}
                  <br />
                  Laatst bijgewerkt op {formatDate(customer.updatedAt)}
                </p>
              </div>
            </div>
            {customer.notities ? (
              <div className="kaart" style={{ marginTop: 18, padding: 18 }}>
                <h4>Notities</h4>
                <p className="meta" style={{ marginTop: 8 }}>{customer.notities}</p>
              </div>
            ) : null}
          </article>

          <article className="kaart">
            <h3>Portaltoegang</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              {customer.customerPortalUsers.length === 0 ? (
                <div className="leeg">Nog geen portalaccounts aangemaakt voor deze klant.</div>
              ) : (
                customer.customerPortalUsers.map((portalUser) => (
                  <div className="lijst-item" key={portalUser.id}>
                    <h4>{portalUser.naam}</h4>
                    <p className="meta">
                      {portalUser.email} · {portalUser.status}
                      <br />
                      Portalaccount aangemaakt op {formatDate(portalUser.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="kaart">
          <h3>Servicelocaties en installaties</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {customer.locations.length === 0 ? (
              <div className="leeg">Nog geen servicelocaties gekoppeld aan deze klant.</div>
            ) : (
              customer.locations.map((location) => (
                <div className="lijst-item" key={location.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h4>{location.naam ?? `${location.adresregel1}, ${location.plaats}`}</h4>
                    <div className="acties" style={{ gap: 10 }}>
                      <span className="badge">{location.assets.length} installatie(s)</span>
                      <Link
                        href={`/platform/${salonId}/installateurs/klanten/${customer.id}/locaties/${location.id}`}
                        className="knop-zacht"
                      >
                        Open locatie
                      </Link>
                    </div>
                  </div>
                  <p className="meta">
                    {location.adresregel1}
                    {location.adresregel2 ? `, ${location.adresregel2}` : ""}
                    <br />
                    {location.postcode} {location.plaats} · {location.land}
                    <br />
                    Toegevoegd op {formatDateOnly(location.createdAt)}
                  </p>
                  {location.toegangsinstructies ? (
                    <p className="meta" style={{ marginTop: 8 }}>
                      <strong>Toegang:</strong> {location.toegangsinstructies}
                    </p>
                  ) : null}
                  {location.assets.length > 0 ? (
                    <div className="lijst" style={{ marginTop: 12 }}>
                      {location.assets.map((asset) => (
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
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="kaart">
          <h3>Werkbonnen en servicerapporten</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {customer.workOrders.length === 0 ? (
              <div className="leeg">Er zijn nog geen werkbonnen voor deze klant.</div>
            ) : (
              customer.workOrders.map((workOrder) => (
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
                    Locatie: {workOrder.serviceLocation.naam ?? `${workOrder.serviceLocation.adresregel1}, ${workOrder.serviceLocation.plaats}`}
                    <br />
                    Prioriteit: {workOrder.prioriteit}
                    {workOrder.asset
                      ? ` · Installatie: ${workOrder.asset.type}${workOrder.asset.merk || workOrder.asset.model ? ` (${[workOrder.asset.merk, workOrder.asset.model].filter(Boolean).join(" ")})` : ""}`
                      : ""}
                    <br />
                    Aangemaakt op {formatDate(workOrder.createdAt)}
                  </p>

                  {workOrder.assignments.length > 0 ? (
                    <div className="lijst" style={{ marginTop: 12 }}>
                      {workOrder.assignments.map((assignment) => (
                        <div className="lijst-item" key={assignment.id}>
                          <h4>{assignment.user.naam}</h4>
                          <p className="meta">
                            {assignment.rolOpOpdracht} · {assignment.status}
                            <br />
                            {formatDate(assignment.geplandStart)} - {formatDate(assignment.geplandEinde)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {workOrder.serviceReport ? (
                    <div className="kaart" style={{ marginTop: 14, padding: 18 }}>
                      <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                        <h4>Servicerapport</h4>
                        <span className="badge">
                          {workOrder.serviceReport.vervolgActieNodig ? "Vervolgactie nodig" : "Afgerond"}
                        </span>
                      </div>
                      <p className="meta">
                        Afgerond op {formatDate(workOrder.serviceReport.afgerondOp)}
                        {workOrder.serviceReport.ingevuldDoorUser ? ` · Door ${workOrder.serviceReport.ingevuldDoorUser.naam}` : ""}
                      </p>
                      <p className="meta" style={{ marginTop: 8 }}>
                        <strong>Werkzaamheden:</strong> {workOrder.serviceReport.werkzaamhedenUitgevoerd}
                      </p>
                      {workOrder.serviceReport.bevindingen ? (
                        <p className="meta" style={{ marginTop: 8 }}>
                          <strong>Bevindingen:</strong> {workOrder.serviceReport.bevindingen}
                        </p>
                      ) : null}
                      {workOrder.serviceReport.advies ? (
                        <p className="meta" style={{ marginTop: 8 }}>
                          <strong>Advies:</strong> {workOrder.serviceReport.advies}
                        </p>
                      ) : null}
                    </div>
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
