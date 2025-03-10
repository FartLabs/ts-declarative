import type { ClassDeclarationStructure, ProjectOptions } from "ts-morph";
import { Project } from "ts-morph";
import type { Declarative } from "#/lib/declarative/declarative.ts";

export type { ClassDeclarationStructure };

export interface StateTsMorph {
  tsMorph?: ClassDeclarationStructure;
}

export async function declarativeTsMorph<TState extends StateTsMorph>(
  entrypoint: URL | string,
  options?: ProjectOptions,
): Promise<Declarative<TState>> {
  const project = new Project({ useInMemoryFileSystem: true, ...options });
  const sourceFile = project.createSourceFile(
    entrypoint.toString(),
    await Deno.readTextFile(entrypoint),
    { overwrite: true },
  );

  return (state, _id, name) => {
    const structure = sourceFile.getClass(name)?.getStructure();
    if (structure === undefined) {
      throw new Error(`Could not find structure for ${name}`);
    }

    return { ...state, tsMorph: structure };
  };
}
