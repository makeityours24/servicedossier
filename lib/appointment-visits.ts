import { AppointmentStatus } from "@prisma/client";

type VisitSegmentInput = {
  datumStart: string;
  duurMinuten: number;
};

type VisitSegmentGroupInput = {
  id: number;
  visitId: number;
  datumStart: Date;
  datumEinde: Date;
  duurMinuten: number;
  behandeling: string;
  behandelingKleur: string;
  status: AppointmentStatus;
  notities: string | null;
  customer: {
    id: number;
    naam: string;
    telefoonnummer?: string | null;
  };
  user: {
    id?: number;
    naam: string;
  } | null;
  visit: {
    id: number;
    datum: Date;
    notities: string | null;
    status: AppointmentStatus;
  };
  convertedTreatment?: {
    id: number;
  } | null;
};

export type AppointmentVisitGroup<TSegment extends VisitSegmentGroupInput = VisitSegmentGroupInput> = {
  id: number;
  datum: Date;
  notities: string | null;
  status: AppointmentStatus;
  customer: TSegment["customer"];
  segments: TSegment[];
};

export function buildAppointmentSegmentEnd(datumStart: string, duurMinuten: number) {
  const start = new Date(datumStart);
  return new Date(start.getTime() + duurMinuten * 60_000);
}

export function getVisitSegmentValidationError(segments: VisitSegmentInput[]) {
  if (segments.length === 0) {
    return "Voeg minimaal één onderdeel toe aan dit bezoek.";
  }

  const normalizedSegments = segments
    .map((segment) => ({
      ...segment,
      startAt: new Date(segment.datumStart),
      endAt: buildAppointmentSegmentEnd(segment.datumStart, segment.duurMinuten)
    }))
    .sort((left, right) => left.startAt.getTime() - right.startAt.getTime());

  for (let index = 0; index < normalizedSegments.length; index += 1) {
    const currentSegment = normalizedSegments[index];

    if (Number.isNaN(currentSegment.startAt.getTime())) {
      return "Gebruik een geldige starttijd voor elk onderdeel.";
    }

    if (currentSegment.duurMinuten < 15) {
      return "Elk onderdeel moet minimaal 15 minuten duren.";
    }

    const nextSegment = normalizedSegments[index + 1];
    if (!nextSegment) {
      continue;
    }

    if (currentSegment.endAt > nextSegment.startAt) {
      return "Onderdelen binnen hetzelfde bezoek mogen elkaar niet overlappen.";
    }
  }

  return null;
}

export function groupAppointmentSegmentsByVisit<TSegment extends VisitSegmentGroupInput>(segments: TSegment[]) {
  const visitMap = new Map<number, AppointmentVisitGroup<TSegment>>();

  for (const segment of segments) {
    const existingVisit = visitMap.get(segment.visit.id);

    if (existingVisit) {
      existingVisit.segments.push(segment);
      continue;
    }

    visitMap.set(segment.visit.id, {
      id: segment.visit.id,
      datum: segment.visit.datum,
      notities: segment.visit.notities,
      status: segment.visit.status,
      customer: segment.customer,
      segments: [segment]
    });
  }

  return Array.from(visitMap.values())
    .map((visit) => ({
      ...visit,
      segments: [...visit.segments].sort((left, right) => left.datumStart.getTime() - right.datumStart.getTime())
    }))
    .sort((left, right) => left.datum.getTime() - right.datum.getTime());
}
