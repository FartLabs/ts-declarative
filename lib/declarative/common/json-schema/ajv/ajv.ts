import type { ValidateFunction } from "ajv";
import { Ajv } from "ajv";
import type { Class } from "#/lib/declarative/declarative.ts";
import { jsonSchemaOf } from "#/lib/declarative/common/json-schema/json-schema.ts";

/**
 * validate validates the instance against the JSON Schema of its class.
 */
export function validate(instance: InstanceType<Class>): boolean {
  return validateObject(instance.constructor, instance);
}

/**
 * validateObject validates the object against the JSON Schema of the class.
 */
export function validateObject(target: Class, instance: unknown): boolean {
  return validatorOf(target)(instance);
}

/**
 * validatorOf gets the Ajv validator of the class.
 */
export function validatorOf(target: Class): ValidateFunction {
  return new Ajv().compile(jsonSchemaOf(target));
}
