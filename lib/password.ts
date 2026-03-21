import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto";

const LEGACY_SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const PASSWORD_SCHEME = "scrypt.v1";
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_MAX_MEMORY = 32 * 1024 * 1024;

function hashLegacyPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function parsePasswordHash(storedHash: string) {
  const [scheme, salt, digest] = storedHash.split("$");

  if (!scheme || !salt || !digest || scheme !== PASSWORD_SCHEME) {
    return null;
  }

  if (!/^[a-f0-9]+$/i.test(salt) || !/^[a-f0-9]+$/i.test(digest)) {
    return null;
  }

  return {
    salt,
    digest: Buffer.from(digest, "hex")
  };
}

async function derivePasswordKey(password: string, salt: string) {
  return await new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
      {
        N: 16_384,
        r: 8,
        p: 1,
        maxmem: PASSWORD_MAX_MEMORY
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey as Buffer);
      }
    );
  });
}

export async function hashPassword(value: string) {
  const salt = randomBytes(PASSWORD_SALT_BYTES).toString("hex");
  const digest = await derivePasswordKey(value, salt);
  return `${PASSWORD_SCHEME}$${salt}$${digest.toString("hex")}`;
}

export function needsPasswordRehash(storedHash: string) {
  return !storedHash.startsWith(`${PASSWORD_SCHEME}$`);
}

export async function verifyPassword(password: string, storedHash: string) {
  const parsed = parsePasswordHash(storedHash);

  if (parsed) {
    const derived = await derivePasswordKey(password, parsed.salt);
    return (
      derived.length === parsed.digest.length &&
      timingSafeEqual(derived, parsed.digest)
    );
  }

  if (!LEGACY_SHA256_PATTERN.test(storedHash)) {
    return false;
  }

  const candidate = Buffer.from(hashLegacyPassword(password), "hex");
  const existing = Buffer.from(storedHash, "hex");
  return candidate.length === existing.length && timingSafeEqual(candidate, existing);
}

export function createLegacyPasswordHashForTests(password: string) {
  return hashLegacyPassword(password);
}
