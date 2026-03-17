import Link from "next/link";
import { createAppointmentAction, deleteAppointmentAction } from "@/app/(dashboard)/agenda/actions";
import { createQuickCustomerAction } from "@/app/(dashboard)/klanten/customer-actions";
import { AgendaViewSwitch } from "@/components/agenda-view-switch";
import { AppointmentForm } from "@/components/appointment-form";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { ReminderCopyButton } from "@/components/reminder-copy-button";
import { TeamAgendaGrid } from "@/components/team-agenda-grid";
import { requireSalonSession } from "@/lib/auth";
import { getAdjacentAgendaDates, getAgendaData, getDayRange } from "@/lib/agenda-queries";
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
  const { vorigeDagParam, volgendeDagParam } = getAdjacentAgendaDates(dayStart);

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Agenda</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Dagagenda
          </h2>
          <p className="subtitel">
            Plan afspraken per dag en houd eenvoudig zicht op klant, behandelaar en status.
          </p>
        </div>
      </section>

      <section className="kaart" style={{ marginBottom: 20 }}>
        <div className="acties" style={{ justifyContent: "space-between", alignItems: "end" }}>
          <form className="filters" style={{ marginBottom: 0 }}>
            <div className="veld">
              <label htmlFor="datum">Datum</label>
              <input id="datum" name="datum" type="date" defaultValue={selectedDateParam} />
            </div>

            <div className="veld">
              <label htmlFor="medewerker">Behandelaar</label>
              <select id="medewerker" name="medewerker" defaultValue={filters.medewerker ?? ""}>
                <option value="">Alle behandelaars</option>
                {medewerkers.map((medewerker) => (
                  <option key={medewerker.id} value={medewerker.id}>
                    {medewerker.naam}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="knop-secundair">
              Filteren
            </button>
          </form>

          <div className="acties">
            <AgendaViewSwitch
              datum={selectedDateParam}
              weergave={weergave}
              medewerker={filters.medewerker}
            />
            <Link href={`/agenda?datum=${vorigeDagParam}`} className="knop-zacht">
              Vorige dag
            </Link>
            <Link href={`/agenda?datum=${volgendeDagParam}`} className="knop-zacht">
              Volgende dag
            </Link>
          </div>
        </div>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <div className="print-balk">
            <div>
              <h3>Afspraken op {formatDate(dayStart)}</h3>
              <p className="subtitel" style={{ marginTop: 6 }}>
                {weergave === "team"
                  ? "Teamweergave met kolommen per behandelaar voor salons met meerdere kappers tegelijk."
                  : "Eenvoudig dagoverzicht met klant, behandeling, behandelaar en status."}
              </p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="leeg">Er zijn nog geen afspraken gevonden voor deze dag en filtercombinatie.</div>
          ) : weergave === "team" ? (
            <TeamAgendaGrid dayStart={dayStart} medewerkers={medewerkers} afspraken={appointments} />
          ) : (
            <div className="lijst">
              {appointments.map((appointment) => (
                <article className="lijst-item" key={appointment.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4>{appointment.customer.naam}</h4>
                      <p className="meta">
                        <strong>{formatDate(appointment.datumStart)}</strong>
                        <br />
                        <strong>Behandeling:</strong> {appointment.behandeling}
                        <br />
                        <strong>Duur:</strong> {appointment.duurMinuten} minuten
                        <br />
                        <strong>Behandelaar:</strong> {appointment.user?.naam ?? "Nog niet toegewezen"}
                        <br />
                        <strong>Status:</strong> {appointment.status.replaceAll("_", " ")}
                        {appointment.notities ? (
                          <>
                            <br />
                            <strong>Notities:</strong> {appointment.notities}
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
                      {appointment.status === "GEPLAND"
                        ? "Gepland"
                        : appointment.status === "VOLTOOID"
                          ? "Voltooid"
                          : appointment.status === "GEANNULEERD"
                            ? "Geannuleerd"
                            : "Niet gekomen"}
                    </span>
                  </div>

                  <div className="acties" style={{ marginTop: 16 }}>
                    <Link href={`/agenda/${appointment.id}/bewerken`} className="knop-secundair">
                      Bewerken
                    </Link>
                    {appointment.convertedTreatment ? (
                      <Link
                        href={`/klanten/${appointment.customer.id}/behandelingen/${appointment.convertedTreatment.id}/bewerken`}
                        className="knop-zacht"
                      >
                        Behandeling openen
                      </Link>
                    ) : (
                      <Link
                        href={`/klanten/${appointment.customer.id}?afspraakId=${appointment.id}#nieuwe-behandeling`}
                        className="knop"
                      >
                        Behandeling starten
                      </Link>
                    )}
                    <Link href={`/klanten/${appointment.customer.id}`} className="knop-zacht">
                      Naar klantdossier
                    </Link>
                    <ReminderCopyButton
                      message={buildAppointmentReminderMessage({
                        customerName: appointment.customer.naam,
                        salonName: user.salon.instellingen?.weergavenaam ?? user.salon.naam,
                        treatmentName: appointment.behandeling,
                        startAt: appointment.datumStart,
                        contactPhone:
                          user.salon.instellingen?.contactTelefoon ?? user.salon.telefoonnummer ?? null
                      })}
                    />
                    <form action={deleteAppointmentAction}>
                      <input type="hidden" name="appointmentId" value={appointment.id} />
                      <DeleteCustomerButton
                        naam={`${appointment.customer.naam} - ${appointment.behandeling}`}
                        confirmMessage="Weet je zeker dat je afspraak {naam} wilt verwijderen?"
                        label="Verwijderen"
                      />
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <aside className="kaart">
          <h3>Nieuwe afspraak</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Plan snel een nieuwe afspraak voor een bestaande klant. Dit is bewust een lichte dagagenda zonder zware planner.
          </p>
          {customers.length === 0 ? (
            <div className="leeg" style={{ marginTop: 18 }}>
              Voeg eerst een klant toe voordat je een afspraak kunt plannen.
            </div>
          ) : (
            <AppointmentForm
              action={createAppointmentAction}
              quickCreateCustomerAction={createQuickCustomerAction}
              preselectedCustomerId={Number.isInteger(preselectedCustomerId) ? preselectedCustomerId : null}
              customers={customers}
              medewerkers={medewerkers}
            />
          )}
        </aside>
      </section>
    </div>
  );
}
