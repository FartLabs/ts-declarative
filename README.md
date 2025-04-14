# ts-declarative

🔥 Declarative TypeScript class decoration library.

## Background

This library provides a novel approach to building computer programs by
emphasizing _what_ the program should do rather than _how_ it should do it.

It leverages TypeScript's decorator feature to apply semantic annotations to
classes and their members. These decorators act as labels that embed extra
information, making it understandable for both developers and the computer.

This additional information enables the library to automate the generation of
other program components, significantly reducing manual coding efforts.

The primary goal is to simplify the development and maintenance of large,
complex applications. By handling repetitive tasks, this tool allows programmers
to concentrate on solving core problems.

Ultimately, `ts-declarative` explores a paradigm shift in software development,
where the computer plays a more active role in handling foundational tasks.

## Technical description

This TypeScript library offers an abstraction layer for annotating TypeScript
classes using decorators. It facilitates the creation of new annotations based
on existing ones, promoting a declarative programming style that enhances code
clarity and maintainability. This framework empowers developers to build robust
and predictable code libraries from declarative TypeScript, substantially
decreasing the manual effort and costs typically associated with maintenance.

A key capability of this library is its use of source code as a knowledge base
through code introspection and decorators, enabling the direct generation of
structured knowledge. This knowledge can be represented as "triples" (subject,
predicate, object), a fundamental concept in knowledge representation.
Furthermore, the library supports inferring implicit knowledge through
rule-based reasoning. Data sources can be accessed via the SPARQL protocol.
Consequently, this library can be employed to develop linked data applications,
such as those discussed in
"[Thinking with Knowledge Graphs: Enhancing LLM Reasoning Through Structured Data](https://arxiv.org/html/2412.10654v1)."

At its core, the framework is a library that allows developers to design
decorators for annotating classes, similar to `reflect-metadata`. A
"Declarative" is a function that updates this annotation and can be curried for
flexible application. The linked example demonstrates several decorators
designed for programming a declarative resource-oriented API server.

## Example

The following example illustrates how to use this library to declare a class and
its annotations.

```ts
// @deno-types="@types/jsonld"
import jsonld from "jsonld";
import { Ajv } from "ajv";
import { context, docOf } from "@fartlabs/declarative/common/jsonld";
import {
  jsonSchemaDecoratorFactoryOfFile,
  jsonSchemaOf,
} from "@fartlabs/declarative/common/json-schema";

@context("https://schema.org/")
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
  //     "@type": "https://schema.org/Person",
  //     "https://schema.org/name": [ { "@value": "Ash Ketchum" } ]
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

Run `deno task lint` to lint the code.

Run `deno task check` to check the code.

Run `deno task outdated` to update outdated dependencies.

Run `deno task test` to run the tests.

Run `deno task example` to run the example.

---

Developed with ❤️‍🔥 [**@FartLabs**](https://github.com/FartLabs)
