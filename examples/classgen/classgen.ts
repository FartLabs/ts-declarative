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
  fn?: (
    structure: ClassDeclarationStructure,
    // TODO: Map property name to the names of the class that owns its original declaration.
  ) => ClassDeclarationStructure,
): void {
  sourceFile.getClasses().forEach((classDeclaration) => {
    const structure = fromClassDeclaration(classDeclaration);
    classDeclaration.remove();
    sourceFile.addClass(fn ? fn(structure) : structure);
  });

  sourceFile.getInterfaces().forEach((interfaceDeclaration) => {
    const structure = fromInterfaceDeclaration(
      typeChecker,
      interfaceDeclaration,
    );
    interfaceDeclaration.remove();
    sourceFile.addClass(fn ? fn(structure) : structure);
  });

  sourceFile.getTypeAliases().forEach((typeAliasDeclaration) => {
    const structure = fromTypeAliasDeclaration(
      typeChecker,
      typeAliasDeclaration,
    );
    typeAliasDeclaration.remove();
    sourceFile.addClass(fn ? fn(structure) : structure);
  });
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
  const properties = analyzeProperties(typeChecker, declaration);
  return {
    kind: StructureKind.Class,
    docs: interfaceStructure.docs,
    isExported: interfaceStructure.isExported,
    isDefaultExport: interfaceStructure.isDefaultExport,
    name: interfaceStructure.name,
    typeParameters: interfaceStructure.typeParameters,
    properties: properties.map((p) => p.structure),
  };
}

export function fromTypeAliasDeclaration(
  typeChecker: TypeChecker,
  declaration: TypeAliasDeclaration,
): ClassDeclarationStructure {
  const typeAliasStructure = declaration.getStructure();
  const properties = analyzeProperties(typeChecker, declaration);
  return {
    kind: StructureKind.Class,
    docs: typeAliasStructure.docs,
    isExported: typeAliasStructure.isExported,
    isDefaultExport: typeAliasStructure.isDefaultExport,
    name: typeAliasStructure.name,
    typeParameters: typeAliasStructure.typeParameters,
    properties: properties.map((p) => p.structure),
  };
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
  typeChecker: TypeChecker,
  declaration: TypeAliasDeclaration | InterfaceDeclaration,
  propertySymbol: Symbol,
): PropertyAnalysis {
  const propertyTypeSymbol = propertySymbol.getTypeAtLocation(declaration);
  const source = findSymbolSource(typeChecker, declaration, propertySymbol);
  console.log({
    propertySymbol: propertySymbol.getName(),
    propertyTypeSymbol: propertyTypeSymbol.getText(),
    source,
  });
  return {
    structure: {
      // TODO: Return all declaration info, e.g. JSDoc comments.
      kind: StructureKind.Property,
      name: propertySymbol.getName(),
      type: propertyTypeSymbol.getText(),
    },
    source,
  };
}

// The more abstract/general the name of the functions,
// the more unhappy I am.

export function findSymbolSource(
  typeChecker: TypeChecker,
  declaration: TypeAliasDeclaration | InterfaceDeclaration,
  symbol: Symbol,
): Node<ts.Node> | undefined {
  // Get parent of symbol recursively.
  for (const parent of symbol.getDeclarations()) {
    if (
      ts.isTypeAliasDeclaration(parent.compilerNode) ||
      ts.isInterfaceDeclaration(parent.compilerNode) ||
      ts.isClassDeclaration(parent.compilerNode)
    ) {
      return parent;
    }
  }

  // if (ts.isInterfaceDeclaration(declaration)) {
  //   return declaration;
  // }
}

export interface PropertyAnalysis {
  structure: PropertyDeclarationStructure;
  source?: Node<ts.Node>;
}
