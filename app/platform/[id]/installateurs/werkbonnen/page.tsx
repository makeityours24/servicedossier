import {
  createServiceReportAction,
  createWorkOrderAction,
  createWorkOrderAssignmentAction,
  sendServiceReportEmailAction,
  sendWorkOrderConfirmationAction,
  uploadInstallateurAttachmentAction
} from "@/app/platform/[id]/installateurs/actions";
import { isMissingInstallateurSchemaError, loadInstallateursData } from "@/app/platform/[id]/installateurs/data";
import { InstallateurAttachmentForm } from "@/components/installateur-attachment-form";
import { InstallateurDocumentSendForm } from "@/components/installateur-document-send-form";
import { InstallateurServiceReportForm } from "@/components/installateur-service-report-form";
import { InstallateurWorkOrderAssignmentForm } from "@/components/installateur-work-order-assignment-form";
import { InstallateurWorkOrderForm } from "@/components/installateur-work-order-form";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type PlatformInstallateursWerkbonnenPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformInstallateursWerkbonnenPage({
  params
}: PlatformInstallateursWerkbonnenPageProps) {
  const { id } = await params;
  const salonId = Number(id);

  try {
    const data = await loadInstallateursData(salonId);

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="werkbonnen">
        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Werkbonnen</h3>
            <strong>{data.totalWorkOrders}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Inplanningen</h3>
            <strong>{data.totalAssignments}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Servicerapporten</h3>
            <strong>{data.totalServiceReports}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Media</h3>
            <strong>{data.totalAttachments}</strong>
          </article>
        </section>

        <section className="kaart">
          <h3>Nieuwe werkbon</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Maak storingen, onderhoud, montage en inspecties direct aan op klant-, locatie- en installatieniveau.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurWorkOrderForm salonId={salonId} customers={data.customerOptions} action={createWorkOrderAction} />
          </div>
        </section>

        <section className="kaart">
          <h3>Monteur koppelen aan werkbon</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Plan medewerkers nu al op werkbonniveau in. Dit vormt de basis voor de dag- en weekplanning.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurWorkOrderAssignmentForm
              salonId={salonId}
              workOrders={data.workOrderOptions}
              users={data.medewerkers.map((user) => ({
                id: user.id,
                naam: user.naam,
                rol: user.rol
              }))}
              action={createWorkOrderAssignmentAction}
            />
          </div>
        </section>

        <section className="kaart">
          <h3>Servicerapport toevoegen</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Rond een werkbon inhoudelijk af met uitgevoerde werkzaamheden, bevindingen en eventueel een vervolgactie.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurServiceReportForm
              salonId={salonId}
              openWorkOrders={data.openWorkOrderOptions}
              users={data.medewerkers.map((user) => ({
                id: user.id,
                naam: user.naam,
                rol: user.rol
              }))}
              action={createServiceReportAction}
            />
          </div>
        </section>

        <section className="kaart">
          <h3>Foto of video toevoegen</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Voeg bewijs, schadebeelden of situatievideo&apos;s toe aan een werkbon. Als er al een servicerapport is, kun je het bestand daar ook direct aan koppelen.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurAttachmentForm
              salonId={salonId}
              workOrders={data.attachmentWorkOrderOptions}
              action={uploadInstallateurAttachmentAction}
            />
          </div>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Opdrachtbevestiging versturen</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Verstuur een bevestiging naar klanten met een e-mailadres op basis van de werkbongegevens.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurDocumentSendForm
                salonId={salonId}
                fieldName="workOrderId"
                label="Werkbon"
                emptyLabel="Kies een werkbon"
                submitLabel="Bevestiging versturen"
                submitBusyLabel="Versturen..."
                options={data.workOrderConfirmationOptions}
                action={sendWorkOrderConfirmationAction}
              />
            </div>
          </article>

          <article className="kaart">
            <h3>Servicerapport versturen</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Stuur afgeronde servicerapporten rechtstreeks naar de klant. Dit is de eerste documentlaag.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurDocumentSendForm
                salonId={salonId}
                fieldName="serviceReportId"
                label="Servicerapport"
                emptyLabel="Kies een servicerapport"
                submitLabel="Servicerapport versturen"
                submitBusyLabel="Versturen..."
                options={data.serviceReportEmailOptions}
                action={sendServiceReportEmailAction}
              />
            </div>
          </article>
        </section>

        <section className="kaart">
          <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>Werkbonoverzicht</h3>
              <p className="meta" style={{ marginTop: 8 }}>
                Recente werkbonnen, planningen, media en servicerapporten in één operationeel overzicht.
              </p>
            </div>
            <span className="badge">{data.totalWorkOrders} werkbon(nen)</span>
          </div>

          <div className="lijst" style={{ marginTop: 18 }}>
            {data.totalWorkOrders === 0 ? (
              <div className="leeg">Er zijn nog geen werkbonnen aangemaakt in deze tenant.</div>
            ) : (
              data.customerAccounts.flatMap((customer) =>
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
                      {customer.naam}
                      <br />
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
                      <div className="lijst" style={{ marginTop: 12 }}>
                        <div className="lijst-item">
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
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )
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
