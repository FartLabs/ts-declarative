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
  fn?: (
    structure: ClassDeclarationStructure,
    sourceDeclarations: Map<string, Node>,
  ) => ClassDeclarationStructure,
): void {
  for (
    const {
      originalDeclaration,
      structure,
      sourceDeclarations,
    } of fromProject(project)
  ) {
    const sourceFile = originalDeclaration.getSourceFile();
    originalDeclaration.remove();
    sourceFile.addClass(fn ? fn(structure, sourceDeclarations) : structure);
  }
}

export interface ClassgenDeclarationResult {
  /**
   * originalDeclaration is the source declaration for the given structure.
   */
  originalDeclaration:
    | ClassDeclaration
    | InterfaceDeclaration
    | TypeAliasDeclaration;

  /**
   * structure is the equivalent TypeScript class declaration structure
   * generated from the given source declaration.
   */
  structure: ClassDeclarationStructure;

  /**
   * sourceDeclarations are the source declarations for the given structure's
   * properties.
   */
  sourceDeclarations: Map<string, Node>;
}

/**
 * fromProject generates equivalent TypeScript class declaration structures
 * from the given project.
 */
export function fromProject(project: Project): ClassgenDeclarationResult[] {
  return project.getSourceFiles().flatMap((sourceFile) => {
    return fromSourceFile(sourceFile);
  });
}

/**
 * fromSourceFile generates equivalent TypeScript class declaration structures
 * from the given source file.
 */
export function fromSourceFile(
  sourceFile: SourceFile,
): ClassgenDeclarationResult[] {
  // TODO: Consider migrating to transform API.
  // https://ts-morph.com/manipulation/transforms
  const results: ClassgenDeclarationResult[] = [];
  const checker = sourceFile.getProject().getTypeChecker();
  sourceFile.getClasses().forEach((classDeclaration) => {
    results.push(fromClassDeclaration(classDeclaration));
  });

  sourceFile.getInterfaces().forEach((interfaceDeclaration) => {
    results.push(fromInterfaceDeclaration(checker, interfaceDeclaration));
  });

  sourceFile.getTypeAliases().forEach((typeAliasDeclaration) => {
    results.push(fromTypeAliasDeclaration(checker, typeAliasDeclaration));
  });

  return results;
}

export function fromClassDeclaration(
  classDeclaration: ClassDeclaration,
): ClassgenDeclarationResult {
  return {
    originalDeclaration: classDeclaration,
    structure: classDeclaration.getStructure(),
    sourceDeclarations: new Map([]),
  };
}

export function fromInterfaceDeclaration(
  checker: TypeChecker,
  interfaceDeclaration: InterfaceDeclaration,
): ClassgenDeclarationResult {
  const interfaceStructure = interfaceDeclaration.getStructure();
  const { properties, sourceDeclarations: declarations } =
    separateClassgenPropertyDeclaration(
      getClassgenPropertyDeclaration(checker, interfaceDeclaration.getType()),
    );
  return {
    originalDeclaration: interfaceDeclaration,
    structure: {
      kind: StructureKind.Class,
      docs: interfaceStructure.docs,
      isExported: interfaceStructure.isExported,
      isDefaultExport: interfaceStructure.isDefaultExport,
      name: interfaceStructure.name,
      typeParameters: interfaceStructure.typeParameters,
      properties,
    },
    sourceDeclarations: declarations,
  };
}

export function fromTypeAliasDeclaration(
  checker: TypeChecker,
  typeAliasDeclaration: TypeAliasDeclaration,
): ClassgenDeclarationResult {
  const typeAliasStructure = typeAliasDeclaration.getStructure();
  const { properties, sourceDeclarations: declarations } =
    separateClassgenPropertyDeclaration(
      getClassgenPropertyDeclaration(checker, typeAliasDeclaration.getType()),
    );
  return {
    originalDeclaration: typeAliasDeclaration,
    structure: {
      kind: StructureKind.Class,
      docs: typeAliasStructure.docs,
      isExported: typeAliasStructure.isExported,
      isDefaultExport: typeAliasStructure.isDefaultExport,
      name: typeAliasStructure.name,
      typeParameters: typeAliasStructure.typeParameters,
      properties,
    },
    sourceDeclarations: declarations,
  };
}

function separateClassgenPropertyDeclaration(
  data: ClassgenPropertyDeclaration[],
) {
  return data.reduce<{
    properties: PropertyDeclarationStructure[];
    sourceDeclarations: Map<string, Node>;
  }>(
    (acc, { propertyStructure, sourceDeclaration }) => {
      acc.properties.push(propertyStructure);
      acc.sourceDeclarations.set(propertyStructure.name, sourceDeclaration);
      return acc;
    },
    { properties: [], sourceDeclarations: new Map() },
  );
}

export interface ClassgenPropertyDeclaration {
  propertyStructure: PropertyDeclarationStructure;
  sourceDeclaration: Node;
}

function getClassgenPropertyDeclaration(
  checker: TypeChecker,
  declaration: Type,
): ClassgenPropertyDeclaration[] {
  return checker
    .getPropertiesOfType(declaration)
    .map((property): ClassgenPropertyDeclaration => {
      const propertyDeclarations = property.getDeclarations();
      if (propertyDeclarations.length !== 1) {
        throw new Error("Property expected to have 1 declaration");
      }

      const currentDeclaration = propertyDeclarations.at(0);
      if (currentDeclaration === undefined) {
        throw new Error(`Could not find declaration for ${property.getName()}`);
      }

      return {
        sourceDeclaration: currentDeclaration.getFirstAncestorOrThrow(
          (node) =>
            node.getKind() === SyntaxKind.TypeAliasDeclaration ||
            node.getKind() === SyntaxKind.InterfaceDeclaration ||
            node.getKind() === SyntaxKind.ClassDeclaration,
        ),
        // TODO: Complete property structure from source declaration e.g. JSDoc comments.
        propertyStructure: {
          kind: StructureKind.Property,
          name: property.getName(),
          type: property.getTypeAtLocation(currentDeclaration).getText(),
        },
      };
    });
}
