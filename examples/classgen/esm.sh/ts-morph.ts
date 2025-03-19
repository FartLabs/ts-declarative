import type { Project } from "ts-morph";
import type { ModuleGraphJson, ModuleJson } from "@deno/graph";
import { createGraph } from "@deno/graph";
import { fetchGraph, readGraph } from "./graph.ts";
import { makeEsmShURL } from "./url.ts";
import { parseModuleSpecifier } from "./parse-module-specifier.ts";

export async function walkEsmSh(
  specifier: string,
  fn: (node: ModuleJson, sourceCode: string) => void | Promise<void>,
): Promise<void> {
  const esmShURL = makeEsmShURL(parseModuleSpecifier(specifier));
  const graph = await createGraph(esmShURL.toString());
  for await (const [node, sourceCode] of fetchGraph(graph)) {
    await fn(node, sourceCode);
  }
}

export async function addGraph(
  project: Project,
  graph: ModuleGraphJson,
): Promise<void> {
  for await (const [node, sourceCode] of fetchGraph(graph)) {
    project.createSourceFile(node.specifier, sourceCode);
  }
}

export async function addFileGraph(
  project: Project,
  graph: ModuleGraphJson,
): Promise<void> {
  for await (const [node, sourceCode] of readGraph(graph)) {
    project.createSourceFile(node.specifier, sourceCode);
  }
}
