import { exists } from "@std/fs/exists";
import { DeclarativeStorageInMemory } from "./in-memory.ts";

export async function readDeclarativeStorageIfExists(specifier: string | URL) {
  if (!(await exists(specifier))) {
    return;
  }

  return await Deno.readTextFile(specifier);
}

export async function writeDeclarativeStorage<T>(
  specifier: string | URL,
  { data }: DeclarativeStorageInMemory<T>,
) {
  await Deno.writeTextFile(specifier, serializeStorage(data));
}

export function serializeStorage<T>(
  storage: Map<string, T>,
  stringify = (data: Array<[string, T]>) => JSON.stringify(data),
): string {
  return stringify(Array.from(storage.entries()));
}

export function deserializeStorage<T>(storage: string): Map<string, T> {
  return new Map(JSON.parse(storage));
}
