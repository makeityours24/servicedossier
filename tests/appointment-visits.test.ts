import test from "node:test";
import assert from "node:assert/strict";
import { buildAppointmentSegmentEnd, getVisitSegmentValidationError } from "../lib/appointment-visits";
import { appointmentVisitSchema } from "../lib/validation";

test("appointment visit segments derive an end time from the start and duration", () => {
  const endAt = buildAppointmentSegmentEnd("2026-03-24T10:00:00.000Z", 45);

  assert.equal(endAt.toISOString(), "2026-03-24T10:45:00.000Z");
});

test("visit segment validation rejects overlapping segments", () => {
  const error = getVisitSegmentValidationError([
    {
      datumStart: "2026-03-24T10:00:00.000Z",
      duurMinuten: 60
    },
    {
      datumStart: "2026-03-24T10:30:00.000Z",
      duurMinuten: 20
    }
  ]);

  assert.equal(error, "Onderdelen binnen hetzelfde bezoek mogen elkaar niet overlappen.");
});

test("appointment visit schema accepts a multi-treatment visit with two stylists", () => {
  const result = appointmentVisitSchema.safeParse({
    customerId: 12,
    datum: "2026-03-24T10:00:00.000Z",
    notities: "Klant wil kleuren en epileren tijdens hetzelfde bezoek.",
    status: "GEPLAND",
    segments: [
      {
        userId: 4,
        datumStart: "2026-03-24T10:00:00.000Z",
        duurMinuten: 60,
        behandeling: "Kleuren",
        behandelingKleur: "#B42323",
        notities: "Behandelaar A",
        status: "GEPLAND"
      },
      {
        userId: 7,
        datumStart: "2026-03-24T11:05:00.000Z",
        duurMinuten: 20,
        behandeling: "Epileren",
        behandelingKleur: "#B42323",
        notities: "Behandelaar B",
        status: "GEPLAND"
      }
    ]
  });

  assert.equal(result.success, true);
});

test("appointment visit schema rejects segments that overlap", () => {
  const result = appointmentVisitSchema.safeParse({
    customerId: 12,
    datum: "2026-03-24T10:00:00.000Z",
    notities: "",
    status: "GEPLAND",
    segments: [
      {
        userId: 4,
        datumStart: "2026-03-24T10:00:00.000Z",
        duurMinuten: 60,
        behandeling: "Kleuren",
        behandelingKleur: "#B42323",
        notities: "",
        status: "GEPLAND"
      },
      {
        userId: 7,
        datumStart: "2026-03-24T10:30:00.000Z",
        duurMinuten: 20,
        behandeling: "Epileren",
        behandelingKleur: "#B42323",
        notities: "",
        status: "GEPLAND"
      }
    ]
  });

  assert.equal(result.success, false);
  assert.match(result.error?.issues[0]?.message ?? "", /niet overlappen/);
});
