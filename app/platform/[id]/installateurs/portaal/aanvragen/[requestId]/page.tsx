import Link from "next/link";
import { notFound } from "next/navigation";
import { confirmAppointmentRequestAction } from "@/app/platform/[id]/installateurs/actions";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { isMissingInstallateurSchemaError, loadInstallateursData } from "@/app/platform/[id]/installateurs/data";
import { formatDate, formatDateOnly } from "@/lib/utils";

type PlatformInstallateursAanvraagDetailPageProps = {
  params: Promise<{ id: string; requestId: string }>;
};

export default async function PlatformInstallateursAanvraagDetailPage({
  params
}: PlatformInstallateursAanvraagDetailPageProps) {
  const { id, requestId } = await params;
  const salonId = Number(id);
  const resolvedRequestId = Number(requestId);

  if (!Number.isInteger(resolvedRequestId)) {
    notFound();
  }

  try {
    const data = await loadInstallateursData(salonId);
    const request = data.appointmentRequests.find((entry) => entry.id === resolvedRequestId);

    if (!request) {
      notFound();
    }

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="portaal">
        <section className="bovenbalk">
          <div>
            <span className="logo-label">Portaalaanvraag</span>
            <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
              {request.customerAccount.naam} · {request.type}
            </h2>
            <p className="subtitel">
              Detailbeeld van de afspraakaanvraag met klant, locatie, voorkeuren en de koppeling naar de werkbon.
            </p>
          </div>

          <div className="acties">
            <Link href={`/platform/${salonId}/installateurs/portaal`} className="knop-zacht">
              Terug naar portaal
            </Link>
          </div>
        </section>

        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Status</h3>
            <strong>{request.status}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Klant</h3>
            <strong>{request.customerAccount.naam}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Portalgebruiker</h3>
            <strong>{request.portalUser.naam}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Aangemaakt</h3>
            <strong>{formatDateOnly(request.createdAt)}</strong>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Aanvraaggegevens</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>Klant en portal</h4>
                <p className="meta">
                  {request.customerAccount.naam}
                  <br />
                  {request.portalUser.naam} · {request.portalUser.email}
                </p>
              </div>
                <div className="lijst-item">
                  <h4>Locatie en object</h4>
                  <p className="meta">
                    {request.serviceLocation.naam ?? `${request.serviceLocation.adresregel1}, ${request.serviceLocation.plaats}`}
                    <br />
                    {request.serviceLocation.adresregel1}, {request.serviceLocation.plaats}
                    {request.asset
                      ? `\n${request.asset.type}${request.asset.merk || request.asset.model ? ` · ${[request.asset.merk, request.asset.model].filter(Boolean).join(" ")}` : ""}`
                      : ""}
                  </p>
                </div>
              <div className="lijst-item">
                <h4>Toelichting</h4>
                <p className="meta">{request.toelichting}</p>
              </div>
              {request.plannerNotitie ? (
                <div className="lijst-item">
                  <h4>Plannernotitie</h4>
                  <p className="meta">{request.plannerNotitie}</p>
                </div>
              ) : null}
            </div>
          </article>

          <article className="kaart">
            <h3>Resultaat</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>Huidige status</h4>
                <p className="meta">
                  {request.status}
                  <br />
                  Aangemaakt op {formatDate(request.createdAt)}
                  <br />
                  Laatst bijgewerkt op {formatDate(request.updatedAt)}
                </p>
              </div>
              {request.gekozenVoorkeur ? (
                <div className="lijst-item">
                  <h4>Bevestigde voorkeur</h4>
                  <p className="meta">
                    Voorkeur {request.gekozenVoorkeur.voorkeurNummer}
                    <br />
                    {formatDateOnly(request.gekozenVoorkeur.datum)} · {formatDate(request.gekozenVoorkeur.startTijd)} - {formatDate(request.gekozenVoorkeur.eindTijd)}
                  </p>
                </div>
              ) : null}
              {request.workOrder ? (
                <div className="lijst-item">
                  <h4>Gekoppelde werkbon</h4>
                  <p className="meta">{request.workOrder.titel}</p>
                  <div style={{ marginTop: 10 }}>
                    <Link href={`/platform/${salonId}/installateurs/werkbonnen/${request.workOrder.id}`} className="knop-zacht">
                      Open werkbon
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        </section>

        <section className="kaart">
          <h3>Voorkeursblokken</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {request.preferences.map((preference) => (
              <div className="lijst-item" key={preference.id}>
                <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4>Voorkeur {preference.voorkeurNummer}</h4>
                    <p className="meta">
                      {formatDateOnly(preference.datum)} · {formatDate(preference.startTijd)} - {formatDate(preference.eindTijd)}
                    </p>
                  </div>
                  {request.gekozenVoorkeurId === preference.id ? <span className="badge">Bevestigd</span> : null}
                </div>
                {request.status !== "BEVESTIGD" ? (
                  <form action={confirmAppointmentRequestAction} style={{ marginTop: 12 }}>
                    <input type="hidden" name="salonId" value={salonId} />
                    <input type="hidden" name="appointmentRequestId" value={request.id} />
                    <input type="hidden" name="preferenceId" value={preference.id} />
                    <button type="submit" className="knop-zacht">
                      Bevestig deze voorkeur
                    </button>
                  </form>
                ) : null}
              </div>
            ))}
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
