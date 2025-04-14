import { assertEquals } from "@std/assert/equals";
import { standardGetHandler } from "./handler.ts";

Deno.test("standardGetHandler handles request", async () => {
  const kv = await Deno.openKv(":memory:");
  await kv.set(["fake"], { name: "fake" });

  const handler = standardGetHandler(kv, [], "name");
  const request = new Request("http://localhost/fake");
  const response = await handler(
    request,
    new URLPattern({ pathname: "/:name" }).exec(request.url),
  );
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { name: "fake" });
  kv.close();
});
