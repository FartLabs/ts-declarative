import { exists } from "@std/fs/exists";
import type { DeclarativeStorageInMemory } from "./in-memory.ts";

/**
 * readDeclarativeStorageIfExists reads the declarative storage from a file
 * if it exists.
 */
export async function readDeclarativeStorageIfExists<T>(
  specifier: string | URL,
): Promise<Map<string, T> | undefined> {
  if (!(await exists(specifier))) {
    return;
  }

  return deserializeStorage(await Deno.readTextFile(specifier));
}

/**
 * writeDeclarativeStorage writes the declarative storage to a file.
 */
export async function writeDeclarativeStorage<T>(
  specifier: string | URL,
  { data }: DeclarativeStorageInMemory<T>,
): Promise<void> {
  await Deno.writeTextFile(specifier, serializeStorage(data));
}

/**
 * serializeStorage serializes a Map into a string.
 */
export function serializeStorage<T>(
  storage: Map<string, T>,
  stringify: (data: Array<[string, T]>) => string = (data) =>
    JSON.stringify(data),
): string {
  return stringify(Array.from(storage.entries()));
}

/**
 * deserializeStorage deserializes a string into a Map.
 */
export function deserializeStorage<T>(data: string): Map<string, T> {
  if (data.trim() === "") {
    return new Map();
  }

  return new Map(JSON.parse(data));
}
