import { route } from "@std/http/unstable-route";
import { Movie } from "./movie.ts";

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

const kv = await Deno.openKv(":memory:");

const router = route(
  [
    {
      method: "GET",
      pattern: new URLPattern({ pathname: "/favicon.ico" }),
      handler: () => {
        return Response.redirect("https://fartlabs.org/fl-logo.png");
      },
    },
    {
      method: "GET",
      pattern: new URLPattern({ pathname: "/movies" }),
      handler: async () => {
        const movies = await Array.fromAsync(
          kv.list<Movie>({ prefix: ["movies"] }),
        );
        return new Response(
          // TODO: Render message to add movie if list is empty.
          // TODO: Render form to add movie.
          // TODO: Render delete button that deletes selected movies, allowing the user to select all movies easily.

          movies.length === 0
            ? "No movies"
            : renderMovies(movies.map(({ value: movie }) => movie)),
          { headers: { "Content-Type": "text/html" } },
        );
      },
    },
    {
      method: "POST",
      pattern: new URLPattern({ pathname: "/movies" }),
      handler: async (request) => {
        const formData = await request.formData();
        const id = formData.get("id")?.toString();
        if (id === undefined) {
          throw new Error("Missing ID");
        }

        const label = formData.get("label")?.toString();
        await kv.set(["movies", id], new Movie(id, label));
        return new Response("OK", { status: 200 });
      },
    },
    {
      method: "DELETE",
      pattern: new URLPattern({ pathname: "/movies/:id" }),
      handler: async (_request, params) => {
        const id = params?.pathname.groups?.id;
        if (id === undefined) {
          throw new Error("Missing ID");
        }

        await kv.delete(["movies", id]);
        return new Response("OK", { status: 200 });
      },
    },
    {
      method: "GET",
      pattern: new URLPattern({ pathname: "/movies/:id" }),
      handler: async (_request, params) => {
        const id = params?.pathname.groups?.id;
        if (id === undefined) {
          throw new Error("Missing ID");
        }

        const movie = await kv.get<Movie>(["movies", id]);
        if (movie.value === null) {
          return new Response("Not Found", { status: 404 });
        }

        return new Response(renderMovie(movie.value), {
          headers: { "Content-Type": "text/html" },
        });
      },
    },
  ],
  () => {
    return new Response("Not Found", { status: 404 });
  },
);

if (import.meta.main) {
  Deno.serve((request) => router(request));
}

function renderMovies(movies: Movie[]) {
  return `<ul>${
    movies
      .map((movie) => `<li>${renderMovie(movie)}</li>`)
      .join("")
  }</ul>`;
}

function renderMovie(movie: Movie) {
  const movieURL = `/movies/${encodeURIComponent(movie.id)}`;
  return `<a href="${movieURL}">${movie.id}${
    movie.label !== undefined ? ` "${movie.label}"` : ""
  }</a>`;
}
