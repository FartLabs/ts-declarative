import { assertEquals } from "@std/assert/equals";
import { standardCreateHandler } from "./handler.ts";

Deno.test("standardCreateHandler handles request", async () => {
  using kv = await Deno.openKv(":memory:");
  const handler = standardCreateHandler(kv, [], "name");
  const request = new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "fake" }),
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { name: "fake" });
});
