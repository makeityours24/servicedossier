import test from "node:test";
import assert from "node:assert/strict";
import {
  applyPackageUsage,
  getPackageStatusForRemainingSessions,
  rollbackPackageUsage,
  validateAppointmentConversion
} from "../lib/treatment-workflows";

test("package usage lowers remaining sessions and marks package complete at zero", () => {
  const result = applyPackageUsage({
    resterendeBeurten: 1
  });

  assert.equal(result.resterendeBeurten, 0);
  assert.equal(result.status, "VOLLEDIG_GEBRUIKT");
});

test("package usage blocks when there are not enough remaining sessions", () => {
  assert.throws(
    () =>
      applyPackageUsage({
        resterendeBeurten: 0
      }),
    new Error("Dit pakket heeft geen resterende beurten meer.")
  );
});

test("rollback restores remaining sessions and reactivates the package", () => {
  const result = rollbackPackageUsage({
    resterendeBeurten: 0,
    aantalAfgeboekt: 1
  });

  assert.equal(result.resterendeBeurten, 1);
  assert.equal(result.status, "ACTIEF");
});

test("package status helper keeps active packages active while sessions remain", () => {
  assert.equal(getPackageStatusForRemainingSessions(3), "ACTIEF");
});

test("appointment conversion validation rejects missing appointments", () => {
  assert.equal(
    validateAppointmentConversion({
      appointmentExists: false,
      alreadyConverted: false
    }),
    "Deze afspraak hoort niet bij deze klant of salon."
  );
});

test("appointment conversion validation rejects already converted appointments", () => {
  assert.equal(
    validateAppointmentConversion({
      appointmentExists: true,
      alreadyConverted: true
    }),
    "Van deze afspraak is al een behandeling gemaakt."
  );
});

test("appointment conversion validation allows valid appointments", () => {
  assert.equal(
    validateAppointmentConversion({
      appointmentExists: true,
      alreadyConverted: false
    }),
    null
  );
});
