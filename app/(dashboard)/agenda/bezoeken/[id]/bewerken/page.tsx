import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteAppointmentVisitAction, updateAppointmentVisitAction } from "@/app/(dashboard)/agenda/actions";
import { AppointmentVisitForm } from "@/components/appointment-visit-form";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { requireSalonSession } from "@/lib/auth";
import { agendaDictionary, getCurrentLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { isMissingVisitSchemaError } from "@/lib/visit-schema-support";
import { formatDateParamLocal } from "@/lib/utils";

type BewerkVisitPageProps = {
  params: Promise<{ id: string }>;
};

function toDateTimeLocalValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default async function BewerkVisitPage({ params }: BewerkVisitPageProps) {
  const locale = await getCurrentLocale();
  const dict = agendaDictionary[locale];
  const user = await requireSalonSession();
  const { id } = await params;
  const visitId = Number(id);

  if (!Number.isInteger(visitId)) {
    notFound();
  }

  let visit = null;
  let customers = [];
  let medewerkers = [];

  try {
    [visit, customers, medewerkers] = await Promise.all([
      prisma.appointmentVisit.findFirst({
        where: {
          id: visitId,
          salonId: user.salonId
        },
        include: {
          customer: {
            select: {
              naam: true
            }
          },
          segments: {
            orderBy: [{ datumStart: "asc" }, { id: "asc" }],
            select: {
              id: true,
              userId: true,
              datumStart: true,
              duurMinuten: true,
              behandeling: true,
              behandelingKleur: true,
              notities: true,
              status: true
              ,
              convertedTreatment: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      }),
      prisma.customer.findMany({
        where: { salonId: user.salonId },
        orderBy: { naam: "asc" },
        select: {
          id: true,
          naam: true
        }
      }),
      prisma.user.findMany({
        where: {
          salonId: user.salonId,
          isPlatformAdmin: false,
          status: "ACTIEF"
        },
        orderBy: { naam: "asc" },
        select: {
          id: true,
          naam: true
        }
      })
    ]);
  } catch (error) {
    if (!isMissingVisitSchemaError(error)) {
      throw error;
    }

    notFound();
  }

  if (!visit) {
    notFound();
  }

  const visitIsLocked = visit.segments.some((segment) => Boolean(segment.convertedTreatment));

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">{dict.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {dict.editVisitTitle}
          </h2>
          <p className="subtitel">{dict.editVisitText}</p>
        </div>

        <Link href={`/agenda?datum=${formatDateParamLocal(visit.datum)}`} className="knop-secundair">
          {dict.backToAgenda}
        </Link>
      </section>

      <section className="kaart">
        {visitIsLocked ? (
          <p className="melding-info" style={{ marginBottom: 18 }}>
            {dict.visitLockedByTreatment}
          </p>
        ) : null}

        <div className="acties" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <Link href={`/klanten/${visit.customerId}`} className="knop-zacht">
            {dict.toClientFile}
          </Link>
          {!visitIsLocked ? (
            <form action={deleteAppointmentVisitAction}>
              <input type="hidden" name="visitId" value={visit.id} />
              <DeleteCustomerButton
                naam={visit.customer.naam}
                confirmMessage={dict.deleteVisitConfirm}
                label={dict.delete}
              />
            </form>
          ) : null}
        </div>

        {visitIsLocked ? (
          <div className="lijst">
            {visit.segments.map((segment) => (
              <article className="lijst-item" key={segment.id}>
                <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4>{segment.behandeling}</h4>
                    <p className="meta">
                      {toDateTimeLocalValue(segment.datumStart).replace("T", " ")}
                      <br />
                      {medewerkers.find((medewerker) => medewerker.id === segment.userId)?.naam ?? dict.unassigned}
                    </p>
                  </div>
                  {segment.convertedTreatment ? <span className="badge">{dict.openCompletedTreatment}</span> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AppointmentVisitForm
            action={updateAppointmentVisitAction}
            submitLabel={dict.form.saveVisit}
            busyLabel={dict.form.savingVisit}
            dictionary={dict.form}
            customers={customers}
            medewerkers={medewerkers}
            visit={{
              id: visit.id,
              customerId: visit.customerId,
              datum: toDateTimeLocalValue(visit.datum),
              notities: visit.notities,
              status: visit.status,
              segments: visit.segments.map((segment) => ({
                id: segment.id,
                userId: segment.userId,
                datumStart: toDateTimeLocalValue(segment.datumStart),
                duurMinuten: segment.duurMinuten,
                behandeling: segment.behandeling,
                behandelingKleur: segment.behandelingKleur,
                notities: segment.notities,
                status: segment.status
              }))
            }}
          />
        )}
      </section>
    </div>
  );
}
