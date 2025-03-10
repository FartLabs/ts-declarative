import type { ProjectOptions, SourceFile } from "ts-morph";
import { Project } from "ts-morph";
import type { Declarative } from "#/lib/declarative/declarative.ts";

/**
 * TsMorph is a declarative class type from ts-morph.
 */
export interface TsMorph {
  properties: Array<[string, string]>;
}

export interface StateTsMorph {
  tsMorph?: TsMorph;
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
    return { ...state, tsMorph: getTsMorph(sourceFile, name) };
  };
}

function getTsMorph(sourceFile: SourceFile, name: string): TsMorph {
  const classDeclaration = sourceFile.getClass(name);
  const propertyDeclarations = classDeclaration?.getProperties();
  if (propertyDeclarations === undefined) {
    throw new Error(`Could not find property declarations for ${name}`);
  }

  return {
    properties: propertyDeclarations.map((property) => {
      return [property.getName(), property.getType().getText()];
    }),
  };
}
