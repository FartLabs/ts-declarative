import { assertEquals } from "@std/assert/equals";
import { standardDeleteHandler } from "./handler.ts";

Deno.test("standardDeleteHandler handles request", async () => {
  const kv = await Deno.openKv(":memory:");
  await kv.set(["test"], { name: "test" });

  const handler = standardDeleteHandler(kv, []);
  const request = new Request("http://localhost/test", { method: "DELETE" });
  const response = await handler(
    request,
    new URLPattern({ pathname: "/:name" }).exec(request.url),
  );
  assertEquals(response.status, 200);
  assertEquals((await kv.get(["test"]))?.value, null);
  kv.close();
});
