import type { ProjectOptions, SourceFile } from "ts-morph";
import { Project } from "ts-morph";
import type { Declarative } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

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
  // TODO: Add documentation.
  // TODO: Add which class the inherited properties associate with respectively.
}

export interface ValueTsMorph {
  tsMorph?: TsMorph;
}

export const tsMorph = createDecoratorFactory({
  initialize: async (entrypoint: URL | string, options?: ProjectOptions) => {
    return [await declarativeTsMorph(entrypoint, options)];
  },
});

export async function declarativeTsMorph<TValue extends ValueTsMorph>(
  entrypoint: URL | string,
  options?: ProjectOptions,
): Promise<Declarative<TValue>> {
  const project = new Project({ useInMemoryFileSystem: true, ...options });
  const sourceFile = project.createSourceFile(
    entrypoint.toString(),
    await Deno.readTextFile(entrypoint),
    { overwrite: true },
  );

  return (value, name) => {
    return { ...value, tsMorph: getTsMorph(sourceFile, name) } as TValue;
  };
}

// shit

export interface ValueType {
  type?: string[];
}

export const type = createDecoratorFactory({
  initialize: (...type: Array<string | string[]>) => {
    return [declarativeType(...type)];
  },
});

export function declarativeType<TValue extends ValueType>(
  ...type: Array<string | string[]>
): Declarative<TValue> {
  return <TValue extends ValueType>(value: TValue | undefined): TValue => {
    return { ...value, type: type.flat() } as TValue;
  };
}

// shit

function getTsMorph(sourceFile: SourceFile, name: string): TsMorph {
  const classDeclaration = sourceFile.getClass(name);
  const propertyDeclarations = classDeclaration?.getProperties() ?? [];
  const constructorParameterDeclarations =
    classDeclaration?.getConstructors().at(-1)?.getParameters() ?? [];

  return {
    properties: [
      ...propertyDeclarations.map((property): TsMorphProperty => {
        return {
          name: property.getName(),
          type: property.getType().getText(),
        };
      }),
      ...constructorParameterDeclarations.reduce<TsMorphProperty[]>(
        (acc, parameter, i) => {
          if (parameter.getScope() === "public") {
            acc.push({
              name: parameter.getName(),
              type: parameter.getType().getText(),
              paramIndex: i,
            });
          }

          return acc;
        },
        [],
      ),
    ],
  };
}
