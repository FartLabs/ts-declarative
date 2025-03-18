import { assertSnapshot } from "@std/testing/snapshot";
import { Project } from "ts-morph";
import { transform, withContextDecorator } from "./classgen.ts";

const fileFooBarBaz = "./examples/classgen/foo-bar-baz.ts";

Deno.test("transform example foo-bar-baz.ts", async (t) => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(fileFooBarBaz);
  transform({ project });
  await assertSnapshot(t, sourceFile.getText());
});

Deno.test("transform example foo-bar-baz.ts with decorators", async (t) => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(fileFooBarBaz);
  transform({
    project,
    map: (structure, sourceDeclarations) => {
      return withContextDecorator(structure, sourceDeclarations);
    },
  });

  await assertSnapshot(t, sourceFile.getText());
});
