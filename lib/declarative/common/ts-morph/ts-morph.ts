import type { Project, SourceFile } from "ts-morph";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

/**
 * TsMorphProperty is the type information of a property in a class analyzed by
 * ts-morph. This is used to analyze the class and its properties.
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
 * tsMorphPropertiesOf returns the ts-morph analysis of the class.
 */
export function tsMorphPropertiesOf<TClass extends Class>(
  target: TClass,
): TsMorphProperty[] | undefined {
  return getPrototypeValue<ValueTsMorphProperties>(target)?.properties;
}

/**
 * ValueTsMorphProperties is the result of the ts-morph analysis of the class. This
 * provides information about the class and its properties.
 */
export interface ValueTsMorphProperties {
  /**
   * properties is the list of properties of the class analyzed by ts-morph.
   */
  properties?: TsMorphProperty[];
}

/**
 * tsMorphPropertiesDecoratorFactory is a decorator factory that analyzes the
 * class with ts-morph. This is used to analyze the class and its properties.
 */
export function tsMorphPropertiesDecoratorFactory(
  project: Project,
): (specifier: string | URL) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (specifier: URL | string) => {
      const sourceFile = project.getSourceFileOrThrow(specifier.toString());
      return [declarativeTsMorphProperties(sourceFile)];
    },
  });
}

/**
 * declarativeTsMorphProperties is a declarative function that analyzes the class
 * with ts-morph. This is used to analyze the class and its properties.
 */
export function declarativeTsMorphProperties<
  TValue extends ValueTsMorphProperties,
>(
  sourceFile: SourceFile,
): Declarative<TValue> {
  return (value, name) => {
    return {
      ...value,
      properties: getTsMorphProperties(sourceFile, name),
    } as TValue;
  };
}

function getTsMorphProperties(
  sourceFile: SourceFile,
  name: string,
): TsMorphProperty[] {
  const classDeclaration = sourceFile.getClassOrThrow(name);
  const propertyDeclarations = classDeclaration.getProperties();
  const constructorParameterDeclarations =
    classDeclaration.getConstructors().at(-1)?.getParameters() ?? [];

  return [
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
  ];
}
