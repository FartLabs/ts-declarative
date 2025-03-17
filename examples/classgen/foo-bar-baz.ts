interface Foo {
  /**
   * foo is a string.
   */
  foo: string;
}

type Bar = {
  /**
   * bar is a number.
   */
  bar: number;
};

interface FooBar extends Foo, Bar {}

export interface FooBarBaz extends FooBar {
  /**
   * baz is a boolean.
   */
  baz: boolean;
}
