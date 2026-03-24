type VisitSegmentInput = {
  datumStart: string;
  duurMinuten: number;
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
