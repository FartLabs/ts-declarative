import { assertEquals } from "@std/assert";
import { toCollectionIdentifier } from "./to-collection-identifier.ts";

Deno.test(
  "toCollectionIdentifier converts a resource name to a collection identifier",
  () => {
    assertEquals(toCollectionIdentifier("Person"), "people");
  },
);
