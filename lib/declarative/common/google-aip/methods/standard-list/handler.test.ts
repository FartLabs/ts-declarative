import { assertEquals } from "@std/assert/equals";
import { standardListHandler } from "./handler.ts";

Deno.test("standardListHandler handles request", async () => {
  const kv = await Deno.openKv(":memory:");
  await kv.set(["fake"], { name: "fake" });

  const handler = standardListHandler(kv, []);
  const request = new Request("http://localhost", {
    method: "GET",
    headers: { "content-type": "application/json" },
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
  assertEquals(await response.json(), [{ name: "fake" }]);
  kv.close();
});
