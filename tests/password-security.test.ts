import test from "node:test";
import assert from "node:assert/strict";
import {
  createLegacyPasswordHashForTests,
  hashPassword,
  needsPasswordRehash,
  verifyPassword
} from "../lib/password";

test("new password hashes use the scrypt format", async () => {
  const hashed = await hashPassword("Welkom123!");

  assert.match(hashed, /^scrypt\.v1\$/);
  assert.notEqual(hashed, "Welkom123!");
  assert.equal(needsPasswordRehash(hashed), false);
});

test("scrypt password verification succeeds for the correct password", async () => {
  const hashed = await hashPassword("Welkom123!");

  assert.equal(await verifyPassword("Welkom123!", hashed), true);
  assert.equal(await verifyPassword("Verkeerd123!", hashed), false);
});

test("legacy sha256 password hashes still verify but require rehashing", async () => {
  const legacyHash = createLegacyPasswordHashForTests("Welkom123!");

  assert.equal(await verifyPassword("Welkom123!", legacyHash), true);
  assert.equal(await verifyPassword("Verkeerd123!", legacyHash), false);
  assert.equal(needsPasswordRehash(legacyHash), true);
});

test("invalid hash formats are rejected safely", async () => {
  assert.equal(await verifyPassword("Welkom123!", "geen-geldige-hash"), false);
});
