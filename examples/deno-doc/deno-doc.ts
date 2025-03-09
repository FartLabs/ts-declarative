import type { DocNodeClass, DocOptions } from "@deno/doc";
import { doc } from "@deno/doc";
import type { Declarative } from "#/lib/declarative/declarative.ts";

export type { DocNodeClass };

export interface StateDenoDoc {
  denoDoc?: DocNodeClass;
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
    const docNode = docNodes.find((node) => node.name === name);
    if (docNode?.kind !== "class") {
      throw new Error(`Could not find DocNode for ${name}`);
    }

    return { ...state, denoDoc: docNode };
  };
}
