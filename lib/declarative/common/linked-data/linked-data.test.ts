import { assertEquals } from "@std/assert";
import { context } from "./context.ts";
import { type } from "./type.ts";
import { docOf } from "./linked-data.ts";

const exampleContext = "http://example.com/";
const exampleType = "MyPerson";

@context(exampleContext)
@type(exampleType)
class Person {
  public constructor(public name: string) {}
}

Deno.test("docOf renders linked data", () => {
  const example = new Person("Ash Ketchum");
  assertEquals(docOf(example), {
    "@context": "http://example.com/",
    "@type": ["MyPerson"],
    name: "Ash Ketchum",
  });
});
