import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { queryClient } from "./app/query-client";
import { router } from "./app/router";
import "./styles.css";

// declare module "@tanstack/react-router" {
//   interface Register {
//     router: typeof router;
//   }
// }

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
