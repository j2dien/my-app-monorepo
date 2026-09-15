import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <h1>My App</h1>

      <p>React + TanStack Router + Hono</p>
    </main>
  );
}
