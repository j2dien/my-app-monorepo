import { mutationOptions } from "@tanstack/react-query";

import type { CreateUserInput, UpdateUserInput } from "@app/contracts/users";

import { api } from "@/lib/api/client";
import { throwApiError } from "@/lib/api/error";
import { userKeys } from "./user.keys";

export const createUserMutationOptions = mutationOptions({
  mutationKey: [...userKeys.all, "create"],

  mutationFn: async (input: CreateUserInput) => {
    const response = await api.api.v1.users.$post({
      json: input,
    });

    if (!response.ok) {
      return throwApiError(response);
    }

    const body = await response.json();

    return body.data;
  },
});

export function updateUserMutationOptions(userId: string) {
  return mutationOptions({
    mutationKey: [...userKeys.detail(userId), "update"],

    mutationFn: async (input: UpdateUserInput) => {
      const response = await api.api.v1.users[":id"].$patch({
        param: {
          id: userId,
        },
        json: input,
      });

      if (!response.ok) {
        return throwApiError(response);
      }

      const body = await response.json();

      return body.data;
    },
  });
}

export function deleteUserMutationOptions(userId: string) {
  return mutationOptions({
    mutationKey: [...userKeys.detail(userId), "delete"],

    mutationFn: async () => {
      const response = await api.api.v1.users[":id"].$delete({
        param: {
          id: userId,
        },
      });

      if (!response.ok) {
        return throwApiError(response);
      }
    },
  });
}
