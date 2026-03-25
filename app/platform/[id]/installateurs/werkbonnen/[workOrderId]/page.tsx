import Link from "next/link";
import { notFound } from "next/navigation";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { isMissingInstallateurSchemaError, loadInstallateursData } from "@/app/platform/[id]/installateurs/data";
import { formatDate } from "@/lib/utils";

type PlatformInstallateursWerkbonDetailPageProps = {
  params: Promise<{ id: string; workOrderId: string }>;
};

export default async function PlatformInstallateursWerkbonDetailPage({
  params
}: PlatformInstallateursWerkbonDetailPageProps) {
  const { id, workOrderId } = await params;
  const salonId = Number(id);
  const resolvedWorkOrderId = Number(workOrderId);

  if (!Number.isInteger(resolvedWorkOrderId)) {
    notFound();
  }

  try {
    const data = await loadInstallateursData(salonId);
    const customer = data.customerAccounts.find((entry) =>
      entry.workOrders.some((workOrder) => workOrder.id === resolvedWorkOrderId)
    );
    const workOrder = customer?.workOrders.find((entry) => entry.id === resolvedWorkOrderId);

    if (!customer || !workOrder) {
      notFound();
    }

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="werkbonnen">
        <section className="bovenbalk">
          <div>
            <span className="logo-label">Werkbondetail</span>
            <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
              {workOrder.titel}
            </h2>
            <p className="subtitel">
              Volledig werkbonbeeld met locatie, installatie, planning, servicerapport en bijlagen.
            </p>
          </div>

          <div className="acties">
            <Link href={`/platform/${salonId}/installateurs/klanten/${customer.id}`} className="knop-zacht">
              Terug naar klant
            </Link>
            <Link href={`/platform/${salonId}/installateurs/werkbonnen`} className="knop-secundair">
              Terug naar werkbonnen
            </Link>
          </div>
        </section>

        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Klant</h3>
            <strong>{customer.naam}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Type</h3>
            <strong>{workOrder.type}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Status</h3>
            <strong>{workOrder.status}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Prioriteit</h3>
            <strong>{workOrder.prioriteit}</strong>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Werkbongegevens</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>Basis</h4>
                <p className="meta">
                  Aangemaakt op {formatDate(workOrder.createdAt)}
                  <br />
                  Aangevraagd op {formatDate(workOrder.requestedAt)}
                  <br />
                  Locatie: {workOrder.serviceLocation.naam ?? `${workOrder.serviceLocation.adresregel1}, ${workOrder.serviceLocation.plaats}`}
                </p>
              </div>
              {workOrder.asset ? (
                <div className="lijst-item">
                  <h4>Installatie</h4>
                  <p className="meta">
                    {workOrder.asset.type}
                    {workOrder.asset.merk || workOrder.asset.model
                      ? ` · ${[workOrder.asset.merk, workOrder.asset.model].filter(Boolean).join(" ")}`
                      : ""}
                  </p>
                </div>
              ) : null}
              <div className="lijst-item">
                <h4>Melding</h4>
                <p className="meta">{workOrder.melding}</p>
              </div>
              {workOrder.interneNotities ? (
                <div className="lijst-item">
                  <h4>Interne notities</h4>
                  <p className="meta">{workOrder.interneNotities}</p>
                </div>
              ) : null}
              {workOrder.klantNotities ? (
                <div className="lijst-item">
                  <h4>Klantnotities</h4>
                  <p className="meta">{workOrder.klantNotities}</p>
                </div>
              ) : null}
            </div>
          </article>

          <article className="kaart">
            <h3>Planning en monteurs</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              <div className="lijst-item">
                <h4>Geplande tijden</h4>
                <p className="meta">
                  {workOrder.geplandStart ? formatDate(workOrder.geplandStart) : "Geen starttijd gepland"}
                  <br />
                  {workOrder.geplandEinde ? formatDate(workOrder.geplandEinde) : "Geen eindtijd gepland"}
                </p>
              </div>
              {workOrder.assignments.length === 0 ? (
                <div className="leeg">Nog geen monteurs gekoppeld aan deze werkbon.</div>
              ) : (
                workOrder.assignments.map((assignment) => (
                  <div className="lijst-item" key={assignment.id}>
                    <h4>{assignment.user.naam}</h4>
                    <p className="meta">
                      {assignment.rolOpOpdracht} · {assignment.status}
                      <br />
                      {formatDate(assignment.geplandStart)} - {formatDate(assignment.geplandEinde)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Servicerapport</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              {!workOrder.serviceReport ? (
                <div className="leeg">Er is nog geen servicerapport aan deze werkbon gekoppeld.</div>
              ) : (
                <div className="lijst-item">
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h4>Rapportstatus</h4>
                    <span className="badge">
                      {workOrder.serviceReport.vervolgActieNodig ? "Vervolgactie nodig" : "Afgerond"}
                    </span>
                  </div>
                  <p className="meta">
                    Afgerond op {formatDate(workOrder.serviceReport.afgerondOp)}
                    {workOrder.serviceReport.ingevuldDoorUser
                      ? ` · Door ${workOrder.serviceReport.ingevuldDoorUser.naam}`
                      : ""}
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
              )}
            </div>
          </article>

          <article className="kaart">
            <h3>Media en bijlagen</h3>
            <div className="lijst" style={{ marginTop: 18 }}>
              {workOrder.attachments.length === 0 && (workOrder.serviceReport?.attachments.length ?? 0) === 0 ? (
                <div className="leeg">Er zijn nog geen bijlagen toegevoegd aan deze werkbon.</div>
              ) : (
                <>
                  {workOrder.attachments.map((attachment) => (
                    <div className="lijst-item" key={attachment.id}>
                      <h4>{attachment.bestandNaam}</h4>
                      <p className="meta">
                        {attachment.type} · {attachment.mimeType}
                        <br />
                        Toegevoegd op {formatDate(attachment.createdAt)}
                        {attachment.uploadedByUser ? ` · Door ${attachment.uploadedByUser.naam}` : ""}
                      </p>
                    </div>
                  ))}
                  {workOrder.serviceReport?.attachments.map((attachment) => (
                    <div className="lijst-item" key={attachment.id}>
                      <h4>{attachment.bestandNaam}</h4>
                      <p className="meta">
                        Rapportbijlage · {attachment.type}
                        <br />
                        Toegevoegd op {formatDate(attachment.createdAt)}
                        {attachment.uploadedByUser ? ` · Door ${attachment.uploadedByUser.naam}` : ""}
                      </p>
                    </div>
                  ))}
                </>
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
