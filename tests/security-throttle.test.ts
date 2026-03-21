import test from "node:test";
import assert from "node:assert/strict";
import { getNextThrottleState } from "../lib/security";

test("login and action throttles increment inside the active window", () => {
  const now = new Date("2026-03-21T10:00:00.000Z");
  const currentWindowStart = new Date("2026-03-21T09:55:00.000Z");

  const result = getNextThrottleState({
    currentWindowStart,
    currentAttemptCount: 3,
    now,
    windowMinutes: 10,
    maxAttempts: 5,
    blockMinutes: 10
  });

  assert.equal(result.nextCount, 4);
  assert.equal(result.windowStart, currentWindowStart);
  assert.equal(result.blockedUntil, null);
});

test("throttle blocks once the configured threshold is reached", () => {
  const now = new Date("2026-03-21T10:00:00.000Z");

  const result = getNextThrottleState({
    currentWindowStart: new Date("2026-03-21T09:59:00.000Z"),
    currentAttemptCount: 4,
    now,
    windowMinutes: 10,
    maxAttempts: 5,
    blockMinutes: 10
  });

  assert.equal(result.nextCount, 5);
  assert.equal(result.blockedUntil?.toISOString(), "2026-03-21T10:10:00.000Z");
});

test("expired throttle windows reset the attempt count", () => {
  const now = new Date("2026-03-21T10:00:00.000Z");

  const result = getNextThrottleState({
    currentWindowStart: new Date("2026-03-21T09:30:00.000Z"),
    currentAttemptCount: 8,
    now,
    windowMinutes: 10,
    maxAttempts: 5,
    blockMinutes: 10
  });

  assert.equal(result.nextCount, 1);
  assert.equal(result.windowStart.toISOString(), now.toISOString());
  assert.equal(result.blockedUntil, null);
});
