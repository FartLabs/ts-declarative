import { StructureKind, SyntaxKind } from "ts-morph";
import type {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
  Node,
  Project,
  PropertyDeclarationStructure,
  SourceFile,
  TypeAliasDeclaration,
  TypeChecker,
} from "ts-morph";

/**
 * FilterDeclaration is a function that determines if a class declaration should
 * be included in transformation process.
 */
export type FilterDeclaration = (
  sourceDeclaration: SourceDeclaration,
) => boolean;

/**
 * MapDeclaration is a function that transforms a class declaration structure.
 */
export type MapDeclaration = (
  info: ClassgenDeclarationResult,
) => ClassDeclarationStructure;

/**
 * MakePropertyID makes an ID string from a property name, declaration name,
 * and file path.
 */
export type MakePropertyID = (
  propertyName: string,
  declarationName: string,
  filePath?: string,
  prefix?: string,
) => string;

export type SourceDeclaration =
  | ClassDeclaration
  | InterfaceDeclaration
  | TypeAliasDeclaration;

/**
 * transform transforms each applicable TypeScript type into an equivalent
 * TypeScript class declaration. This replacement happens in-place.
 */
export function transform(
  project: Project,
  map: MapDeclaration = ({ structure }) => structure,
  filter?: FilterDeclaration,
): void {
  const sourceDeclarationsSet = new Set<SourceDeclaration>();
  for (
    const {
      structure,
      sourceDeclaration,
      sourceDeclarations,
    } of fromProject(project, filter)
  ) {
    sourceDeclarationsSet.add(sourceDeclaration);
    const sourceFile = sourceDeclaration.getSourceFile();
    const mappedStructure = map({
      structure,
      sourceDeclaration,
      sourceDeclarations,
    });
    sourceFile.addClass(mappedStructure);
    sourceFile.formatText();
  }

  sourceDeclarationsSet.forEach((declaration) => {
    declaration.remove();
  });
}

/**
 * ClassgenDeclarationResult is a result of a classgen transformation.
 */
export interface ClassgenDeclarationResult {
  /**
   * sourceDeclaration is the source declaration for the given structure.
   */
  sourceDeclaration: SourceDeclaration;

  /**
   * structure is the equivalent TypeScript class declaration structure
   * generated from the given source declaration.
   */
  structure: ClassDeclarationStructure;

  /**
   * sourceDeclarations are the source declarations for the given structure's
   * properties.
   */
  sourceDeclarations: Map<string, Node[]>;
}

/**
 * fromProject generates equivalent TypeScript class declaration structures
 * from the given project.
 */
export function fromProject(
  project: Project,
  filter?: FilterDeclaration,
): ClassgenDeclarationResult[] {
  return project.getSourceFiles().flatMap((sourceFile) => {
    return fromSourceFile(sourceFile, filter);
  });
}

/**
 * fromSourceFile generates equivalent TypeScript class declaration structures
 * from the given source file.
 */
export function fromSourceFile(
  sourceFile: SourceFile,
  filter: FilterDeclaration = () => true,
): ClassgenDeclarationResult[] {
  // TODO: Consider migrating to transform API.
  // https://ts-morph.com/manipulation/transforms
  const results: ClassgenDeclarationResult[] = [];
  const checker = sourceFile.getProject().getTypeChecker();
  sourceFile.getClasses().forEach((classDeclaration) => {
    if (!filter(classDeclaration)) {
      return;
    }

    results.push(fromClassDeclaration(classDeclaration));
  });

  sourceFile.getInterfaces().forEach((interfaceDeclaration) => {
    if (!filter(interfaceDeclaration)) {
      return;
    }

    results.push(fromInterfaceDeclaration(checker, interfaceDeclaration));
  });

  sourceFile.getTypeAliases().forEach((typeAliasDeclaration) => {
    if (!filter(typeAliasDeclaration)) {
      return;
    }

    results.push(fromTypeAliasDeclaration(checker, typeAliasDeclaration));
  });

  return results;
}

