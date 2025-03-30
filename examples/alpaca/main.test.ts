import { assertSnapshot } from "@std/testing/snapshot";
import { jsonSchemaPerson, renderTemplate } from "./main.ts";

Deno.test("Generate Alpaca form from JSON Schema", async (t) => {
  await assertSnapshot(
    t,
    await renderTemplate(JSON.stringify(jsonSchemaPerson)),
  );
});
