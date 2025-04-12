import { assertEquals } from "@std/assert/equals";
import { standardDeleteHandler } from "./handler.ts";

Deno.test("standardDeleteHandler handles request", async () => {
  const kv = await Deno.openKv(":memory:");
  await kv.set(["test"], { name: "test" });

  const handler = standardDeleteHandler(kv, []);
  const url = new URL("http://localhost/test");
  const response = await handler(
    new Request(url),
    new URLPattern({ pathname: "/:name" }).exec(url),
  );
  assertEquals(response.status, 200);
  assertEquals((await kv.get(["test"]))?.value, null);
  kv.close();
});
