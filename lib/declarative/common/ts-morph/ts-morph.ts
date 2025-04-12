import type { Project, SourceFile } from "ts-morph";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

/**
 * TsMorph is a declarative class type from ts-morph.
 */
export interface TsMorph {
  /**
   * properties is the list of properties of the class.
   */
  properties: TsMorphProperty[];
}

/**
 * TsMorphProperty is a property of the class.
 */
export interface TsMorphProperty {
  /**
   * name is the name of the property. This is the name of the property in the
   * class.
   */
  name: string;

  /**
   * type is the type of the property. This is the type expression of the
   * property.
   */
  type: string;

  /**
   * paramIndex is the index of the constructor parameter. If the property is not
   * a constructor parameter, this will be undefined.
   */
  paramIndex?: number;

  //
  // TODO: Add documentation.
  // TODO: Add which class the inherited properties associate with respectively.
}

/**
 * tsMorphOf returns the ts-morph analysis of the class.
 */
export function tsMorphOf<TClass extends Class>(
  target: TClass,
): TsMorph | undefined {
  return getPrototypeValue<ValueTsMorph>(target)?.tsMorph;
}

/**
 * ValueTsMorph is the value for the ts-morph decorator.
 */
export interface ValueTsMorph {
  /**
   * tsMorph is the ts-morph analysis of the class.
   */
  tsMorph?: TsMorph;
}

/**
 * tsMorph is a decorator to analyze the class with ts-morph.
 */
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

/**
 * declarativeTsMorph is a declarative function from ts-morph.
 */
export function declarativeTsMorph<TValue extends ValueTsMorph>(
  sourceFile: SourceFile,
): Declarative<TValue> {
  return (value, name) => {
    return { ...value, tsMorph: getTsMorph(sourceFile, name) } as TValue;
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
