export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export function formatDateInput(date: Date | string) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildCsvRow(values: string[]) {
  return values
    .map((value) => `"${value.replaceAll('"', '""')}"`)
    .join(",");
}
