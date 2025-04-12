import { assertEquals } from "@std/assert/equals";
import { standardUpdateHandler } from "./handler.ts";

Deno.test("standardUpdateHandler handles request", async () => {
  const kv = await Deno.openKv(":memory:");
  const handler = standardUpdateHandler(kv, []);
  const request = new Request("http://localhost/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "test" }),
  });

  const response = await handler(
    request,
    new URLPattern({ pathname: "/:name" }).exec(request.url),
  );
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { name: "test" });
  kv.close();
});
