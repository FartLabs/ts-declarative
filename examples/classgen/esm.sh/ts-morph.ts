import type { Project } from "ts-morph";
import type { ModuleGraphJson } from "@deno/graph";
import { createGraph } from "@deno/graph";
import { fetchGraph, readGraph } from "./graph.ts";

export async function addEsmSh(
  project: Project,
  specifier: string,
): Promise<void> {
  const graph = await createGraph(specifier);
  for await (const [node, sourceCode] of fetchGraph(graph)) {
    project.createSourceFile(node.specifier, sourceCode);
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
