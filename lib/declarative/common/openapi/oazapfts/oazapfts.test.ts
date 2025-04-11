import { assertSnapshot } from "@std/testing/snapshot";
import {
  standardCreate,
  standardGet,
} from "#/lib/declarative/common/google-aip/mod.ts";
import { openapi } from "#/lib/declarative/common/openapi/openapi.ts";
import { generateOazapftsOf, oazapfts } from "./oazapfts.ts";

@standardCreate()
@standardGet()
class Person {
  public constructor(public name: string) {}
}

@oazapfts({ optimistic: true })
@openapi({
  specification: {
    openapi: "3.0.1",
    info: { title: "App", version: "0.0.1" },
    components: {},
  },
  resources: [Person],
})
class App {}

// TODO: error: MissingPointerError: Token "schemas" does not exist.
Deno.test("oazapfts decorator decorates value", async (t) => {
  const sourceCode = await generateOazapftsOf(App);
  assertSnapshot(t, sourceCode);
});
