import type { Project, SourceFile } from "ts-morph";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
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

export function tsMorphDecoratorFactory(
  project: Project,
): (specifier: string | URL) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (specifier: URL | string) => {
      const sourceFile = project.getSourceFileOrThrow(specifier.toString());
      return [declarativeTsMorph(sourceFile)];
    },
  });
}

export function declarativeTsMorph<TValue extends ValueTsMorph>(
  sourceFile: SourceFile,
): Declarative<TValue> {
  return (value, name) => {
    return { ...value, tsMorph: getTsMorph(sourceFile, name) } as TValue;
  };
}

export interface ValueType {
  type?: string[];
}

export const type: (
  ...args: Array<string | string[]>
) => (target: Class) => Class = createDecoratorFactory({
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
