export type CustomerPackageStatus = "ACTIEF" | "VOLLEDIG_GEBRUIKT";

export function getPackageStatusForRemainingSessions(
  resterendeBeurten: number
): CustomerPackageStatus {
  return resterendeBeurten <= 0 ? "VOLLEDIG_GEBRUIKT" : "ACTIEF";
}

export function applyPackageUsage(params: {
  resterendeBeurten: number;
  aantalAfgeboekt?: number;
}) {
  const aantalAfgeboekt = params.aantalAfgeboekt ?? 1;

  if (aantalAfgeboekt < 1) {
    throw new Error("Aantal afgeboekte beurten moet minimaal 1 zijn.");
  }

  if (params.resterendeBeurten < aantalAfgeboekt) {
    throw new Error("Dit pakket heeft geen resterende beurten meer.");
  }

  const resterendeBeurten = params.resterendeBeurten - aantalAfgeboekt;

  return {
    resterendeBeurten,
    status: getPackageStatusForRemainingSessions(resterendeBeurten)
  };
}

export function rollbackPackageUsage(params: {
  resterendeBeurten: number;
  aantalAfgeboekt?: number;
}) {
  const aantalAfgeboekt = params.aantalAfgeboekt ?? 1;

  if (aantalAfgeboekt < 1) {
    throw new Error("Aantal afgeboekte beurten moet minimaal 1 zijn.");
  }

  const resterendeBeurten = params.resterendeBeurten + aantalAfgeboekt;

  return {
    resterendeBeurten,
    status: getPackageStatusForRemainingSessions(resterendeBeurten)
  };
}

export function validateAppointmentConversion(params: {
  appointmentExists: boolean;
  alreadyConverted: boolean;
}) {
  if (!params.appointmentExists) {
    return "Deze afspraak hoort niet bij deze klant of salon.";
  }

  if (params.alreadyConverted) {
    return "Van deze afspraak is al een behandeling gemaakt.";
  }

  return null;
}

export function validateAppointmentSegmentConversion(params: {
  appointmentSegmentExists: boolean;
  alreadyConverted: boolean;
}) {
  if (!params.appointmentSegmentExists) {
    return "Dit bezoekonderdeel hoort niet bij deze klant of salon.";
  }

  if (params.alreadyConverted) {
    return "Van dit bezoekonderdeel is al een behandeling gemaakt.";
  }

  return null;
}
