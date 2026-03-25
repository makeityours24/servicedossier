import Link from "next/link";
import { notFound } from "next/navigation";
import { updateAppointmentAction } from "@/app/(dashboard)/agenda/actions";
import { createQuickCustomerAction } from "@/app/(dashboard)/klanten/customer-actions";
import { AppointmentForm } from "@/components/appointment-form";
import { ReminderCopyButton } from "@/components/reminder-copy-button";
import { requireSalonSession } from "@/lib/auth";
import { agendaDictionary, getCurrentLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { buildAppointmentReminderMessage, formatDateParamLocal } from "@/lib/utils";

type BewerkAfspraakPageProps = {
  params: Promise<{ id: string }>;
};

function toDateTimeLocalValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function getDurationInMinutes(start: Date, end: Date) {
  return Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));
}

export default async function BewerkAfspraakPage({ params }: BewerkAfspraakPageProps) {
  const locale = await getCurrentLocale();
  const dict = agendaDictionary[locale];
  const user = await requireSalonSession();
  const { id } = await params;
  const appointmentId = Number(id);

  if (!Number.isInteger(appointmentId)) {
    notFound();
  }

  const [appointment, customers, medewerkers] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        salonId: user.salonId
      },
      select: {
        id: true,
        customerId: true,
        userId: true,
        datumStart: true,
        datumEinde: true,
        duurMinuten: true,
        behandeling: true,
        behandelingKleur: true,
        notities: true,
        status: true,
        convertedTreatment: {
          select: {
            id: true
          }
        },
        customer: {
          select: {
            naam: true,
            telefoonnummer: true
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

  if (!appointment) {
    notFound();
  }

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">{dict.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {dict.editAppointmentTitle}
          </h2>
          <p className="subtitel">
            {dict.editAppointmentText.replace("{customerName}", appointment.customer.naam)}
          </p>
        </div>

        <Link href={`/agenda?datum=${formatDateParamLocal(appointment.datumStart)}`} className="knop-secundair">
          {dict.backToAgenda}
        </Link>
      </section>

      <section className="kaart">
        <div className="acties" style={{ marginBottom: 18 }}>
          {appointment.convertedTreatment ? (
            <Link
              href={`/klanten/${appointment.customerId}/behandelingen/${appointment.convertedTreatment.id}/bewerken`}
              className="knop-zacht"
            >
              {dict.openCompletedTreatment}
            </Link>
          ) : (
            <Link
              href={`/klanten/${appointment.customerId}?afspraakId=${appointment.id}#nieuwe-behandeling`}
              className="knop"
            >
              {dict.registerTreatmentAndDeduct}
            </Link>
          )}
          <ReminderCopyButton
            labels={{
              copied: `${dict.reminderCopy} ✓`,
              copy: dict.reminderCopy,
              openWhatsApp: dict.openWhatsApp,
              copiedHint: dict.reminderCopiedHint
            }}
            phoneNumber={appointment.customer.telefoonnummer}
            message={buildAppointmentReminderMessage({
              customerName: appointment.customer.naam,
              salonName: user.salon.instellingen?.weergavenaam ?? user.salon.naam,
              treatmentName: appointment.behandeling,
              startAt: appointment.datumStart,
              contactPhone:
                user.salon.instellingen?.contactTelefoon ?? user.salon.telefoonnummer ?? null
            })}
          />
        </div>

        <AppointmentForm
          action={updateAppointmentAction}
          quickCreateCustomerAction={createQuickCustomerAction}
          submitLabel={dict.form.saveAppointment}
          busyLabel={dict.form.saving}
          dictionary={dict.form}
          customers={customers}
          medewerkers={medewerkers}
          appointment={{
            id: appointment.id,
            customerId: appointment.customerId,
            hasConvertedTreatment: Boolean(appointment.convertedTreatment),
            userId: appointment.userId,
            datumStart: toDateTimeLocalValue(appointment.datumStart),
            duurMinuten:
              appointment.duurMinuten ?? getDurationInMinutes(appointment.datumStart, appointment.datumEinde),
            behandeling: appointment.behandeling,
            behandelingKleur: appointment.behandelingKleur,
            notities: appointment.notities,
            status: appointment.status
          }}
        />
      </section>
    </div>
  );
}
