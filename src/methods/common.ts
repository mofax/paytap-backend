import mKsuid from "mksuid";

export function assignId<T>(obj: T) {
  return { id: mKsuid(), ...obj };
}
