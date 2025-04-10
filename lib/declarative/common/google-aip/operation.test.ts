import { assertEquals } from "@std/assert/equals";
import { toOperationPath, toOperationSchema } from "./operation.ts";

Deno.test("toOperationPath should return the correct path", () => {
  const actual = toOperationPath("Person");
  assertEquals(actual, "/people");
});

Deno.test("toOperationSchema should return the correct schema", () => {
  const actual = toOperationSchema("Person", {});
  assertEquals(actual, { $ref: "#/components/schemas/Person" });
});
