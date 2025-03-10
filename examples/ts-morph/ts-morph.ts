import type { ProjectOptions, SourceFile } from "ts-morph";
import { Project } from "ts-morph";
import type { Declarative } from "#/lib/declarative/declarative.ts";

/**
 * TsMorph is a declarative class type from ts-morph.
 */
export interface TsMorph {
  properties: TsMorphProperty[];
}

export interface TsMorphProperty {
  name: string;
  type: string;
  paramIndex?: number;
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
  const propertyDeclarations = classDeclaration?.getProperties() ?? [];
  const constructorParameterDeclarations = classDeclaration
    ?.getConstructors()
    .at(-1)
    ?.getParameters()
    ?.filter((param) => param.getScope() === "public") ?? [];

  return {
    properties: [
      ...propertyDeclarations.map((property): TsMorphProperty => {
        return {
          name: property.getName(),
          type: property.getType().getText(),
        };
      }),
      ...constructorParameterDeclarations.map(
        (parameter, i): TsMorphProperty => {
          return {
            name: parameter.getName(),
            type: parameter.getType().getText(),
            paramIndex: i,
          };
        },
      ),
    ],
  };
}
