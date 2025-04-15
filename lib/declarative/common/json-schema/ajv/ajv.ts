import type { Options, ValidateFunction } from "ajv";
import { Ajv } from "ajv";
import type { Class } from "#/lib/declarative/declarative.ts";
import { jsonSchemaOf } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * validate validates the instance against the JSON Schema of its class.
 */
export function validate(
  instance: InstanceType<Class>,
  options?: Options,
): boolean {
  return validateObject(instance.constructor, instance, options);
}

/**
 * validateObject validates the object against the JSON Schema of the class.
 */
export function validateObject(
  target: Class,
  instance: unknown,
  options?: Options,
): boolean {
  const fn = validatorOf(target, options);
  return fn(instance);
}

/**
 * validatorOf gets the Ajv validator of the class.
 */
export function validatorOf(
  target: Class,
  options?: Options,
): ValidateFunction {
  return createValidator(jsonSchemaOf(target), options);
}

/**
 * createValidator creates an Ajv validator from the JSON Schema.
 */
export function createValidator(
  // deno-lint-ignore no-explicit-any
  schema: any,
  options?: Options,
): ValidateFunction {
  return new Ajv(options).compile(schema);
}

/**
 * createValidatorSafe does not throw when the schema is invalid.
 */
export function createValidatorSafe(
  // deno-lint-ignore no-explicit-any
  schema: any,
  options?: Options,
): ValidateFunction | undefined {
  if (schema === undefined) {
    return undefined;
  }

  try {
    return new Ajv(options).compile(schema);
  } catch {
    return undefined;
  }
}
