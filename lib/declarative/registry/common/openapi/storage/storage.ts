/**
 * OpenAPIServerStorage is a database for OpenAPI resources.
 */
export interface OpenAPIServerStorage {
  set<T>(id: string, value: T): Promise<void>;
  get<T>(id: string): Promise<T | undefined>;
  delete(id: string): Promise<void>;
  list<T>(): Promise<T[]>;
}
