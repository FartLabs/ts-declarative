import { Eta } from "@eta-dev/eta";
import { jsonSchemaString } from "./movie.ts";

const renderer = new Eta();
const htmlTmpl = await Deno.readTextFile(
  new URL(import.meta.resolve("./index.tmpl.html")),
);

if (import.meta.main) {
  Deno.serve(async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      const result = await renderer.renderStringAsync(htmlTmpl, {
        jsonSchemaString,
      });

      return new Response(result, { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === "/favicon.ico") {
      return Response.redirect("https://fartlabs.org/fl-logo.png", 302);
    }

    return new Response("Not Found", { status: 404 });
  });
}
