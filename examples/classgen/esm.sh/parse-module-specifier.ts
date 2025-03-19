export interface ModuleSpecifier {
  path: string;
  prefix?: ModuleSpecifierPrefix;
}

export function parseModuleSpecifier(specifier: string): ModuleSpecifier {
  const cutIndex = specifier.indexOf(":") + 1;
  const prefix = specifier.slice(0, cutIndex);
  if (!isModulePrefix(prefix)) {
    throw new Error(`Invalid entrypoint: ${specifier}`);
  }

  const path = specifier.slice(cutIndex);
  return { prefix, path };
}

export type ModuleSpecifierPrefix = (typeof modulePrefixes)[number];

export function isModulePrefix(value: string): value is ModuleSpecifierPrefix {
  return modulePrefixes.includes(value as ModuleSpecifierPrefix);
}

export const modulePrefixes = ["jsr:", "npm:", "gh:", "pr:"] as const;
