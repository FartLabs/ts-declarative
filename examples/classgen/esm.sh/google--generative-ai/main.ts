import { Project } from "ts-morph";
import { transform } from "#/examples/classgen/classgen.ts";
import { walkEsmSh } from "#/examples/classgen/esm.sh/ts-morph.ts";

// deno -A ./examples/classgen/esm.sh/google--generative-ai/main.ts
if (import.meta.main) {
  const project = new Project();
  await walkEsmSh(
    "npm:@google/generative-ai",
    (node, sourceCode) => {
      project.createSourceFile(
        node.specifier.slice(
          node.specifier.indexOf("@google/generative-ai"),
        ),
        sourceCode,
        { overwrite: true },
      );
    },
  );

  transform(project);
  await project.save();
}
