import { assertEquals } from "@std/assert/equals";
import { standardDeleteHandler } from "./handler.ts";

Deno.test("standardDeleteHandler handles request", async () => {
  const kv = await Deno.openKv(":memory:");
  await kv.set(["fake"], { name: "fake" });

  const handler = standardDeleteHandler(kv, [], "name");
  const request = new Request("http://localhost/fake", { method: "DELETE" });
  const response = await handler(
    request,
    new URLPattern({ pathname: "/:name" }).exec(request.url),
  );
  assertEquals(response.status, 200);
  assertEquals((await kv.get(["fake"]))?.value, null);
  kv.close();
});
