import type { ModuleSpecifier } from "./parse-module-specifier.ts";
import { parseModuleSpecifier } from "./parse-module-specifier.ts";

export function makeSpecifierURL(specifier: string): URL {
  const { path, prefix } = parseModuleSpecifier(specifier);
  if (prefix === undefined) {
    return new URL(path);
  }

  return makeEsmShURL({ path, prefix });
}

export function makeEsmShURL({ path, prefix }: ModuleSpecifier): URL {
  switch (prefix) {
    case "npm:": {
      return new URL(`https://esm.sh/${path}`);
    }

    case "jsr:": {
      return new URL(`https://esm.sh/jsr/${path}`);
    }

    case "gh:": {
      return new URL(`https://esm.sh/gh/${path}`);
    }

    case "pr:": {
      return new URL(`https://esm.sh/pr/${path}`);
    }

    default: {
      throw new Error(`Unsupported prefix: ${prefix}`);
    }
  }
}
