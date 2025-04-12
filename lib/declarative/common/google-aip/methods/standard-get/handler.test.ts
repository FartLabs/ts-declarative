import { assertEquals } from "@std/assert/equals";
import { standardGetHandler } from "./handler.ts";

Deno.test("standardGetHandler handles request", async () => {
  const kv = await Deno.openKv(":memory:");
  await kv.set(["test"], { name: "test" });

  const handler = standardGetHandler(kv, []);
  const url = new URL("http://localhost/test");
  const response = await handler(
    new Request(url),
    new URLPattern({ pathname: "/:name" }).exec(url),
  );
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { name: "test" });
  kv.close();
});
