import { StructureKind, SyntaxKind } from "ts-morph";
import type {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
  Node,
  Project,
  PropertyDeclarationStructure,
  SourceFile,
  Type,
  TypeAliasDeclaration,
  TypeChecker,
} from "ts-morph";

/**
 * transform transforms each applicable TypeScript type into an equivalent
 * TypeScript class declaration. This replacement happens in-place.
 */
export function transform(
  project: Project,
  _fn?: (
    structure: ClassDeclarationStructure,
    declarations: Map<
      string,
      ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration
    >,
  ) => ClassDeclarationStructure,
) {
  const _changes = fromProject(project);
  // TODO: Replace the source declarations with the new ones.
}

export interface ClassgenDeclaration {
  /**
   * structure is the equivalent TypeScript class declaration structure
   * generated from the given source file.
   */
  structure: ClassDeclarationStructure;

  /**
   * declarations are the source declarations for the given structure's
   * properties.
   */
  declarations: Map<string, Node>; // ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration
}

/**
 * fromProject generates equivalent TypeScript class declaration structures
 * from the given project.
 */
export function fromProject(project: Project): ClassgenDeclaration[] {
  return project.getSourceFiles().flatMap((sourceFile) => {
    return fromSourceFile(sourceFile);
  });
}

/**
 * fromSourceFile generates equivalent TypeScript class declaration structures
 * from the given source file.
 */
export function fromSourceFile(sourceFile: SourceFile): ClassgenDeclaration[] {
  // TODO: Consider migrating to transform API.
  // https://ts-morph.com/manipulation/transforms
  const results: ClassgenDeclaration[] = [];
  const typeChecker = sourceFile.getProject().getTypeChecker();
  sourceFile.getClasses().forEach((classDeclaration) => {
    results.push(fromClassDeclaration(classDeclaration));

    sourceFile.getInterfaces().forEach((interfaceDeclaration) => {
      results.push(fromInterfaceDeclaration(typeChecker, interfaceDeclaration));
    });

    sourceFile.getTypeAliases().forEach((typeAliasDeclaration) => {
      results.push(fromTypeAliasDeclaration(typeChecker, typeAliasDeclaration));
    });
  });

  return results;
}

function map<T>(value: T, fn?: (value: T) => T): T {
  return fn ? fn(value) : value;
}

export function fromClassDeclaration(
  declaration: ClassDeclaration,
): ClassgenDeclaration {
  return { structure: declaration.getStructure(), declarations: new Map([]) };
}

export function fromInterfaceDeclaration(
  typeChecker: TypeChecker,
  declaration: InterfaceDeclaration,
): ClassgenDeclaration {
  const interfaceStructure = declaration.getStructure();
  const { properties, declarations } = separateClassgenPropertyDeclaration(
    getClassgenPropertyDeclaration(typeChecker, declaration.getType()),
  );
  return {
    structure: {
      kind: StructureKind.Class,
      docs: interfaceStructure.docs,
      isExported: interfaceStructure.isExported,
      isDefaultExport: interfaceStructure.isDefaultExport,
      name: interfaceStructure.name,
      typeParameters: interfaceStructure.typeParameters,
      properties,
    },
    declarations,
  };
}

export function fromTypeAliasDeclaration(
  typeChecker: TypeChecker,
  declaration: TypeAliasDeclaration,
): ClassgenDeclaration {
  const typeAliasStructure = declaration.getStructure();
  const { properties, declarations } = separateClassgenPropertyDeclaration(
    getClassgenPropertyDeclaration(typeChecker, declaration.getType()),
  );
  return {
    structure: {
      kind: StructureKind.Class,
      docs: typeAliasStructure.docs,
      isExported: typeAliasStructure.isExported,
      isDefaultExport: typeAliasStructure.isDefaultExport,
      name: typeAliasStructure.name,
      typeParameters: typeAliasStructure.typeParameters,
      properties,
    },
    declarations,
  };
}

function separateClassgenPropertyDeclaration(
  data: ClassgenPropertyDeclaration[],
) {
  return data.reduce<{
    properties: PropertyDeclarationStructure[];
    declarations: Map<string, Node>;
  }>(
    (acc, { structure, declaration }) => {
      acc.properties.push(structure);
      acc.declarations.set(structure.name, declaration);
      return acc;
    },
    { properties: [], declarations: new Map() },
  );
}

export interface ClassgenPropertyDeclaration {
  structure: PropertyDeclarationStructure;
  declaration: Node;
}

function getClassgenPropertyDeclaration(
  typeChecker: TypeChecker,
  declaration: Type,
): ClassgenPropertyDeclaration[] {
  return typeChecker
    .getPropertiesOfType(declaration)
    .map((property): ClassgenPropertyDeclaration => {
      const propertyDeclarations = property.getDeclarations();
      if (propertyDeclarations.length !== 1) {
        throw new Error("Property must have exactly one declaration.");
      }

      const currentDeclaration = propertyDeclarations.at(0);
      if (currentDeclaration === undefined) {
        throw new Error(`Could not find declaration for ${property.getName()}`);
      }

      return {
        declaration: currentDeclaration.getFirstAncestorOrThrow(
          (node) =>
            node.getKind() === SyntaxKind.TypeAliasDeclaration ||
            node.getKind() === SyntaxKind.InterfaceDeclaration ||
            node.getKind() === SyntaxKind.ClassDeclaration,
        ),
        // TODO: Complete property structure from source declaration e.g. JSDoc comments.
        structure: {
          kind: StructureKind.Property,
          name: property.getName(),
          type: property.getTypeAtLocation(currentDeclaration).getText(),
        },
      };
    });
}
