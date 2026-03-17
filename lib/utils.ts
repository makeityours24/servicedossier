export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export function formatDateOnly(date: Date | string) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium"
  }).format(new Date(date));
}

export function formatDateInput(date: Date | string) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateParamLocal(date: Date | string) {
  return formatDateInput(date);
}

export function buildCsvRow(values: string[]) {
  return values
    .map((value) => `"${value.replaceAll('"', '""')}"`)
    .join(",");
}

export function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR"
  }).format(value / 100);
}

export function describePackagePrice(
  pakketPrijsCents: number,
  lossePrijsCents: number,
  totaalBeurten: number
) {
  const normaleWaarde = lossePrijsCents * totaalBeurten;
  const voordeel = normaleWaarde - pakketPrijsCents;

  if (voordeel <= 0) {
    return `${formatCurrencyFromCents(pakketPrijsCents)} voor ${totaalBeurten} beurten`;
  }

  return `${formatCurrencyFromCents(pakketPrijsCents)} voor ${totaalBeurten} beurten, bespaar ${formatCurrencyFromCents(voordeel)}`;
}

export function buildAppointmentReminderMessage(params: {
  customerName: string;
  salonName: string;
  treatmentName: string;
  startAt: Date | string;
  contactPhone?: string | null;
}) {
  const date = new Date(params.startAt);
  const dag = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(date);
  const tijd = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);

  const contactLine = params.contactPhone
    ? ` Vragen? Bel of app gerust naar ${params.contactPhone}.`
    : "";

  return `Hoi ${params.customerName}, dit is een herinnering voor je afspraak bij ${params.salonName} op ${dag} om ${tijd} voor ${params.treatmentName}. Tot dan!${contactLine}`;
}
