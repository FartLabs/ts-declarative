import { StructureKind } from "ts-morph";
import type {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
  Project,
  PropertyDeclarationStructure,
  TypeAliasDeclaration,
} from "ts-morph";

/**
 * transform transforms each applicable TypeScript type into an equivalent
 * TypeScript class declaration. This replacement happens in-place.
 */
export function transform(
  project: Project,
  fn?: (structure: ClassDeclarationStructure) => ClassDeclarationStructure,
): void {
  project.getSourceFiles().forEach((sourceFile) => {
    sourceFile.getClasses().forEach((classDeclaration) => {
      const structure = fromClassDeclaration(project, classDeclaration, fn);
      classDeclaration.remove();
      sourceFile.addClass(structure);
    });

    sourceFile.getInterfaces().forEach((interfaceDeclaration) => {
      const structure = fromInterfaceDeclaration(
        project,
        interfaceDeclaration,
        fn,
      );
      interfaceDeclaration.remove();
      sourceFile.addClass(structure);
    });

    sourceFile.getTypeAliases().forEach((typeAliasDeclaration) => {
      const structure = fromTypeAliasDeclaration(
        project,
        typeAliasDeclaration,
        fn,
      );
      typeAliasDeclaration.remove();
      sourceFile.addClass(structure);
    });
  });
}

export function fromClassDeclaration(
  _project: Project,
  declaration: ClassDeclaration,
  fn?: (structure: ClassDeclarationStructure) => ClassDeclarationStructure,
): ClassDeclarationStructure {
  const structure = declaration.getStructure();
  return fn ? fn(structure) : structure;
}

export function fromInterfaceDeclaration(
  _project: Project,
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
    properties: [
      ...declaration.getHeritageClauses().flatMap((clause) => {
        return clause
          .getTypeNodes()
          .flatMap((typeNode): PropertyDeclarationStructure => {
            // TODO: Fix.
            console.log(typeNode.getText());
            return {
              kind: StructureKind.Property,
              name: "",
            };
          });
      }),
      ...(interfaceStructure.properties?.map(
        (property): PropertyDeclarationStructure => {
          return {
            ...property,
            kind: StructureKind.Property,
          };
        },
      ) ?? []),
    ],
  };

  return fn ? fn(classStructure) : classStructure;
}

export function fromTypeAliasDeclaration(
  _project: Project,
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
    properties: [],
  };

  return fn ? fn(classStructure) : classStructure;
}
