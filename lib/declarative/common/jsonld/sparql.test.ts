import { expandStrings, makeCompliancyQuery } from "./sparql.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test("makeCompliancyQuery makes a valid query", () => {
  const query = makeCompliancyQuery("https://schema.org/Person", [
    "https://schema.org/givenName",
    "https://schema.org/familyName",
  ]);
  assertEquals(
    query,
    `ASK {
<https://schema.org/givenName> <https://schema.org/domainIncludes> <https://schema.org/Person> .
<https://schema.org/familyName> <https://schema.org/domainIncludes> <https://schema.org/Person> .
}`,
  );
});

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
