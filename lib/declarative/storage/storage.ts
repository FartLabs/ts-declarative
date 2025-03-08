export interface DeclarativeStorage<T> {
  set(id: string, value: T): void;
  get(id: string, defaultValue?: () => T): T | undefined;
}
