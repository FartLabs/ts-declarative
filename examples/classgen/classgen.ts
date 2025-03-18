import { StructureKind } from "ts-morph";
import type {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
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
  sourceFile: SourceFile,
  fn?: (
    structure: ClassDeclarationStructure,
    // TODO: Map property name to the names of the class that owns its source declaration.
  ) => ClassDeclarationStructure,
): void {
  // TODO: Consider migrating to transform API.
  // https://ts-morph.com/manipulation/transforms
  const typeChecker = sourceFile.getProject().getTypeChecker();
  const classStructures: Array<ClassDeclarationStructure> = [];
  const sourceDeclarations: Array<
    ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration
  > = [];
  sourceFile.getClasses().forEach((classDeclaration) => {
    sourceDeclarations.push(classDeclaration);
    classStructures.push(map(fromClassDeclaration(classDeclaration), fn));
  });

  sourceFile.getInterfaces().forEach((interfaceDeclaration) => {
    sourceDeclarations.push(interfaceDeclaration);
    classStructures.push(
      map(fromInterfaceDeclaration(typeChecker, interfaceDeclaration), fn),
    );
  });

  sourceFile.getTypeAliases().forEach((typeAliasDeclaration) => {
    sourceDeclarations.push(typeAliasDeclaration);
    classStructures.push(
      map(fromTypeAliasDeclaration(typeChecker, typeAliasDeclaration), fn),
    );
  });

  // Replace the source declarations with the new ones.
  sourceDeclarations.forEach((sourceDeclaration) => {
    sourceDeclaration.remove();
  });

  classStructures.forEach((classStructure) => {
    sourceFile.addClass(classStructure);
  });
}

function map<T>(value: T, fn?: (value: T) => T): T {
  return fn ? fn(value) : value;
}

export function fromClassDeclaration(
  declaration: ClassDeclaration,
): ClassDeclarationStructure {
  return declaration.getStructure();
}

export function fromInterfaceDeclaration(
  typeChecker: TypeChecker,
  declaration: InterfaceDeclaration,
): ClassDeclarationStructure {
  const interfaceStructure = declaration.getStructure();
  return {
    kind: StructureKind.Class,
    docs: interfaceStructure.docs,
    isExported: interfaceStructure.isExported,
    isDefaultExport: interfaceStructure.isDefaultExport,
    name: interfaceStructure.name,
    typeParameters: interfaceStructure.typeParameters,
    properties: propertyDeclarationsFrom(typeChecker, declaration.getType()),
  };
}

export function fromTypeAliasDeclaration(
  typeChecker: TypeChecker,
  declaration: TypeAliasDeclaration,
): ClassDeclarationStructure {
  const typeAliasStructure = declaration.getStructure();
  return {
    kind: StructureKind.Class,
    docs: typeAliasStructure.docs,
    isExported: typeAliasStructure.isExported,
    isDefaultExport: typeAliasStructure.isDefaultExport,
    name: typeAliasStructure.name,
    typeParameters: typeAliasStructure.typeParameters,
    properties: propertyDeclarationsFrom(typeChecker, declaration.getType()),
  };
}

function propertyDeclarationsFrom(
  typeChecker: TypeChecker,
  declaration: Type,
): PropertyDeclarationStructure[] {
  return typeChecker
    .getPropertiesOfType(declaration)
    .map((property): PropertyDeclarationStructure => {
      const currentDeclaration = property.getDeclarations().at(-1);
      if (currentDeclaration === undefined) {
        throw new Error(`Could not find declaration for ${property.getName()}`);
      }

      // TODO: Pass source declaration.
      // const parentDeclaration = currentDeclaration
      //   .getFirstAncestorOrThrow(
      //     (node) =>
      //       node.getKind() === SyntaxKind.TypeAliasDeclaration ||
      //       node.getKind() === SyntaxKind.InterfaceDeclaration ||
      //       node.getKind() === SyntaxKind.ClassDeclaration
      //   )
      //   .getText();
      // console.log({
      //   name: property.getName(),
      //   type: property.getTypeAtLocation(currentDeclaration).getText(),
      //   parentDeclaration,
      // });

      // TODO: Complete property structure from source declaration e.g. JSDoc comments.
      return {
        kind: StructureKind.Property,
        name: property.getName(),
        type: property.getTypeAtLocation(currentDeclaration).getText(),
      };
    });
}
