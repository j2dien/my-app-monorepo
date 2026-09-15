import { queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api/client";

async function getHealth() {
  const response = await api.api.v1.health.$get();

  if (!response.ok) {
    throw new Error("Failed to fetch API health");
  }

  return response.json();
}

export const healthQueryOptions = queryOptions({
  queryKey: ["health"],
  queryFn: getHealth,
});
