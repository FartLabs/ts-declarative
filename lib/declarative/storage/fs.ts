import { exists } from "@std/fs/exists";
import { DeclarativeStorageInMemory } from "./in-memory.ts";

export async function readDeclarativeStorageIfExists<T>(
  specifier: string | URL,
): Promise<Map<string, T> | undefined> {
  if (!(await exists(specifier))) {
    return;
  }

  return deserializeStorage(await Deno.readTextFile(specifier));
}

export async function writeDeclarativeStorage<T>(
  specifier: string | URL,
  { data }: DeclarativeStorageInMemory<T>,
): Promise<void> {
  await Deno.writeTextFile(specifier, serializeStorage(data));
}

export function serializeStorage<T>(
  storage: Map<string, T>,
  stringify: (data: Array<[string, T]>) => string = (data) =>
    JSON.stringify(data),
): string {
  return stringify(Array.from(storage.entries()));
}

export function deserializeStorage<T>(data: string): Map<string, T> {
  if (data.trim() === "") {
    return new Map();
  }

  return new Map(JSON.parse(data));
}
