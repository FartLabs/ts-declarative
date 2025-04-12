import { assertEquals } from "@std/assert/equals";
import { standardCreateHandler } from "./handler.ts";

Deno.test("standardCreateHandler handles request", async () => {
  const kv = await Deno.openKv(":memory:");
  const handler = standardCreateHandler(kv, []);
  const request = new Request("http://localhost", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "test" }),
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { name: "test" });
  kv.close();
});
