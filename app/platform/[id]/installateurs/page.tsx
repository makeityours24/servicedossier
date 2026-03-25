import Link from "next/link";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { formatDate, formatDateOnly } from "@/lib/utils";
import { isMissingInstallateurSchemaError, loadInstallateursData } from "@/app/platform/[id]/installateurs/data";

type PlatformInstallateursOverviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformInstallateursOverviewPage({
  params
}: PlatformInstallateursOverviewPageProps) {
  const { id } = await params;
  const salonId = Number(id);

  try {
    const data = await loadInstallateursData(salonId);
    const latestCustomers = data.customerAccounts.slice(0, 3);
    const latestWorkOrders = data.customerAccounts
      .flatMap((customer) =>
        customer.workOrders.map((workOrder) => ({
          customerName: customer.naam,
          workOrder
        }))
      )
      .sort((left, right) => right.workOrder.createdAt.getTime() - left.workOrder.createdAt.getTime())
      .slice(0, 4);

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="overzicht">
        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Installateurklanten</h3>
            <strong>{data.customerAccounts.length}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Servicelocaties</h3>
            <strong>{data.totalLocations}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Installaties</h3>
            <strong>{data.totalAssets}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Werkbonnen</h3>
            <strong>{data.totalWorkOrders}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Inplanningen</h3>
            <strong>{data.totalAssignments}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Portaalaanvragen</h3>
            <strong>{data.totalAppointmentRequests}</strong>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Module-indeling</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Dit overzicht is nu opgesplitst in echte schermen. Voor een demo kun je vanaf hier gericht naar klanten, werkbonnen en het portaal springen in plaats van alles op één lange pilotpagina te laten zien.
            </p>
            <div className="acties" style={{ marginTop: 18, gap: 12 }}>
              <Link href={`/platform/${salonId}/installateurs/klanten`} className="knop">
                Klanten en locaties
              </Link>
              <Link href={`/platform/${salonId}/installateurs/werkbonnen`} className="knop-zacht">
                Werkbonnen en service
              </Link>
              <Link href={`/platform/${salonId}/installateurs/portaal`} className="knop-zacht">
                Portaal en aanvragen
              </Link>
            </div>
          </article>

          <article className="kaart">
            <h3>Wat je nu kunt laten zien</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>Klantstructuur</h4>
                <p className="meta">Bedrijven en particulieren met losse servicelocaties en installaties.</p>
              </div>
              <div className="lijst-item">
                <h4>Operationele flow</h4>
                <p className="meta">Werkbon, monteurtoewijzing, servicerapport en media in dezelfde keten.</p>
              </div>
              <div className="lijst-item">
                <h4>Klantportaal</h4>
                <p className="meta">Portalgebruikers, 3 voorkeursblokken en plannerbevestiging richting werkbon.</p>
              </div>
            </div>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3>Laatste klanten</h3>
              <Link href={`/platform/${salonId}/installateurs/klanten`} className="knop-zacht">
                Open klanten
              </Link>
            </div>
            <div className="lijst" style={{ marginTop: 18 }}>
              {latestCustomers.length === 0 ? (
                <div className="leeg">Er zijn nog geen installateurklanten toegevoegd.</div>
              ) : (
                latestCustomers.map((customer) => (
                  <div className="lijst-item" key={customer.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <h4>{customer.naam}</h4>
                      <span className="badge">
                        {customer.locations.length} locatie(s) · {customer.assets.length} installatie(s)
                      </span>
                    </div>
                    <p className="meta">
                      {customer.type === "BEDRIJF" ? "Bedrijf" : "Particulier"}
                      {customer.telefoon ? ` · ${customer.telefoon}` : ""}
                      {customer.email ? ` · ${customer.email}` : ""}
                    </p>
                    <p className="meta" style={{ marginTop: 8 }}>
                      Laatst bijgewerkt op {formatDate(customer.updatedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="kaart">
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3>Recente werkbonnen</h3>
              <Link href={`/platform/${salonId}/installateurs/werkbonnen`} className="knop-zacht">
                Open werkbonnen
              </Link>
            </div>
            <div className="lijst" style={{ marginTop: 18 }}>
              {latestWorkOrders.length === 0 ? (
                <div className="leeg">Er zijn nog geen werkbonnen aangemaakt.</div>
              ) : (
                latestWorkOrders.map(({ customerName, workOrder }) => (
                  <div className="lijst-item" key={workOrder.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <h4>{workOrder.titel}</h4>
                      <span className="badge">
                        {workOrder.type} · {workOrder.status}
                      </span>
                    </div>
                    <p className="meta">
                      {customerName}
                      <br />
                      {workOrder.serviceLocation.naam ?? `${workOrder.serviceLocation.adresregel1}, ${workOrder.serviceLocation.plaats}`}
                      <br />
                      Aangemaakt op {formatDate(workOrder.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3>Portaalaanvragen</h3>
              <Link href={`/platform/${salonId}/installateurs/portaal`} className="knop-zacht">
                Open portaal
              </Link>
            </div>
            <div className="lijst" style={{ marginTop: 18 }}>
              {data.appointmentRequests.length === 0 ? (
                <div className="leeg">Er zijn nog geen portaalaanvragen binnengekomen.</div>
              ) : (
                data.appointmentRequests.slice(0, 4).map((request) => (
                  <div className="lijst-item" key={request.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <h4>{request.customerAccount.naam}</h4>
                      <span className="badge">{request.status}</span>
                    </div>
                    <p className="meta">
                      {request.type} · {request.portalUser.naam}
                      <br />
                      {request.serviceLocation.naam ?? `${request.serviceLocation.adresregel1}, ${request.serviceLocation.plaats}`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="kaart">
            <h3>Demo-aanpak</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>1. Klanten</h4>
                <p className="meta">Laat eerst klant, locatie en installatie zien voor een heldere objectstructuur.</p>
              </div>
              <div className="lijst-item">
                <h4>2. Werkbon</h4>
                <p className="meta">Toon daarna planning, servicerapport en media als operationele ruggengraat.</p>
              </div>
              <div className="lijst-item">
                <h4>3. Portaal</h4>
                <p className="meta">Sluit af met klantlogin en afspraakaanvraag met 3 voorkeursblokken.</p>
              </div>
            </div>
            <p className="meta" style={{ marginTop: 18 }}>
              Portal login: <Link href={data.portalBaseUrl} className="link-tekst">{data.portalBaseUrl}</Link>
            </p>
            {latestCustomers[0] ? (
              <p className="meta" style={{ marginTop: 12 }}>
                Eerste demo-tenant bijgewerkt op {formatDateOnly(latestCustomers[0].updatedAt)}.
              </p>
            ) : null}
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
