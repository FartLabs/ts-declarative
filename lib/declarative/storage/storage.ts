/**
 * DeclarativeStorage is an interface for a storage system that allows
 * setting and getting values based on a string identifier.
 */
export interface DeclarativeStorage<T> {
  /**
   * set sets the value on the storage.
   */
  set(id: string, value: T): void;

  /**
   * get gets the value from the storage.
   */
  get(id: string, defaultValue?: () => T): T | undefined;
}
