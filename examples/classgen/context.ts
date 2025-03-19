import type { Node } from "ts-morph";
import type { ClassgenDeclarationResult, MakePropertyID } from "./classgen.ts";
import { isSourceDeclaration } from "./classgen.ts";

/**
 * withAddContextDecorator adds a context decorator to the class
 * declaration structure based on the source declarations.
 */
export function withAddContextDecorator(
  { structure, sourceDeclarations }: ClassgenDeclarationResult,
  prefix?: string,
  id: MakePropertyID = defaultMakePropertyID,
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

/**
 * renderContext returns a string representation of the context object.
 */
export function renderContext(entries: Array<[string, string]>): string {
  if (entries.length === 0) {
    return "";
  }

  return `{ ${
    entries
      .map(([key, value]) => `"${key}": "${value}"`)
      .join(",\n")
  } }`;
}

/**
 * contextFrom generates the context from the source declarations.
 */
export function contextFrom(
  sourceDeclarations: Map<string, Node[]>,
  prefix?: string,
  id: MakePropertyID = defaultMakePropertyID,
): Array<[string, string]> {
  return (
    Array.from(sourceDeclarations)
      // TODO: Skip if the keys is defined locally in the declaration.
      .map(([key, nodes]): [string, string] => {
        if (nodes.length !== 1) {
          const allNodes = new Set(nodes);
          if (allNodes.size !== 1) {
            throw new Error(`Could not find unique declaration for ${key}`);
          }
        }

        const node = nodes.at(0)!;
        if (!isSourceDeclaration(node)) {
          throw new Error(
            `Could not find interface, type alias, or class declaration for ${key}`,
          );
        }

        const declarationName = node.compilerNode.name?.getText();
        if (declarationName === undefined) {
          throw new Error(`Could not find name for ${key}`);
        }

        const filePath = node.getSourceFile().getFilePath();
        return [key, id(key, declarationName, filePath, prefix)];
      })
  );
}

/**
 * defaultMakePropertyID returns a default implementation of MakePropertyID.
 */
export const defaultMakePropertyID: MakePropertyID = (
  propertyName,
  declarationName,
  filePath,
  prefix,
) => {
  return (
    (prefix ?? "") +
    (filePath !== undefined ? `${filePath}#` : "") +
    `${declarationName}.${propertyName}`
  );
};
