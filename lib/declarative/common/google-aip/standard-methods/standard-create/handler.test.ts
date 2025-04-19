import { assertEquals } from "@std/assert/equals";
import { MemoryStandardMethodStore } from "#/lib/declarative/common/google-aip/standard-methods/common/store/memory/memory.ts";
import { standardCreateHandler } from "./handler.ts";

Deno.test("standardCreateHandler handles request", async () => {
  const handler = standardCreateHandler(
    new MemoryStandardMethodStore(),
    [],
    "name",
  );
  const request = new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "fake" }),
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { name: "fake" });
});
