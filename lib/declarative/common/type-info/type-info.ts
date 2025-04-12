import { Project } from "ts-morph";
import type { SourceFile } from "ts-morph";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";

/**
 * typeInfoOf returns the ts-morph analysis of the class.
 */
export function typeInfoOf<TClass extends Class>(
  target: TClass,
): ValueTypeInfo | undefined {
  const { properties } = getPrototypeValue<ValueTypeInfo>(target) ?? {};
  return { properties };
}

/**
 * createTypeInfoDecoratorFactoryAt is a decorator factory that analyzes the
 * class with ts-morph. This is used to analyze the properties of a class in
 * a specific source file.
 */
export async function createTypeInfoDecoratorFactoryAt(
  { url }: ImportMeta,
): Promise<(specifier?: string | URL) => (target: Class) => Class> {
  const project = new Project({ useInMemoryFileSystem: true });
  const specifier = new URL(url);
  project.createSourceFile(
    specifier.toString(),
    await Deno.readTextFile(specifier),
  );

  return createTypeInfoDecoratorFactory(project, specifier);
}

/**
 * createTypeInfoDecoratorFactory is a decorator factory that analyzes the
 * class with ts-morph. This is used to analyze the class and its properties.
 */
export function createTypeInfoDecoratorFactory(
  project: Project,
  defaultSpecifier?: string | URL,
): (specifier?: string | URL) => (target: Class) => Class {
  return createDecoratorFactory({
    initialize: (specifier: URL | string | undefined = defaultSpecifier) => {
      if (specifier === undefined) {
        throw new Error("specifier is required");
      }

      return [declarativeTypeInfo(project, specifier)];
    },
  });
}

/**
 * declarativeTypeInfo is a declarative function that analyzes a class
 * with ts-morph. This is used to analyze the class and its properties.
 */
export function declarativeTypeInfo<TValue extends ValueTypeInfo>(
  project: Project,
  specifier: string | URL,
): Declarative<TValue> {
  const sourceFile = project.getSourceFile(specifier.toString()) ??
    project.addSourceFileAtPath(specifier.toString());
  return (value, name) => {
    return {
      ...value,
      properties: getProperties(sourceFile, name),
    } as TValue;
  };
}

function getProperties(
  sourceFile: SourceFile,
  name: string,
): PropertyTypeInfo[] {
  const classDeclaration = sourceFile.getClassOrThrow(name);
  const propertyDeclarations = classDeclaration.getProperties();
  const constructorParameterDeclarations =
    classDeclaration.getConstructors().at(-1)?.getParameters() ?? [];

  return [
    ...propertyDeclarations.map((property): PropertyTypeInfo => {
      return {
        name: property.getName(),
        type: property.getType().getText(),
      };
    }),
    ...constructorParameterDeclarations.reduce<PropertyTypeInfo[]>(
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

/**
 * ValueTypeInfo is the result of the ts-morph analysis of the class. This
 * provides information about the class and its properties.
 */
export interface ValueTypeInfo {
  /**
   * properties is the list of properties of the class analyzed by ts-morph.
   */
  properties?: PropertyTypeInfo[];
}

/**
 * PropertyTypeInfo is the type information of a property in a class analyzed
 * by ts-morph.
 */
export interface PropertyTypeInfo {
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
  // TODO: Add JSDoc.
  // TODO: Add which class the inherited properties associate with respectively.
}
