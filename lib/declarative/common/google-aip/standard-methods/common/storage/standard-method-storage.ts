/**
 * StandardMethodStorage is an interface for a storage system that allows
 * setting and getting values in a resource-oriented system.
 */
export interface StandardMethodStorage {
  /**
   * set sets the value on the storage.
   */
  set<T>(key: string[], value: T): Promise<void>;

  /**
   * get gets the value from the storage.
   */
  get<T>(key: string[]): Promise<T | null>;

  /**
   * delete deletes the value from the storage.
   */
  delete(key: string[]): Promise<void>;

  /**
   * list lists the values from the storage.
   */
  list<T>(): AsyncIterable<T>;
}
