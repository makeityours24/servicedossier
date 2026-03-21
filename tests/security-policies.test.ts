import test from "node:test";
import assert from "node:assert/strict";
import { medewerkerUpdateSchema } from "../lib/validation";
import {
  getSalonAccessError,
  getTeamDeletePolicyError,
  getTeamUpdatePolicyError,
  hasTeamManagementRights
} from "../lib/security-policies";

test("unauthorized staff cannot manage team members", () => {
  assert.equal(hasTeamManagementRights("MEDEWERKER"), false);
  assert.equal(hasTeamManagementRights("ADMIN"), true);
});

test("cross-salon access is rejected by policy helpers", () => {
  assert.equal(
    getSalonAccessError({
      actorSalonId: 1,
      resourceSalonId: 2
    }),
    "Deze resource hoort niet bij deze salon."
  );

  assert.equal(
    getSalonAccessError({
      actorSalonId: 3,
      resourceSalonId: 3
    }),
    null
  );
});

test("admins cannot escalate another user to owner", () => {
  assert.equal(
    getTeamUpdatePolicyError({
      actorRole: "ADMIN",
      actorId: 10,
      targetUserId: 11,
      currentTargetRole: "MEDEWERKER",
      nextTargetRole: "OWNER",
      nextStatus: "ACTIEF",
      ownerCount: 1
    }),
    "Alleen een eigenaar kan een andere eigenaar toewijzen."
  );
});

test("the last owner cannot be demoted or disabled", () => {
  assert.equal(
    getTeamUpdatePolicyError({
      actorRole: "OWNER",
      actorId: 10,
      targetUserId: 11,
      currentTargetRole: "OWNER",
      nextTargetRole: "ADMIN",
      nextStatus: "ACTIEF",
      ownerCount: 1
    }),
    "Deze salon moet minimaal één actieve eigenaar behouden."
  );
});

test("users cannot disable or delete themselves through team management", () => {
  assert.equal(
    getTeamUpdatePolicyError({
      actorRole: "OWNER",
      actorId: 10,
      targetUserId: 10,
      currentTargetRole: "OWNER",
      nextTargetRole: "OWNER",
      nextStatus: "UITGESCHAKELD",
      ownerCount: 2
    }),
    "Je kunt je eigen account niet uitschakelen."
  );

  assert.equal(
    getTeamDeletePolicyError({
      actorRole: "OWNER",
      actorId: 10,
      targetUserId: 10,
      targetUserRole: "OWNER",
      ownerCount: 2
    }),
    "Je kunt je eigen account niet verwijderen."
  );
});

test("unexpected protected fields are rejected by strict validation", () => {
  const result = medewerkerUpdateSchema.safeParse({
    medewerkerId: 4,
    naam: "Salon Medewerker",
    email: "medewerker@salondossier.nl",
    wachtwoord: "",
    rol: "ADMIN",
    status: "ACTIEF",
    salonId: 999,
    isPlatformAdmin: true
  });

  assert.equal(result.success, false);
});
