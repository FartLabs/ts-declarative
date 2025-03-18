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

export interface TransformOptions {
  project: Project;
  filter?: FilterDeclaration;
  map?: MapDeclaration;
}

export type FilterDeclaration = (
  sourceDeclaration: SourceDeclaration,
) => boolean;

export type MapDeclaration = (
  structure: ClassDeclarationStructure,
  sourceDeclarations: Map<string, Node>,
) => ClassDeclarationStructure;

export type SourceDeclaration =
  | ClassDeclaration
  | InterfaceDeclaration
  | TypeAliasDeclaration;

/**
 * transform transforms each applicable TypeScript type into an equivalent
 * TypeScript class declaration. This replacement happens in-place.
 */
export function transform({
  project,
  filter,
  map = (structure) => structure,
}: TransformOptions): void {
  const originalDeclarations = new Set<SourceDeclaration>();
  for (
    const {
      sourceDeclaration: originalDeclaration,
      structure,
      sourceDeclarations,
    } of fromProject(project, filter)
  ) {
    originalDeclarations.add(originalDeclaration);
    const sourceFile = originalDeclaration.getSourceFile();
    const mappedStructure = map(structure, sourceDeclarations);
    sourceFile.addClass(mappedStructure);
  }

  originalDeclarations.forEach((declaration) => declaration.remove());
}

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
  sourceDeclarations: Map<string, Node>;
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
  return {
    sourceDeclaration: classDeclaration,
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
    sourceDeclaration: interfaceDeclaration,
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
    sourceDeclaration: typeAliasDeclaration,
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

/**
 * withContextDecorator adds a context decorator to the class declaration
 * structure based on the source declarations.
 */
export function withContextDecorator(
  structure: ClassDeclarationStructure,
  sourceDeclarations: Map<string, Node>,
) {
  return Object.assign({}, structure, {
    decorators: [
      ...(structure?.decorators ?? []),
      {
        name: "context",
        arguments: [renderContext(contextFrom(sourceDeclarations))],
      },
    ],
  });
}

export function renderContext(entries: Array<[string, string]>): string {
  if (entries.length === 0) {
    return "";
  }

  return `{ ${
    entries
      .map(([key, value]) => `"${key}": "${value}"`)
      .join(", ")
  } }`;
}

export function contextFrom(
  sourceDeclarations: Map<string, Node>,
): Array<[string, string]> {
  return (
    Array.from(sourceDeclarations)
      // TODO: Skip if the keys is defined locally in the declaration. WIP:
      // .filter(([key, sourceDeclaration]) => {
      //   if (sourceDeclaration.isKind(SyntaxKind.ClassDeclaration)) {
      //     return sourceDeclaration.getProperty(key) !== undefined;
      //   }
      //   if (sourceDeclaration.isKind(SyntaxKind.TypeAliasDeclaration)) {
      //     return sourceDeclaration.getType().getProperty(key) !== undefined;
      //   }
      //   if (sourceDeclaration.isKind(SyntaxKind.InterfaceDeclaration)) {
      //     return sourceDeclaration.getProperty(key) !== undefined;
      //   }
      //
      //   throw new Error(`Could not determine type for ${key}`);
      // })
      .map(([key, value]): [string, string] => {
        if (
          !value.isKind(SyntaxKind.InterfaceDeclaration) &&
          !value.isKind(SyntaxKind.TypeAliasDeclaration) &&
          !value.isKind(SyntaxKind.ClassDeclaration)
        ) {
          throw new Error(
            `Could not find interface, type alias, or class declaration for ${key}`,
          );
        }

        const declarationName = value.compilerNode.name?.getText();
        if (declarationName === undefined) {
          throw new Error(`Could not find name for ${key}`);
        }

        return [key, `${declarationName}/${key}`];
      })
  );
}
