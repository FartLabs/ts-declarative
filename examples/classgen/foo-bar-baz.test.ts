import { assertSnapshot } from "@std/testing/snapshot";
import { Project } from "ts-morph";
import {
  transform,
  withAddContextDecorator,
} from "./classgen.ts";

const prefix = "https://github.com/FartLabs/ts-declarative/blob/main";
const relativePath = "./examples/classgen/foo-bar-baz.ts";

Deno.test("transform example foo-bar-baz.ts", async (t) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    relativePath,
    await Deno.readTextFile(relativePath),
  );
  transform(project);

  await assertSnapshot(t, sourceFile.getText());
});

Deno.test("transform example foo-bar-baz.ts with decorators", async (t) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    relativePath,
    await Deno.readTextFile(relativePath),
  );
  transform(project, (info) => withAddContextDecorator(info, prefix));

  await assertSnapshot(t, sourceFile.getText());
});
