import { assertSnapshot } from "@std/testing/snapshot";
import { Project } from "ts-morph";
import { addEsmSh } from "./ts-morph.ts";

// https://jsr.io/@luca/cases
const specifier = "jsr:@luca/cases@1.0.0";

Deno.test({
  name: "ts-morph project from jsr:@luca/cases",
  permissions: { net: true },
  fn: async (t) => {
    const project = new Project({ useInMemoryFileSystem: true });
    await addEsmSh(project, specifier);

    await assertSnapshot(
      t,
      project.getSourceFiles().map((sourceFile) => {
        return [sourceFile.getFilePath(), sourceFile.getText()];
      }),
    );
  },
});
