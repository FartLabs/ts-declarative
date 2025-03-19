import type { ModuleGraphJson, ModuleJson } from "@deno/graph";

export async function* fetchGraph(
  graph: ModuleGraphJson,
): AsyncGenerator<[ModuleJson, string]> {
  for (const node of graph.modules) {
    yield [
      node,
      await fetch(node.specifier).then((response) => response.text()),
    ];
  }
}

export async function* readGraph(
  graph: ModuleGraphJson,
): AsyncGenerator<[ModuleJson, string]> {
  for (const node of graph.modules) {
    yield [node, await Deno.readTextFile(node.specifier)];
  }
}
