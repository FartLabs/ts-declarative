import { assert } from "@std/assert/assert";
import type { OpenAPIV3_1 } from "openapi-types";
import { reducePathsObject } from "./paths-object.ts";

const pathsObjects: OpenAPIV3_1.PathsObject[] = [
  {
    "/people": {
      get: { responses: {} },
      post: { responses: {} },
    },
  },
  {
    "/people/{person}": {
      get: { responses: {} },
      post: { responses: {} },
    },
  },
  {
    "/people/{person}": {
      delete: { responses: {} },
    },
  },
];

Deno.test("reducePathsObject reduces paths objects", () => {
  const actual = pathsObjects.reduce(reducePathsObject, {});
  assert(Object.hasOwn(actual, "/people"));
  assert(Object.hasOwn(actual["/people"]!, "get"));
  assert(Object.hasOwn(actual["/people"]!, "post"));

  assert(Object.hasOwn(actual, "/people/{person}"));
  assert(Object.hasOwn(actual["/people/{person}"]!, "get"));
  assert(Object.hasOwn(actual["/people/{person}"]!, "post"));
  assert(Object.hasOwn(actual["/people/{person}"]!, "delete"));
});
