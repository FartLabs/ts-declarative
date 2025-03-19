import { Project } from "ts-morph";
import { transform } from "#/examples/classgen/classgen.ts";
import { walkEsmSh } from "#/examples/classgen/esm.sh/ts-morph.ts";

// deno -A ./examples/classgen/esm.sh/notionhq--client/main.ts
if (import.meta.main) {
  const project = new Project();
  await walkEsmSh("npm:@notionhq/client@2.3.0", (node, sourceCode) => {
    project.createSourceFile(
      node.specifier.slice(node.specifier.indexOf("@notionhq/client")),
      sourceCode,
      { overwrite: true },
    );
  });

  transform(project);
  await project.save();
}
