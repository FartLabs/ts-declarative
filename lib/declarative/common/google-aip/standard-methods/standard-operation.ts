import type { OpenAPIV3_1 } from "openapi-types";

export interface StandardOperation {
  path: string;
  method: string;
  value: OpenAPIV3_1.OperationObject;
}
