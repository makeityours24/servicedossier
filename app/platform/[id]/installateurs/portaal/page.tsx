import {
  confirmAppointmentRequestAction,
  createCustomerPortalUserAction
} from "@/app/platform/[id]/installateurs/actions";
import { isMissingInstallateurSchemaError, loadInstallateursData } from "@/app/platform/[id]/installateurs/data";
import { InstallateurPortalUserForm } from "@/components/installateur-portal-user-form";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { formatDate, formatDateOnly } from "@/lib/utils";
import Link from "next/link";

type PlatformInstallateursPortaalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformInstallateursPortaalPage({
  params
}: PlatformInstallateursPortaalPageProps) {
  const { id } = await params;
  const salonId = Number(id);

  try {
    const data = await loadInstallateursData(salonId);

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="portaal">
        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Portalgebruikers</h3>
            <strong>{data.customerAccounts.reduce((count, customer) => count + customer.customerPortalUsers.length, 0)}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Aanvragen</h3>
            <strong>{data.totalAppointmentRequests}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Portal URL</h3>
            <strong style={{ fontSize: "1rem" }}>Klaar</strong>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Portalaccount voor klant</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Geef klanten een eigen login voor hun dossier, locaties, installaties en afspraken. De portal gebruikt een aparte sessielaag naast medewerkers.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurPortalUserForm
                salonId={salonId}
                customers={data.customerAccounts.map((customer) => ({
                  id: customer.id,
                  naam: customer.naam
                }))}
                action={createCustomerPortalUserAction}
              />
            </div>
            <p className="meta" style={{ marginTop: 12 }}>
              Portal login: <Link href={data.portalBaseUrl} className="link-tekst">{data.portalBaseUrl}</Link>
            </p>
          </article>

          <article className="kaart">
            <h3>Portalgebruikers per klant</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              {data.customerAccounts.every((customer) => customer.customerPortalUsers.length === 0) ? (
                <div className="leeg">Er zijn nog geen portalaccounts aangemaakt.</div>
              ) : (
                data.customerAccounts
                  .filter((customer) => customer.customerPortalUsers.length > 0)
                  .map((customer) => (
                    <div className="lijst-item" key={customer.id}>
                      <h4>{customer.naam}</h4>
                      <div className="lijst" style={{ marginTop: 12 }}>
                        {customer.customerPortalUsers.map((portalUser) => (
                          <div className="lijst-item" key={portalUser.id}>
                            <h4>{portalUser.naam}</h4>
                            <p className="meta">
                              {portalUser.email} · {portalUser.status}
                              <br />
                              Portalaccount aangemaakt op {formatDate(portalUser.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </article>
        </section>

        <section className="kaart">
          <h3>Afspraakaanvragen uit portaal</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Nieuwe klantaanvragen komen hier binnen met 3 voorkeursblokken van 2 uur. Bevestig een voorkeur en we zetten automatisch een werkbon klaar.
          </p>
          <div className="lijst" style={{ marginTop: 18 }}>
            {data.appointmentRequests.length === 0 ? (
              <div className="leeg">Er zijn nog geen portaalaanvragen binnengekomen.</div>
            ) : (
              data.appointmentRequests.map((request) => (
                <div className="lijst-item" key={request.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4>{request.customerAccount.naam} · {request.type}</h4>
                      <p className="meta">
                        {request.portalUser.naam} ({request.portalUser.email})
                        <br />
                        {request.serviceLocation.naam ?? `${request.serviceLocation.adresregel1}, ${request.serviceLocation.plaats}`}
                        {request.asset ? ` · ${request.asset.type}${request.asset.merk || request.asset.model ? ` (${[request.asset.merk, request.asset.model].filter(Boolean).join(" ")})` : ""}` : ""}
                      </p>
                    </div>
                    <span className="badge">{request.status}</span>
                  </div>
                  <p className="meta" style={{ marginTop: 8 }}>{request.toelichting}</p>
                  <div className="lijst" style={{ marginTop: 12 }}>
                    {request.preferences.map((preference) => (
                      <div className="lijst-item" key={preference.id}>
                        <p className="meta">
                          Voorkeur {preference.voorkeurNummer}: {formatDateOnly(preference.datum)} · {formatDate(preference.startTijd)} - {formatDate(preference.eindTijd)}
                        </p>
                        {request.status !== "BEVESTIGD" ? (
                          <form action={confirmAppointmentRequestAction} style={{ marginTop: 8 }}>
                            <input type="hidden" name="salonId" value={salonId} />
                            <input type="hidden" name="appointmentRequestId" value={request.id} />
                            <input type="hidden" name="preferenceId" value={preference.id} />
                            <button type="submit" className="knop-zacht">
                              Bevestig deze voorkeur
                            </button>
                          </form>
                        ) : request.gekozenVoorkeurId === preference.id ? (
                          <p className="meta" style={{ marginTop: 8 }}>
                            Deze voorkeur is bevestigd{request.workOrder ? ` · Werkbon: ${request.workOrder.titel}` : ""}.
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
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
