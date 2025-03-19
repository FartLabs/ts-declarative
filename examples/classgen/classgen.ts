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
 * FilterDeclaration is a function that determines if a class declaration should
 * be included in transformation process.
 */
export type FilterDeclaration = (
  sourceDeclaration: SourceDeclaration
) => boolean;

/**
 * MapDeclaration is a function that transforms a class declaration structure.
 */
export type MapDeclaration = (
  info: ClassgenDeclarationResult
) => ClassDeclarationStructure;

/**
 * MakePropertyID makes an ID string from a property name, declaration name,
 * and file path.
 */
export type MakePropertyID = (
  propertyName: string,
  declarationName: string,
  filePath?: string,
  prefix?: string
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
  filter?: FilterDeclaration
): void {
  const sourceDeclarationsSet = new Set<SourceDeclaration>();
  for (const {
    structure,
    sourceDeclaration,
    sourceDeclarations,
  } of fromProject(project, filter)) {
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
  sourceDeclarations: Map<string, Node>;
}

/**
 * fromProject generates equivalent TypeScript class declaration structures
 * from the given project.
 */
export function fromProject(
  project: Project,
  filter?: FilterDeclaration
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
  filter: FilterDeclaration = () => true
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
  classDeclaration: ClassDeclaration
): ClassgenDeclarationResult {
  return {
    sourceDeclaration: classDeclaration,
    structure: classDeclaration.getStructure(),
    sourceDeclarations: new Map([]),
  };
}

export function fromInterfaceDeclaration(
  checker: TypeChecker,
  interfaceDeclaration: InterfaceDeclaration
): ClassgenDeclarationResult {
  const interfaceStructure = interfaceDeclaration.getStructure();
  const { properties, sourceDeclarations: declarations } =
    separateClassgenPropertyDeclaration(
      getClassgenPropertyDeclaration(checker, interfaceDeclaration.getType())
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
  typeAliasDeclaration: TypeAliasDeclaration
): ClassgenDeclarationResult {
  const typeAliasStructure = typeAliasDeclaration.getStructure();
  const { properties, sourceDeclarations: declarations } =
    separateClassgenPropertyDeclaration(
      getClassgenPropertyDeclaration(checker, typeAliasDeclaration.getType())
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

/**
 * defaultMakePropertyID returns a default implementation of MakePropertyID.
 */
export const defaultMakePropertyID: MakePropertyID = (
  propertyName,
  declarationName,
  filePath,
  prefix
) => {
  return (
    (prefix ?? "") +
    (filePath !== undefined ? `${filePath}#` : "") +
    `${declarationName}.${propertyName}`
  );
};

function separateClassgenPropertyDeclaration(
  data: ClassgenPropertyDeclaration[]
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
    { properties: [], sourceDeclarations: new Map() }
  );
}

/**
 * ClassgenPropertyDeclaration is a class that represents a property
 * declaration and its source declaration.
 */
export interface ClassgenPropertyDeclaration {
  propertyStructure: PropertyDeclarationStructure;
  sourceDeclaration: Node;
}

function getClassgenPropertyDeclaration(
  checker: TypeChecker,
  declaration: Type
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

      const sourceDeclaration = currentDeclaration.getFirstAncestorOrThrow(
        (node) => {
          return isSourceDeclaration(node);
        }
      );
      return {
        sourceDeclaration,
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
 * withAddContextDecorator adds a context decorator to the class
 * declaration structure based on the source declarations.
 */
export function withAddContextDecorator(
  { structure, sourceDeclarations }: ClassgenDeclarationResult,
  prefix?: string,
  id: MakePropertyID = defaultMakePropertyID
) {
  return Object.assign({}, structure, {
    decorators: [
      ...(structure?.decorators ?? []),
      {
        name: "context",
        arguments: [renderContext(contextFrom(sourceDeclarations, prefix, id))],
      },
    ],
  });
}

export function isSourceDeclaration(node: Node): node is SourceDeclaration {
  return (
    node.isKind(SyntaxKind.ClassDeclaration) ||
    node.isKind(SyntaxKind.InterfaceDeclaration) ||
    node.isKind(SyntaxKind.TypeAliasDeclaration)
  );
}

/**
 * renderContext returns a string representation of the context object.
 */
export function renderContext(entries: Array<[string, string]>): string {
  if (entries.length === 0) {
    return "";
  }

  return `{ ${entries
    .map(([key, value]) => `"${key}": "${value}"`)
    .join(",\n")} }`;
}

/**
 * contextFrom generates the context from the source declarations.
 */
export function contextFrom(
  sourceDeclarations: Map<string, Node>,
  prefix?: string,
  id: MakePropertyID = defaultMakePropertyID
): Array<[string, string]> {
  return (
    Array.from(sourceDeclarations)
      // TODO: Skip if the keys is defined locally in the declaration.
      .map(([key, value]): [string, string] => {
        if (!isSourceDeclaration(value)) {
          throw new Error(
            `Could not find interface, type alias, or class declaration for ${key}`
          );
        }

        const declarationName = value.compilerNode.name?.getText();
        if (declarationName === undefined) {
          throw new Error(`Could not find name for ${key}`);
        }

        const filePath = value.getSourceFile().getFilePath();
        return [key, id(key, declarationName, filePath, prefix)];
      })
  );
}
