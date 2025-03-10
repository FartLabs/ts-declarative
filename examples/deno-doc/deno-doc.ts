import type { DocNode, DocOptions, TsTypeDef } from "@deno/doc";
import { doc } from "@deno/doc";
import type { Declarative } from "#/lib/declarative/declarative.ts";

/**
 * DenoDoc is a declarative class type from @deno/doc.
 */
export interface DenoDoc {
  properties: Array<[string, TsTypeDef]>;
}

export interface StateDenoDoc {
  denoDoc?: DenoDoc;
}

export async function declarativeDenoDoc<TState extends StateDenoDoc>(
  entrypoint: string,
  options?: DocOptions,
): Promise<Declarative<TState>> {
  const docResult = await doc([entrypoint], options);
  const docNodes = docResult[entrypoint].filter(
    (node) => node.location.filename === entrypoint && node.kind === "class",
  );

  return (state, _id, name) => {
    return { ...state, denoDoc: getDenoDoc(docNodes, name) };
  };
}

function getDenoDoc(docNodes: DocNode[], name: string): DenoDoc {
  const docNode = docNodes.find((node) => node.name === name);
  if (docNode?.kind !== "class") {
    throw new Error(`Could not find DocNode for ${name}`);
  }

  const properties: Array<[string, TsTypeDef]> = [];
  for (const property of docNode.classDef.properties) {
    if (property.tsType === undefined) {
      throw new Error(`Could not find tsType for ${property.name}`);
    }

    properties.push([property.name, property.tsType]);
  }

  return { properties };
}
