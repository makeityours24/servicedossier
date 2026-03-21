import test from "node:test";
import assert from "node:assert/strict";
import {
  createPasswordResetToken,
  getPasswordResetTokenError,
  hashPasswordResetToken
} from "../lib/password-reset";

test("password reset tokens are random and only stored as hashes", () => {
  const first = createPasswordResetToken(new Date("2026-03-21T10:00:00.000Z"));
  const second = createPasswordResetToken(new Date("2026-03-21T10:00:00.000Z"));

  assert.notEqual(first.token, second.token);
  assert.equal(first.tokenHash, hashPasswordResetToken(first.token));
  assert.notEqual(first.token, first.tokenHash);
});

test("password reset helper rejects missing, used and expired tokens", () => {
  const now = new Date("2026-03-21T10:00:00.000Z");

  assert.equal(
    getPasswordResetTokenError({
      exists: false,
      now
    }),
    "Deze resetlink is ongeldig of verlopen."
  );

  assert.equal(
    getPasswordResetTokenError({
      exists: true,
      usedAt: new Date("2026-03-21T09:30:00.000Z"),
      expiresAt: new Date("2026-03-21T11:00:00.000Z"),
      now
    }),
    "Deze resetlink is ongeldig of verlopen."
  );

  assert.equal(
    getPasswordResetTokenError({
      exists: true,
      usedAt: null,
      expiresAt: new Date("2026-03-21T09:59:59.000Z"),
      now
    }),
    "Deze resetlink is ongeldig of verlopen."
  );
});

test("password reset helper allows a fresh unused token", () => {
  const now = new Date("2026-03-21T10:00:00.000Z");

  assert.equal(
    getPasswordResetTokenError({
      exists: true,
      usedAt: null,
      expiresAt: new Date("2026-03-21T10:30:00.000Z"),
      now
    }),
    null
  );
});
