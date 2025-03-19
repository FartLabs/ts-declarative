import { Project } from "ts-morph";
import { transform } from "#/examples/classgen/classgen.ts";
import { walkEsmSh } from "#/examples/classgen/esm.sh/ts-morph.ts";

// deno -A ./examples/classgen/esm.sh/discord-api-types/main.ts
if (import.meta.main) {
  const project = new Project();
  await walkEsmSh(
    "npm:discord-api-types@0.38/payloads/v10",
    (node, sourceCode) => {
      project.createSourceFile(
        node.specifier.slice(
          node.specifier.indexOf("discord-api-types"),
        ),
        sourceCode,
        { overwrite: true },
      );
    },
  );

  transform(project);
  await project.save();
}
