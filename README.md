# ts-declarative

🔥 Declarative TypeScript class decoration library.

## Background

This tool helps create computer programs in a new way. It focuses on telling the
computer what to do, not how to do it.

You use semantic annotations in TypeScript (called decorators) to label parts of
your program. These labels add extra information that both people and computers
can understand.

This extra information helps the computer build other parts of the program
automatically. This reduces the amount of manual work needed.

The goal is to make it easier to create and maintain large, complex programs.
This tool handles repetitive tasks, letting programmers focus on solving
problems.

It explores a different way to build computer programs, one where the computer
helps more with the basic work.

## Technical description

This TypeScript library provides an abstraction layer for annotating TypeScript
classes using decorators, enabling the derivation of new annotations from
existing ones. By embracing declarative programming principles, it simplifies
problem-solving, enhancing code understandability and maintainability. The
framework empowers developers to create robust and predictable code libraries
from declarative TypeScript, significantly reducing the manual effort and
expense typically associated with maintenance.

A core feature of this library is its ability to utilize source code as a
knowledge base through code introspection and decorators, facilitating the
direct generation of tangible knowledge. This knowledge can be represented as
"triples" (subject, predicate, object), a fundamental structure in knowledge
representation. Furthermore, the library supports the derivation of implicit
knowledge through rule-based reasoning. Data sources can be interfaced via the
SPARQL protocol. This library can be used to build linked data applications,
such as those described in
[Thinking with Knowledge Graphs: Enhancing LLM Reasoning Through Structured Data](https://arxiv.org/html/2412.10654v1).

## Example

The following example shows how to use this library to declare a class and its
annotations.

```ts
@context("http://schema.org/")
@jsonSchema()
export class Person {
  public constructor(public name: string) {}
}

// deno task example
if (import.meta.main) {
  const ash = new Person("Ash Ketchum");
  const expandedAsh = await jsonld.expand(docOf(ash));
  console.log(expandedAsh);
  // Output:
  // [
  //   {
  //     "@type": [ "http://schema.org/Person" ],
  //     "http://schema.org/name": [ { "@value": "Ash Ketchum" } ]
  //   }
  // ]

  const ajv = new Ajv();
  const validate = ajv.compile(
    getPrototypeValue<ValueJSONSchema>(Person)?.jsonSchema,
  );
  const isValid = validate(ash);
  console.log(isValid);
  // Output:
  // true
}
```

## Contribute

Run `deno fmt` to format the code.

Run `deno lint` to lint the code.

Run `deno task outdated` to update outdated dependencies.

Run `deno task test` to run the tests.

## Example

Run `deno task check` to check the code.

Run `deno task example` to run the example.

---

Developed with ❤️‍🔥 [**@FartLabs**](https://github.com/FartLabs)
