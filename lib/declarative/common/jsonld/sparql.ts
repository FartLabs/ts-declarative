import type { Context } from "#/lib/declarative/common/jsonld/context.ts";

export function expandStrings(context: Context, strings: string[]): string[] {
  const prefixes = getPrefixesFromContext(context);
  return strings.map((value) => {
    const prefixIndex = value.indexOf(":");
    const prefix = value.slice(0, prefixIndex + 1);
    const suffix = value.slice(prefixIndex + 1);
    if (prefix === "" && prefixes.has(suffix)) {
      return prefixes.get(suffix)!;
    }

    const replacement = prefixes.get(prefix);
    if (replacement === undefined) {
      return value;
    }

    return `${replacement}${suffix}`;
  });
}

/**
 * getPrefixesFromContext returns the prefixes from a JSON-LD context.
 *
 * This function only supports the "@vocab" key and the top-level keys for simplicity.
 * Therefore, it won't work for every JSON-LD context.
 */
function getPrefixesFromContext(context: Context): Map<string, string> {
  const prefixes = new Map<string, string>();
  if (typeof context === "string") {
    prefixes.set("", context);
    return prefixes;
  }

  if (context["@vocab"] !== undefined) {
    prefixes.set("", context["@vocab"]);
  }

  for (const [key, value] of Object.entries(context)) {
    if (key.startsWith("@")) {
      continue;
    }

    prefixes.set(key, value);
  }

  return prefixes;
}

// TODO: Create CRUD queries for JSON-LD.
// Nuances: https://github.com/Semantu/lincd?tab=readme-ov-file#removing-properties
//
