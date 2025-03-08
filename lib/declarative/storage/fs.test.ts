import { assertEquals } from "@std/assert";
import { DeclarativeStorageInMemory } from "./in-memory.ts";
import {
  readDeclarativeStorageIfExists,
  writeDeclarativeStorage,
} from "./fs.ts";

Deno.test({
  name: "Read and write DeclarativeStorage",
  permissions: { read: true, write: true },
  fn: async (t) => {
    await t.step("Read empty storage", async () => {
      const storage = await readDeclarativeStorageIfExists("./fake.json");
      assertEquals(storage, undefined);
    });

    const tempFile = await Deno.makeTempFile();
    await t.step("Write storage", async () => {
      const storage = new DeclarativeStorageInMemory<string>();
      storage.set("foo", "foo");
      await writeDeclarativeStorage(tempFile, storage);
    });

    await t.step("Read storage", async () => {
      const storage = await readDeclarativeStorageIfExists<string>(tempFile);
      assertEquals(storage, new Map([["foo", "foo"]]));
    });

    await Deno.remove(tempFile);
  },
});
