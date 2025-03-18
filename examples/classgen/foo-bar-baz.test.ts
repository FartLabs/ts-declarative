import { assertSnapshot } from "@std/testing/snapshot";
import { Project } from "ts-morph";
import { transform, withContextDecorator } from "./classgen.ts";

const relativePath = "./examples/classgen/foo-bar-baz.ts";

Deno.test("transform example foo-bar-baz.ts", async (t) => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(relativePath);
  transform(project);

  sourceFile.formatText();
  await assertSnapshot(t, sourceFile.getText());
});

Deno.test("transform example foo-bar-baz.ts with decorators", async (t) => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(relativePath);
  transform(project, {
    map(structure, sourceDeclarations) {
      return withContextDecorator(
        structure,
        sourceDeclarations,
        `${relativePath}#`,
      );
    },
  });

  sourceFile.formatText();
  await assertSnapshot(t, sourceFile.getText());
});
