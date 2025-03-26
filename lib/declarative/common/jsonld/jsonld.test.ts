import { assertEquals } from "@std/assert";
import { context } from "./context.ts";
import { type } from "./type.ts";
import { docOf, jsonld } from "./jsonld.ts";

const exampleContext = "http://example.com/";
const exampleType = "MyPerson";

@context(exampleContext)
@type(exampleType)
class Example0 {
  public constructor(public name: string) {}
}

@jsonld({
  context: exampleContext,
  type: [exampleType],
})
class Example1 {
  public constructor(public name: string) {}
}

Deno.test("docOf renders linked data", () => {
  const example0 = new Example0("Ash Ketchum");
  assertEquals(docOf(example0), {
    "@context": "http://example.com/",
    "@type": ["MyPerson"],
    name: "Ash Ketchum",
  });

  const example1 = new Example1("Gary Oak");
  assertEquals(docOf(example1), {
    "@context": "http://example.com/",
    "@type": ["MyPerson"],
    name: "Gary Oak",
  });
});
