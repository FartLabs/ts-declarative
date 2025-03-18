import { assertSnapshot } from "@std/testing/snapshot";
import { Project } from "ts-morph";
import { transform } from "./classgen.ts";

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
      return {
        ...structure,
        decorators: [
          ...(structure?.decorators ?? []),
          {
            name: "context",
            arguments: [
              `{ ${
                Array.from(sourceDeclarations.entries(), ([key, value]) => {
                  // TODO: Get name of value node, which is a type alias, class, or interface declaration.
                  return `${key}: \`${value.getText()}\``;
                }).join(", ")
              } }`,
            ],
          },
        ],
      };
    },
  });
  await assertSnapshot(t, sourceFile.getText());
});
