import Link from "next/link";

type AgendaViewSwitchProps = {
  datum: string;
  weergave: "lijst" | "team";
  medewerker?: string;
  labels: {
    list: string;
    team: string;
  };
};

export function AgendaViewSwitch({ datum, weergave, medewerker, labels }: AgendaViewSwitchProps) {
  const baseParams = new URLSearchParams();
  baseParams.set("datum", datum);

  if (medewerker) {
    baseParams.set("medewerker", medewerker);
  }

  const lijstParams = new URLSearchParams(baseParams);
  lijstParams.set("weergave", "lijst");

  const teamParams = new URLSearchParams(baseParams);
  teamParams.set("weergave", "team");

  return (
    <div className="weergave-switch">
      <Link
        href={`/agenda?${lijstParams.toString()}`}
        className={weergave === "lijst" ? "knop" : "knop-zacht"}
      >
        {labels.list}
      </Link>
      <Link
        href={`/agenda?${teamParams.toString()}`}
        className={weergave === "team" ? "knop" : "knop-zacht"}
      >
        {labels.team}
      </Link>
    </div>
  );
}
