import { portalLogoutAction, submitAppointmentRequestAction } from "@/app/portaal/actions";
import { PortalAppointmentRequestForm } from "@/components/portal-appointment-request-form";
import { requirePortalSession } from "@/lib/installateurs/portal-auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateOnly } from "@/lib/utils";

export default async function PortaalDashboardPage() {
  const portalUser = await requirePortalSession();

  const customerAccount = await prisma.customerAccount.findFirst({
    where: {
      id: portalUser.customerAccountId,
      salonId: portalUser.salonId
    },
    include: {
      locations: {
        include: {
          assets: {
            orderBy: [{ createdAt: "desc" }]
          },
          workOrders: {
            include: {
              serviceReport: true
            },
            orderBy: [{ createdAt: "desc" }],
            take: 12
          }
        },
        orderBy: [{ createdAt: "desc" }]
      },
      appointmentRequests: {
        include: {
          preferences: {
            orderBy: [{ voorkeurNummer: "asc" }]
          },
          gekozenVoorkeur: true,
          workOrder: {
            select: {
              id: true,
              titel: true
            }
          }
        },
        orderBy: [{ createdAt: "desc" }],
        take: 12
      }
    }
  });

  if (!customerAccount) {
    return null;
  }

  const salonNaam = portalUser.salon.instellingen?.weergavenaam ?? portalUser.salon.naam;
  const totalLocations = customerAccount.locations.length;
  const totalAssets = customerAccount.locations.reduce((count, location) => count + location.assets.length, 0);
  const totalWorkOrders = customerAccount.locations.reduce((count, location) => count + location.workOrders.length, 0);
  const totalReports = customerAccount.locations.reduce(
    (count, location) => count + location.workOrders.filter((workOrder) => workOrder.serviceReport).length,
    0
  );

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Klantportaal</span>
          <h1 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Welkom, {portalUser.naam}
          </h1>
          <p className="subtitel">
            U bekijkt uw dossier bij {salonNaam}. Hieronder ziet u uw locaties, installaties en recente serviceactiviteiten.
          </p>
        </div>

        <div className="acties">
          <form action={portalLogoutAction}>
            <button type="submit" className="knop-zacht">
              Uitloggen
            </button>
          </form>
        </div>
      </section>

      <section className="statistieken">
        <article className="stat-kaart">
          <h3>Klant</h3>
          <strong>{customerAccount.naam}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Locaties</h3>
          <strong>{totalLocations}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Installaties</h3>
          <strong>{totalAssets}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Werkbonnen</h3>
          <strong>{totalWorkOrders}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Servicerapporten</h3>
          <strong>{totalReports}</strong>
        </article>
      </section>

      <section className="kaart">
        <h3>Afspraak aanvragen</h3>
        <p className="meta" style={{ marginTop: 10 }}>
          Kies drie voorkeursmomenten van 2 uur. De installateur bevestigt daarna het definitieve tijdslot.
        </p>
        <div style={{ marginTop: 18 }}>
          <PortalAppointmentRequestForm
            locations={customerAccount.locations.map((location) => ({
              id: location.id,
              label: location.naam ?? `${location.adresregel1}, ${location.plaats}`,
              assets: location.assets.map((asset) => ({
                id: asset.id,
                label: asset.merk || asset.model ? `${asset.type} · ${[asset.merk, asset.model].filter(Boolean).join(" ")}` : asset.type
              }))
            }))}
            action={submitAppointmentRequestAction}
          />
        </div>
      </section>

      <section className="kaart">
        <h3>Mijn aanvragen</h3>
        <div className="lijst" style={{ marginTop: 18 }}>
          {customerAccount.appointmentRequests.length === 0 ? (
            <div className="leeg">U heeft nog geen afspraakaanvragen verstuurd.</div>
          ) : (
            customerAccount.appointmentRequests.map((request) => (
              <div className="lijst-item" key={request.id}>
                <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <h4>{request.type}</h4>
                  <span className="badge">{request.status}</span>
                </div>
                <p className="meta">{request.toelichting}</p>
                <div className="lijst" style={{ marginTop: 12 }}>
                  {request.preferences.map((preference) => (
                    <div className="lijst-item" key={preference.id}>
                      <p className="meta">
                        Voorkeur {preference.voorkeurNummer}: {formatDateOnly(preference.datum)} · {formatDate(preference.startTijd)} - {formatDate(preference.eindTijd)}
                      </p>
                    </div>
                  ))}
                </div>
                {request.gekozenVoorkeur ? (
                  <p className="meta" style={{ marginTop: 8 }}>
                    <strong>Bevestigd:</strong> {formatDateOnly(request.gekozenVoorkeur.datum)} · {formatDate(request.gekozenVoorkeur.startTijd)} - {formatDate(request.gekozenVoorkeur.eindTijd)}
                    {request.workOrder ? ` · Werkbon: ${request.workOrder.titel}` : ""}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="kaart">
        <h3>Mijn locaties</h3>
        <div className="lijst" style={{ marginTop: 18 }}>
          {customerAccount.locations.length === 0 ? (
            <div className="leeg">Er zijn nog geen locaties gekoppeld aan uw account.</div>
          ) : (
            customerAccount.locations.map((location) => (
              <div className="lijst-item" key={location.id}>
                <h4>{location.naam ?? `${location.adresregel1}, ${location.plaats}`}</h4>
                <p className="meta">
                  {location.adresregel1}
                  {location.adresregel2 ? `, ${location.adresregel2}` : ""}
                  <br />
                  {location.postcode} {location.plaats}
                </p>

                {location.assets.length > 0 ? (
                  <div className="lijst" style={{ marginTop: 12 }}>
                    {location.assets.map((asset) => (
                      <div className="lijst-item" key={asset.id}>
                        <h4>
                          {asset.type}
                          {asset.merk || asset.model ? ` · ${[asset.merk, asset.model].filter(Boolean).join(" ")}` : ""}
                        </h4>
                        <p className="meta">
                          Status: {asset.status}
                          {asset.serienummer ? ` · Serienummer: ${asset.serienummer}` : ""}
                          {asset.plaatsingsDatum ? ` · Geplaatst op ${formatDateOnly(asset.plaatsingsDatum)}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {location.workOrders.length > 0 ? (
                  <div className="lijst" style={{ marginTop: 12 }}>
                    {location.workOrders.map((workOrder) => (
                      <div className="lijst-item" key={workOrder.id}>
                        <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                          <h4>{workOrder.titel}</h4>
                          <span className="badge">
                            {workOrder.type} · {workOrder.status}
                          </span>
                        </div>
                        <p className="meta">
                          Aangemaakt op {formatDate(workOrder.createdAt)}
                          {workOrder.geplandStart ? ` · Gepland vanaf ${formatDate(workOrder.geplandStart)}` : ""}
                        </p>
                        {workOrder.serviceReport ? (
                          <p className="meta" style={{ marginTop: 8 }}>
                            <strong>Laatste rapport:</strong> {workOrder.serviceReport.werkzaamhedenUitgevoerd}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
