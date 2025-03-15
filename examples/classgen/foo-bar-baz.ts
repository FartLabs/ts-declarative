interface Foo {
  foo: string;
}

type Bar = { bar: string };

interface FooBar extends Foo, Bar {}

export interface FooBarBaz extends FooBar {
  baz: string;
}
