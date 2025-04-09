import { expandStrings } from "./sparql.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test("expandStrings expands strings correctly", () => {
  const expanded = expandStrings("https://schema.org/", [
    "givenName",
    "familyName",
    "https://example.org/example",
  ]);
  assertEquals(expanded, [
    "https://schema.org/givenName",
    "https://schema.org/familyName",
    "https://example.org/example",
  ]);
});
