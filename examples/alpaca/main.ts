import { Movie } from "./movie.ts";

const kv = await Deno.openKv(":memory:");

// TODO: Create movie list application.
// http://dbpedia.org/resource/Pok%C3%A9mon:_The_First_Movie
//
// Endpoints:
// GET /movies - List of movies
// GET /movies/:id - Get movie by ID
// POST /movies - Add movie to list
// DELETE /movies/:id - Remove movie from list
//

// TODO: Autocomplete API for movies from DBpedia with Orama.
//

if (import.meta.main) {
  Deno.serve(async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/movies") {
      switch (request.method) {
        case "GET": {
          const movies = await Array.fromAsync(
            kv.list<Movie>({ prefix: ["movies"] }),
          );
          if (movies.length === 0) {
            return new Response("No movies");
          }

          return new Response(
            movies
              .map(
                ({ value: movie }) =>
                  `- ${movie.id}${
                    movie.label !== undefined ? `: ${movie.label}` : ""
                  }`,
              )
              .join("\n"),
            {
              headers: { "Content-Type": "text/plain" },
            },
          );
        }

        case "POST": {
          const formData = await request.formData();
          if (!formData.has("id")) {
            return new Response("Missing ID", { status: 400 });
          }

          // TODO: Fetch label by ID via DBpedia SPARQL endpoint.
          const movie = new Movie(formData.get("id")!.toString());
          await kv.set(["movies", movie.id], movie);
          return new Response("OK", { status: 200 });
        }
      }
    }

    if (url.pathname === "/favicon.ico") {
      return Response.redirect("https://fartlabs.org/fl-logo.png", 302);
    }

    return new Response("Not Found", { status: 404 });
  });
}
