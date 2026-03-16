import Link from "next/link";

type TeamAgendaGridProps = {
  dayStart: Date;
  medewerkers: Array<{
    id: number;
    naam: string;
  }>;
  afspraken: Array<{
    id: number;
    datumStart: Date;
    datumEinde: Date;
    behandeling: string;
    status: "GEPLAND" | "VOLTOOID" | "GEANNULEERD" | "NIET_GEKOMEN";
    customer: {
      id: number;
      naam: string;
    };
    user: {
      naam: string;
    } | null;
  }>;
};

const START_HOUR = 8;
const END_HOUR = 21;
const PIXELS_PER_MINUTE = 1.2;

function getMinutesSinceStart(dayStart: Date, date: Date) {
  return Math.max(0, Math.round((date.getTime() - dayStart.getTime()) / 60000) - START_HOUR * 60);
}

function getAgendaHeight() {
  return (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE;
}

function getStatusClass(status: TeamAgendaGridProps["afspraken"][number]["status"]) {
  if (status === "VOLTOOID") return "voltooid";
  if (status === "GEANNULEERD") return "geannuleerd";
  if (status === "NIET_GEKOMEN") return "niet-gekomen";
  return "gepland";
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function TeamAgendaGrid({ dayStart, medewerkers, afspraken }: TeamAgendaGridProps) {
  const agendaHeight = getAgendaHeight();
  const tijdsloten = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index);
  const ongepland = afspraken.filter((afspraak) => !afspraak.user);
  const kolommen = [
    ...medewerkers.map((medewerker) => ({
      id: medewerker.id,
      naam: medewerker.naam,
      afspraken: afspraken.filter((afspraak) => afspraak.user?.naam === medewerker.naam)
    })),
    {
      id: -1,
      naam: "Nog niet toegewezen",
      afspraken: ongepland
    }
  ].filter((kolom) => kolom.afspraken.length > 0 || kolom.id !== -1);

  return (
    <div className="team-agenda-wrapper">
      <div className="team-agenda-helper">
        <span>Scroll naar rechts voor meer behandelaars</span>
      </div>
      <div className="team-agenda-grid">
        <div className="team-agenda-tijdkolom">
          <div className="team-agenda-kop">Tijd</div>
          <div className="team-agenda-tijdlijn" style={{ height: agendaHeight }}>
            {tijdsloten.map((uur) => (
              <div
                key={uur}
                className="team-agenda-tijdslot"
                style={{ top: (uur - START_HOUR) * 60 * PIXELS_PER_MINUTE }}
              >
                {`${String(uur).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>
        </div>

        <div className="team-agenda-kolommen">
          {kolommen.map((kolom) => (
            <section className="team-agenda-kolom" key={kolom.id}>
              <div className="team-agenda-kop">{kolom.naam}</div>
              <div className="team-agenda-tijdlijn" style={{ height: agendaHeight }}>
                {tijdsloten.map((uur) => (
                  <div
                    key={uur}
                    className="team-agenda-rasterlijn"
                    style={{ top: (uur - START_HOUR) * 60 * PIXELS_PER_MINUTE }}
                  />
                ))}

                {kolom.afspraken.map((afspraak) => {
                  const top = getMinutesSinceStart(dayStart, afspraak.datumStart) * PIXELS_PER_MINUTE;
                  const duurMinuten = Math.max(
                    30,
                    Math.round((afspraak.datumEinde.getTime() - afspraak.datumStart.getTime()) / 60000)
                  );

                  return (
                    <Link
                      key={afspraak.id}
                      href={`/agenda/${afspraak.id}/bewerken`}
                      className={`agenda-afspraakblok ${getStatusClass(afspraak.status)}`}
                      style={{
                        top,
                        height: duurMinuten * PIXELS_PER_MINUTE
                      }}
                    >
                      <strong>{afspraak.customer.naam}</strong>
                      <span>{afspraak.behandeling}</span>
                      <span>
                        {formatTime(afspraak.datumStart)} - {formatTime(afspraak.datumEinde)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
