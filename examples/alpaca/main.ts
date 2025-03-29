import { route } from "@std/http/unstable-route";
import { Todo } from "./todo.ts";

// TODO: Create todo list application.
// Endpoints:
// GET /todos - List of todos
// GET /todos/:id - Get todo by ID
// POST /todos - Add todo to list
// DELETE /todos/:id - Remove todo from list
//

// TODO: Autocomplete API for todos using Orama.
//

const kv = await Deno.openKv(":memory:");

// TODO: Refactor to use rtx.
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
      pattern: new URLPattern({ pathname: "/todos" }),
      handler: async () => {
        // TODO: Implement pagination.
        const todos = await Array.fromAsync(
          kv.list<Todo>({ prefix: ["todos"] }),
        );

        // TODO: Render message to add todo if list is empty.
        // TODO: Render form to add todo.
        // TODO: Render delete button that deletes selected todos, allowing the user to select all todos easily.
        // TODO: Manually test endpoints.
        return new Response(
          todos.length === 0
            ? "No todos"
            : renderTodos(todos.map(({ value: todo }) => todo)),
          { headers: { "Content-Type": "text/html" } },
        );
      },
    },
    {
      method: "POST",
      pattern: new URLPattern({ pathname: "/todos" }),
      handler: async (request) => {
        const formData = await request.formData();
        const uid = formData.get("uid")?.toString();
        if (uid === undefined) {
          throw new Error("Missing UID");
        }

        const summary = formData.get("summary")?.toString();
        if (summary === undefined) {
          throw new Error("Missing summary");
        }

        const todo = new Todo(uid, summary);
        await kv.set(["todos", uid], todo);
        return new Response("OK", { status: 200 });
      },
    },
    {
      method: "DELETE",
      pattern: new URLPattern({ pathname: "/todos/:uid" }),
      handler: async (_request, params) => {
        const uid = params?.pathname.groups?.uid;
        if (uid === undefined) {
          throw new Error("Missing UID");
        }

        await kv.delete(["todos", uid]);
        return new Response("OK", { status: 200 });
      },
    },
    {
      method: "GET",
      pattern: new URLPattern({ pathname: "/todos/:uid" }),
      handler: async (_request, params) => {
        const uid = params?.pathname.groups?.uid;
        if (uid === undefined) {
          throw new Error("Missing UID");
        }

        const todo = await kv.get<Todo>(["todos", uid]);
        if (todo.value === null) {
          return new Response("Not Found", { status: 404 });
        }

        // TODO: Render form to update todo.
        // TODO: Render delete button to delete todo.
        // TODO: Render done button to toggle done status.
        return new Response(renderTodo(todo.value), {
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

// TODO: Refactor to use htx.
function renderTodos(todos: Todo[]) {
  return `<ul>${
    todos
      .map((todo) => `<li>${renderTodo(todo)}</li>`)
      .join("")
  }</ul>`;
}

function renderTodo(todo: Todo) {
  const todoURL = `/todos/${encodeURIComponent(todo.uid)}`;
  return `<a href="${todoURL}">${todo.uid} - ${todo.summary}</a>`;
}