export function fromClassDeclaration(
  classDeclaration: ClassDeclaration,
): ClassgenDeclarationResult {
  const { sourceDeclarations } = separateClassgenPropertyDeclaration(
    getClassgenPropertyDeclaration(
      classDeclaration.getProject().getTypeChecker(),
      classDeclaration,
    ),
  );
  return {
    sourceDeclaration: classDeclaration,
    sourceDeclarations,
    structure: classDeclaration.getStructure(),
  };
}

export function fromInterfaceDeclaration(
  checker: TypeChecker,
  interfaceDeclaration: InterfaceDeclaration,
): ClassgenDeclarationResult {
  const interfaceStructure = interfaceDeclaration.getStructure();
  const { properties, sourceDeclarations } =
    separateClassgenPropertyDeclaration(
      getClassgenPropertyDeclaration(checker, interfaceDeclaration),
    );
  return {
    sourceDeclaration: interfaceDeclaration,
    sourceDeclarations,
    structure: {
      kind: StructureKind.Class,
      docs: interfaceStructure.docs,
      isExported: interfaceStructure.isExported,
      isDefaultExport: interfaceStructure.isDefaultExport,
      name: interfaceStructure.name,
      typeParameters: interfaceStructure.typeParameters,
      properties,
    },
  };
}

export function fromTypeAliasDeclaration(
  checker: TypeChecker,
  typeAliasDeclaration: TypeAliasDeclaration,
): ClassgenDeclarationResult {
  const typeAliasStructure = typeAliasDeclaration.getStructure();
  const { properties, sourceDeclarations } =
    separateClassgenPropertyDeclaration(
      getClassgenPropertyDeclaration(checker, typeAliasDeclaration),
    );
  return {
    sourceDeclaration: typeAliasDeclaration,
    sourceDeclarations,
    structure: {
      kind: StructureKind.Class,
      docs: typeAliasStructure.docs,
      isExported: typeAliasStructure.isExported,
      isDefaultExport: typeAliasStructure.isDefaultExport,
      name: typeAliasStructure.name,
      typeParameters: typeAliasStructure.typeParameters,
      properties,
    },
  };
}

function separateClassgenPropertyDeclaration(
  data: ClassgenPropertyDeclaration[],
) {
  return data.reduce<{
    properties: PropertyDeclarationStructure[];
    sourceDeclarations: Map<string, Node[]>;
  }>(
    (acc, { propertyStructure, sourceDeclarations }) => {
      acc.properties.push(propertyStructure);
      acc.sourceDeclarations.set(propertyStructure.name, sourceDeclarations);
      return acc;
    },
    { properties: [], sourceDeclarations: new Map() },
  );
}

/**
 * ClassgenPropertyDeclaration is a class that represents a property
 * declaration and its source declaration.
 */
export interface ClassgenPropertyDeclaration {
  propertyStructure: PropertyDeclarationStructure;
  sourceDeclarations: Node[];
}

function getClassgenPropertyDeclaration(
  checker: TypeChecker,
  declaration: Node,
): ClassgenPropertyDeclaration[] {
  return checker
    .getPropertiesOfType(declaration.getType())
    .map((property): ClassgenPropertyDeclaration => {
      const sourceDeclarations = property.getDeclarations().map((node) => {
        return node.getFirstAncestorOrThrow(
          (node) => {
            return isSourceDeclaration(node);
          },
        );
      });
      return {
        sourceDeclarations,
        // TODO: Complete property structure from source declaration e.g. JSDoc comments.
        propertyStructure: {
          kind: StructureKind.Property,
          name: property.getName(),
          type: property.getTypeAtLocation(declaration).getText(),
        },
      };
    });
}

export function isSourceDeclaration(node: Node): node is SourceDeclaration {
  return (
    node.isKind(SyntaxKind.ClassDeclaration) ||
    node.isKind(SyntaxKind.InterfaceDeclaration) ||
    node.isKind(SyntaxKind.TypeAliasDeclaration)
  );
}
