import { assertEquals } from "@std/assert";
import { context } from "./context.ts";
import { type } from "./type.ts";
import { docOf, jsonld } from "./jsonld.ts";

const exampleContext = "https://example.com/";
const exampleType = "MyPerson";
const exampleName0 = "Ash Ketchum";
const exampleName1 = "Gary Oak";

@context(exampleContext)
@type(exampleType)
class Example0 {
  public constructor(public name: string) {}
}

@jsonld({
  context: exampleContext,
  type: exampleType,
})
class Example1 {
  public constructor(public name: string) {}
}

Deno.test("docOf renders linked data", () => {
  const example0 = new Example0(exampleName0);
  assertEquals(docOf(example0), {
    "@context": exampleContext,
    "@type": exampleType,
    name: exampleName0,
  });

  const example1 = new Example1(exampleName1);
  assertEquals(docOf(example1), {
    "@context": exampleContext,
    "@type": exampleType,
    name: exampleName1,
  });
});
