import { assertSnapshot } from "@std/testing/snapshot";
import { Project } from "ts-morph";
import { transform } from "./classgen.ts";

const fileFooBarBaz = "./examples/classgen/foo-bar-baz.ts";

Deno.test("transform example foo-bar-baz.ts", async (t) => {
  const project = new Project();
  const typeChecker = project.getTypeChecker();
  const sourceFile = project.addSourceFileAtPath(fileFooBarBaz);
  transform(typeChecker, sourceFile);
  await assertSnapshot(t, sourceFile.getText());
});
