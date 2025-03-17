import { StructureKind } from "ts-morph";
import type {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
  PropertyDeclarationStructure,
  SourceFile,
  Symbol,
  TypeAliasDeclaration,
  TypeChecker,
} from "ts-morph";

/**
 * transform transforms each applicable TypeScript type into an equivalent
 * TypeScript class declaration. This replacement happens in-place.
 */
export function transform(
  typeChecker: TypeChecker,
  sourceFile: SourceFile,
  fn?: (structure: ClassDeclarationStructure) => ClassDeclarationStructure,
): void {
  sourceFile.getClasses().forEach((classDeclaration) => {
    const structure = fromClassDeclaration(classDeclaration, fn);
    classDeclaration.remove();
    sourceFile.addClass(structure);
  });

  sourceFile.getInterfaces().forEach((interfaceDeclaration) => {
    const structure = fromInterfaceDeclaration(
      typeChecker,
      interfaceDeclaration,
      fn,
    );
    interfaceDeclaration.remove();
    sourceFile.addClass(structure);
  });

  sourceFile.getTypeAliases().forEach((typeAliasDeclaration) => {
    const structure = fromTypeAliasDeclaration(
      typeChecker,
      typeAliasDeclaration,
      fn,
    );
    typeAliasDeclaration.remove();
    sourceFile.addClass(structure);
  });
}

export function fromClassDeclaration(
  declaration: ClassDeclaration,
  fn?: (
    structure: ClassDeclarationStructure,
    // TODO: Map property name to the names of the class that owns its original declaration.
  ) => ClassDeclarationStructure,
): ClassDeclarationStructure {
  const structure = declaration.getStructure();
  return fn ? fn(structure) : structure;
}

export function fromInterfaceDeclaration(
  typeChecker: TypeChecker,
  declaration: InterfaceDeclaration,
  fn?: (structure: ClassDeclarationStructure) => ClassDeclarationStructure,
): ClassDeclarationStructure {
  const interfaceStructure = declaration.getStructure();
  const classStructure: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    docs: interfaceStructure.docs,
    isExported: interfaceStructure.isExported,
    isDefaultExport: interfaceStructure.isDefaultExport,
    name: interfaceStructure.name,
    typeParameters: interfaceStructure.typeParameters,
    properties: propertyDeclarationsFrom(typeChecker, declaration),
  };

  return fn ? fn(classStructure) : classStructure;
}

export function fromTypeAliasDeclaration(
  typeChecker: TypeChecker,
  declaration: TypeAliasDeclaration,
  fn?: (structure: ClassDeclarationStructure) => ClassDeclarationStructure,
): ClassDeclarationStructure {
  const typeAliasStructure = declaration.getStructure();
  const classStructure: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    docs: typeAliasStructure.docs,
    isExported: typeAliasStructure.isExported,
    isDefaultExport: typeAliasStructure.isDefaultExport,
    name: typeAliasStructure.name,
    typeParameters: typeAliasStructure.typeParameters,
    properties: propertyDeclarationsFrom(typeChecker, declaration),
  };

  return fn ? fn(classStructure) : classStructure;
}

/**
 * propertyDeclarationsFrom generates a list of property declarations from a
 * type alias or interface.
 */
export function propertyDeclarationsFrom(
  typeChecker: TypeChecker,
  declaration: InterfaceDeclaration | TypeAliasDeclaration,
): PropertyDeclarationStructure[] {
  const checkResult = typeChecker.getPropertiesOfType(
    typeChecker.getTypeAtLocation(declaration),
  );

  return checkResult.map((symbol) => {
    return propertyDeclarationStructureFromSymbol(declaration, symbol);
  });
}

export function propertyDeclarationStructureFromSymbol(
  declaration: TypeAliasDeclaration | InterfaceDeclaration,
  symbol: Symbol,
): PropertyDeclarationStructure {
  return {
    // TODO: Return all declaration info, e.g. JSDoc comments.
    kind: StructureKind.Property,
    name: symbol.getName(),
    type: symbol.getTypeAtLocation(declaration).getText(),
  };
}
