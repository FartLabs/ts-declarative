import { assertEquals } from "@std/assert/equals";
import { DenoKvStandardMethodStorage } from "#/lib/declarative/common/google-aip/standard-methods/common/storage/deno-kv/deno-kv.ts";
import { standardDeleteHandler } from "./handler.ts";

Deno.test("standardDeleteHandler handles request", async () => {
  using kv = await Deno.openKv(":memory:");
  const storage = new DenoKvStandardMethodStorage(kv);
  await storage.set(["fake"], { name: "fake" });

  const handler = standardDeleteHandler(storage, [], "name");
  const request = new Request("http://localhost/fake", { method: "DELETE" });
  const response = await handler(
    request,
    new URLPattern({ pathname: "/:name" }).exec(request.url),
  );
  assertEquals(response.status, 200);
  assertEquals((await kv.get(["fake"]))?.value, null);
});
