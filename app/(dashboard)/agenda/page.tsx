import Link from "next/link";
import {
  createAppointmentAction,
  createAppointmentVisitAction,
  deleteAppointmentAction
} from "@/app/(dashboard)/agenda/actions";
import { AppointmentVisitForm } from "@/components/appointment-visit-form";
import { createQuickCustomerAction } from "@/app/(dashboard)/klanten/customer-actions";
import { AgendaViewSwitch } from "@/components/agenda-view-switch";
import { AppointmentForm } from "@/components/appointment-form";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { ReminderCopyButton } from "@/components/reminder-copy-button";
import { TeamAgendaGrid } from "@/components/team-agenda-grid";
import { requireSalonSession } from "@/lib/auth";
import { getAdjacentAgendaDates, getAgendaData, getAgendaVisitData, getDayRange } from "@/lib/agenda-queries";
import { agendaDictionary, getCurrentLocale } from "@/lib/i18n";
import { buildAppointmentReminderMessage, formatDate, formatDateParamLocal } from "@/lib/utils";

type AgendaPageProps = {
  searchParams: Promise<{
    datum?: string;
    medewerker?: string;
    weergave?: string;
    customerId?: string;
  }>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const locale = await getCurrentLocale();
  const dict = agendaDictionary[locale];
  const user = await requireSalonSession();
  const filters = await searchParams;
  const { dayStart, dayEnd } = getDayRange(filters.datum);
  const selectedDateParam = filters.datum ?? formatDateParamLocal(dayStart);
  const weergave = filters.weergave === "team" ? "team" : "lijst";
  const preselectedCustomerId = filters.customerId ? Number(filters.customerId) : null;

  const { appointments, customers, medewerkers } = await getAgendaData({
    salonId: user.salonId,
    dayStart,
    dayEnd,
    medewerkerFilter: filters.medewerker
  });
  const { segments, schemaAvailable: visitSchemaAvailable } = await getAgendaVisitData({
    salonId: user.salonId,
    dayStart,
    dayEnd,
    medewerkerFilter: filters.medewerker
  });
  const { vorigeDagParam, volgendeDagParam } = getAdjacentAgendaDates(dayStart);
  const agendaItems = [
    ...appointments.map((appointment) => ({
      kind: "appointment" as const,
      id: appointment.id,
      href: `/agenda/${appointment.id}/bewerken`,
      badge: null as string | null,
      datumStart: appointment.datumStart,
      datumEinde: appointment.datumEinde,
      behandeling: appointment.behandeling,
      behandelingKleur: appointment.behandelingKleur,
      duurMinuten: appointment.duurMinuten,
      status: appointment.status,
      notities: appointment.notities,
      customer: appointment.customer,
      user: appointment.user,
      convertedTreatment: appointment.convertedTreatment
    })),
    ...segments.map((segment) => ({
      kind: "segment" as const,
      id: segment.id,
      href: `/agenda/bezoeken/${segment.visit.id}/bewerken`,
      badge: dict.groupedVisitBadge,
      datumStart: segment.datumStart,
      datumEinde: segment.datumEinde,
      behandeling: segment.behandeling,
      behandelingKleur: segment.behandelingKleur,
      duurMinuten: segment.duurMinuten,
      status: segment.status,
      notities: segment.notities,
      customer: segment.customer,
      user: segment.user,
      convertedTreatment: segment.convertedTreatment,
      visit: segment.visit
    }))
  ].sort((left, right) => left.datumStart.getTime() - right.datumStart.getTime());

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">{dict.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {dict.title}
          </h2>
          <p className="subtitel">{dict.subtitle}</p>
        </div>
      </section>

      <section className="kaart" style={{ marginBottom: 20 }}>
        <div className="acties" style={{ justifyContent: "space-between", alignItems: "end" }}>
          <form className="filters" style={{ marginBottom: 0 }}>
            <div className="veld">
              <label htmlFor="datum">{dict.date}</label>
              <input id="datum" name="datum" type="date" defaultValue={selectedDateParam} />
            </div>

            <div className="veld">
              <label htmlFor="medewerker">{dict.stylist}</label>
              <select id="medewerker" name="medewerker" defaultValue={filters.medewerker ?? ""}>
                <option value="">{dict.allStylists}</option>
                {medewerkers.map((medewerker) => (
                  <option key={medewerker.id} value={medewerker.id}>
                    {medewerker.naam}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="knop-secundair">
              {dict.filter}
            </button>
          </form>

          <div className="acties">
            <AgendaViewSwitch
              datum={selectedDateParam}
              weergave={weergave}
              medewerker={filters.medewerker}
              labels={dict.views}
            />
            <Link href={`/agenda?datum=${vorigeDagParam}`} className="knop-zacht">
              {dict.previousDay}
            </Link>
            <Link href={`/agenda?datum=${volgendeDagParam}`} className="knop-zacht">
              {dict.nextDay}
            </Link>
          </div>
        </div>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <div className="print-balk">
            <div>
              <h3>{dict.appointmentsOn.replace("{date}", formatDate(dayStart, locale))}</h3>
              <p className="subtitel" style={{ marginTop: 6 }}>
                {weergave === "team" ? dict.teamViewText : dict.listViewText}
              </p>
            </div>
          </div>

          {agendaItems.length === 0 ? (
            <div className="leeg">{dict.noAppointmentsForDay}</div>
          ) : weergave === "team" ? (
            <TeamAgendaGrid
              locale={locale}
              labels={dict.teamGrid}
              dayStart={dayStart}
              medewerkers={medewerkers}
              afspraken={agendaItems}
            />
          ) : (
            <div className="lijst">
              {agendaItems.map((appointment) => (
                <article className="lijst-item" key={`${appointment.kind}-${appointment.id}`}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4>{appointment.customer.naam}</h4>
                      <p className="meta">
                        <strong>{formatDate(appointment.datumStart, locale)}</strong>
                        <br />
                        <strong>{dict.treatment}:</strong> {appointment.behandeling}
                        <br />
                        <strong>{dict.duration}:</strong> {dict.durationValue.replace(
                          "{count}",
                          String(appointment.duurMinuten)
                        )}
                        <br />
                        <strong>{dict.stylistLabel}:</strong> {appointment.user?.naam ?? dict.unassigned}
                        <br />
                        <strong>{dict.statusLabel}:</strong> {dict.status[appointment.status]}
                        {appointment.badge ? (
                          <>
                            <br />
                            <strong>{appointment.badge}</strong>
                          </>
                        ) : null}
                        {appointment.notities ? (
                          <>
                            <br />
                            <strong>{dict.notes}:</strong> {appointment.notities}
                          </>
                        ) : null}
                      </p>
                    </div>
                    <span
                      className="status-badge"
                      style={{
                        background: `${appointment.behandelingKleur}18`,
                        color: appointment.behandelingKleur
                      }}
                      data-inactive={appointment.status === "GEANNULEERD" || appointment.status === "NIET_GEKOMEN" ? "true" : undefined}
                    >
                      {dict.status[appointment.status]}
                    </span>
                  </div>

                  <div className="acties" style={{ marginTop: 16 }}>
                    <Link href={appointment.href ?? `/agenda`} className="knop-secundair">
                      {dict.edit}
                    </Link>
                    {appointment.kind === "segment" ? (
                      <span className="melding-info" style={{ margin: 0 }}>
                        {dict.groupedVisitInfo}
                      </span>
                    ) : null}
                    {appointment.convertedTreatment ? (
                      <Link
                        href={`/klanten/${appointment.customer.id}/behandelingen/${appointment.convertedTreatment.id}/bewerken`}
                        className="knop-zacht"
                      >
                        {dict.openCompletedTreatment}
                      </Link>
                    ) : (
                      <Link
                        href={
                          appointment.kind === "appointment"
                            ? `/klanten/${appointment.customer.id}?afspraakId=${appointment.id}#nieuwe-behandeling`
                            : `/klanten/${appointment.customer.id}?afspraakSegmentId=${appointment.id}#nieuwe-behandeling`
                        }
                        className="knop"
                      >
                        {dict.registerTreatmentAndDeduct}
                      </Link>
                    )}
                    <Link href={`/klanten/${appointment.customer.id}`} className="knop-zacht">
                      {dict.toClientFile}
                    </Link>
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
                    {appointment.kind === "appointment" ? (
                      <form action={deleteAppointmentAction}>
                        <input type="hidden" name="appointmentId" value={appointment.id} />
                        <DeleteCustomerButton
                          naam={`${appointment.customer.naam} - ${appointment.behandeling}`}
                          confirmMessage={dict.deleteAppointmentConfirm}
                          label={dict.delete}
                        />
                      </form>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <aside className="kaart">
          <h3>{dict.newAppointment}</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            {dict.newAppointmentText}
          </p>
          {customers.length === 0 ? (
            <div className="leeg" style={{ marginTop: 18 }}>
              {dict.addCustomerFirst}
            </div>
          ) : (
            <AppointmentForm
              action={createAppointmentAction}
              quickCreateCustomerAction={createQuickCustomerAction}
              submitLabel={dict.form.saveAppointment}
              busyLabel={dict.form.saving}
              dictionary={dict.form}
              preselectedCustomerId={Number.isInteger(preselectedCustomerId) ? preselectedCustomerId : null}
              customers={customers}
              medewerkers={medewerkers}
            />
          )}

          <div className="kaart" style={{ marginTop: 22, padding: 22 }}>
            <h3>{dict.newVisit}</h3>
            <p className="subtitel" style={{ marginTop: 8 }}>
              {dict.newVisitText}
            </p>
            {!visitSchemaAvailable ? (
              <div className="melding-info" style={{ marginTop: 18 }}>
                {dict.newVisitUnavailable}
              </div>
            ) : customers.length === 0 ? (
              <div className="leeg" style={{ marginTop: 18 }}>
                {dict.addCustomerFirst}
              </div>
            ) : (
              <AppointmentVisitForm
                action={createAppointmentVisitAction}
                submitLabel={dict.form.saveVisit}
                busyLabel={dict.form.savingVisit}
                dictionary={dict.form}
                customers={customers}
                medewerkers={medewerkers}
              />
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
