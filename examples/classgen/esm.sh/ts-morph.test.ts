import { assertSnapshot } from "@std/testing/snapshot";
import { Project } from "ts-morph";
import { walkEsmSh } from "./ts-morph.ts";

// https://jsr.io/@luca/cases
Deno.test({
  name: "ts-morph project from jsr:@luca/cases",
  permissions: { net: true, read: true, write: true },
  fn: async (t) => {
    const project = new Project({ useInMemoryFileSystem: true });
    await walkEsmSh("jsr:@luca/cases@1.0.0", ({ specifier }, sourceCode) => {
      project.createSourceFile(
        specifier.slice(
          specifier.indexOf("@luca/cases"),
        ),
        sourceCode,
        { overwrite: true },
      );
    });

    await assertSnapshot(
      t,
      project.getSourceFiles().map((sourceFile) => {
        return [sourceFile.getFilePath(), sourceFile.getText()];
      }),
    );
  },
});
