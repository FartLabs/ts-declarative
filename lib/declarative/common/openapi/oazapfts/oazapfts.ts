import type { Opts } from "oazapfts";
import { generateSource } from "oazapfts";
import type { Class, Declarative } from "#/lib/declarative/declarative.ts";
import { getPrototypeValue } from "#/lib/declarative/declarative.ts";
import { createDecoratorFactory } from "#/lib/declarative/decorator.ts";
import type { ValueOpenAPI } from "#/lib/declarative/common/openapi/openapi.ts";

export async function generateOazapftsOf<TClass extends Class>(
  target: TClass,
): Promise<string | undefined> {
  return await getPrototypeValue<ValueOazapfts>(target)?.generateOazapfts?.();
}

/**
 * oazapfts is a decorator that generates a TypeScript client for the OpenAPI
 * specification using oazapfts.
 */
export const oazapfts = oazapftsDecoratorFactory();

/**
 * oazapftsDecoratorFactory is a decorator factory for oazapfts.
 */
export function oazapftsDecoratorFactory() {
  return createDecoratorFactory({
    initialize: (options?: OazapftsOptions) => {
      return [declarativeOazapfts(options)];
    },
  });
}

/**
 * declarativeOazapfts is a declarative for oazapfts.
 *
 * @see https://github.com/oazapfts/oazapfts
 */
export function declarativeOazapfts<
  TValue extends ValueOazapfts,
>(options?: OazapftsOptions): Declarative<TValue> {
  return (value) => {
    return {
      ...value,
      generateOazapfts: () =>
        generateSource(value?.specification as unknown as string, options),
    } as TValue;
  };
}

/**
 * OazapftsOptions is the options for the oazapfts decorator.
 */
export type OazapftsOptions = Opts;

/**
 * ValueOazapfts is the value expected by the oazapfts decorator.
 */
export interface ValueOazapfts extends ValueOpenAPI {
  generateOazapfts?: () => Promise<string>;
}
