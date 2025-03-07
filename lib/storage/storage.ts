export interface DeclarativeStorage<T> {
  set(id: string, value: T): void;
  get(query: string, defaultValue?: () => T): T | undefined;
}
