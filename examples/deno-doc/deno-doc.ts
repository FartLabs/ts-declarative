import type { DocNode, DocOptions, TsTypeDef } from "@deno/doc";
import { doc } from "@deno/doc";
import type { Declarative } from "#/lib/declarative/declarative.ts";

/**
 * DenoDoc is a declarative class type from @deno/doc.
 */
export interface DenoDoc {
  properties: DenoDocProperty[];
}

export interface DenoDocProperty {
  type: TsTypeDef;

  /**
   * name is the name of the property.
   */
  name?: string;

  /**
   * paramIndex is the index of the parameter in the implementation
   * constructor signature. Undefined if not a constructor parameter.
   */
  paramIndex?: number;
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

  return (state, name) => {
    return { ...state, denoDoc: getDenoDoc(docNodes, name) };
  };
}

function getDenoDoc(docNodes: DocNode[], name: string): DenoDoc {
  const docNode = docNodes.find((node) => node.name === name);
  if (docNode?.kind !== "class") {
    throw new Error(`Could not find DocNodeClass for ${name}`);
  }

  const properties: DenoDocProperty[] = [];
  for (const property of docNode.classDef.properties) {
    if (property.tsType === undefined) {
      throw new Error(`Could not find tsType for property ${property.name}`);
    }

    properties.push({ name: property.name, type: property.tsType });
  }

  // Get parameters from implementation constructor.
  const parameters = docNode.classDef.constructors.at(-1)?.params ?? [];
  for (let i = 0; i < parameters.length; i++) {
    const parameter = parameters[i];
    if (parameter.tsType === undefined) {
      throw new Error(`Could not find tsType for parameter index ${i}`);
    }

    if (parameter.accessibility !== "public") {
      continue;
    }

    properties.push({ paramIndex: i, type: parameter.tsType });
  }

  return { properties };
}
