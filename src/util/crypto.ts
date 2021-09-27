import assert from "assert";
import { hkdf, randomBytes } from "crypto";
import jwtTools from "jsonwebtoken";

import { promisify } from "util";
import { POJO } from "../db/types";
import { JWT_KEY } from "./constants";

const HASH_LENGTH = 64;
const SALT_LENGTH = 16;
export const getRandomBytes = promisify(randomBytes);
export const hkdfPromise = promisify(hkdf);

export async function hashNewPassword(password: string, providedSalt?: Buffer) {
  const salt = providedSalt || (await getRandomBytes(SALT_LENGTH));
  assert(salt.length === SALT_LENGTH, "system generated invalid salt length");
  const derivedKey = await hkdfPromise(
    "sha512",
    password,
    salt,
    "info",
    HASH_LENGTH
  );
  const hash = Buffer.from(derivedKey);
  assert(hash.length === HASH_LENGTH, "system generated invalid hkdf length");
  return Buffer.concat([salt, hash]).toString("hex");
}

export function splitHashedPassword(password: string): [Buffer, Buffer] {
  const pass = Buffer.allocUnsafe(HASH_LENGTH);
  const salt = Buffer.allocUnsafe(SALT_LENGTH);
  const passwordBuffer = Buffer.from(password, "hex");

  assert(
    passwordBuffer.length === HASH_LENGTH + SALT_LENGTH,
    "invalid password provided for splitting"
  );

  for (let i = 0; i < passwordBuffer.length; i++) {
    if (i < SALT_LENGTH) {
      salt[i] = passwordBuffer[i] as number;
    } else {
      const index = i - SALT_LENGTH;
      pass[index] = passwordBuffer[i] as number;
    }
  }

  return [salt, pass];
}

export async function verifyExistingPassword(provided: string, stored: string) {
  const [storedSalt] = splitHashedPassword(stored);
  const generatedHash = await hashNewPassword(provided, storedSalt);
  return generatedHash === stored;
}

export async function signJWTToken(data: POJO) {
  return await jwtTools.sign(data, JWT_KEY);
}

export async function verifyJWTToken(token: string) {
  return await jwtTools.verify(token, JWT_KEY);
}
