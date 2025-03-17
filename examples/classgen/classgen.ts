import { StructureKind, ts } from "ts-morph";
import type {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
  Node,
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
  const properties = analyzeProperties(typeChecker, declaration);
  const classStructure: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    docs: interfaceStructure.docs,
    isExported: interfaceStructure.isExported,
    isDefaultExport: interfaceStructure.isDefaultExport,
    name: interfaceStructure.name,
    typeParameters: interfaceStructure.typeParameters,
    properties: properties.map((p) => p.structure),
  };

  return fn ? fn(classStructure) : classStructure;
}

export function fromTypeAliasDeclaration(
  typeChecker: TypeChecker,
  declaration: TypeAliasDeclaration,
  fn?: (structure: ClassDeclarationStructure) => ClassDeclarationStructure,
): ClassDeclarationStructure {
  const typeAliasStructure = declaration.getStructure();
  const properties = analyzeProperties(typeChecker, declaration);
  const classStructure: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    docs: typeAliasStructure.docs,
    isExported: typeAliasStructure.isExported,
    isDefaultExport: typeAliasStructure.isDefaultExport,
    name: typeAliasStructure.name,
    typeParameters: typeAliasStructure.typeParameters,
    properties: properties.map((p) => p.structure),
  };

  return fn ? fn(classStructure) : classStructure;
}

/**
 * analyzeProperties generates a list of property declarations from a
 * type alias or interface.
 */
export function analyzeProperties(
  typeChecker: TypeChecker,
  declaration: InterfaceDeclaration | TypeAliasDeclaration,
) {
  const checkResult = typeChecker.getPropertiesOfType(
    typeChecker.getTypeAtLocation(declaration),
  );

  return checkResult.map((propertySymbol) => {
    return analyzeProperty(typeChecker, declaration, propertySymbol);
  });
}

export function analyzeProperty(
  _typeChecker: TypeChecker,
  declaration: TypeAliasDeclaration | InterfaceDeclaration,
  propertySymbol: Symbol,
): PropertyAnalysis {
  const propertyTypeSymbol = propertySymbol.getTypeAtLocation(declaration);
  const immediateDeclaration = propertySymbol
    .getDeclarations()
    .find((d) => ts.isPropertyDeclaration(d.compilerNode));
  if (immediateDeclaration === undefined) {
    // TODO: Find the referenced declaration, the original interface that declares this property.
    console.log({ referencedDeclaration: "?" });
  }

  console.log({
    property: propertySymbol.getName(),
    // Parent type only exists on original interface :/
    parentType: immediateDeclaration?.getText(),
    type: propertyTypeSymbol.getText(),
  });

  return {
    structure: {
      // TODO: Return all declaration info, e.g. JSDoc comments.
      kind: StructureKind.Property,
      name: propertySymbol.getName(),
      type: propertyTypeSymbol.getText(),
    },
    source: immediateDeclaration!,
  };
}

export interface PropertyAnalysis {
  structure: PropertyDeclarationStructure;
  source: Node<ts.Node>;
}
