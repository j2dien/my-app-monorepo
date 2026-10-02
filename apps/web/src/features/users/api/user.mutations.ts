import { mutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { createUser, deleteUser, updateUser } from "./user.api"
import { userKeys } from "./user.keys";

export const createUserMutationOptions = mutationOptions({
  mutationKey: userKeys.create(),
  mutationFn: createUser,
})

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...createUserMutationOptions,

    onSuccess: async (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user)

      await queryClient.invalidateQueries({
        queryKey: userKeys.lists()
      })
    }
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,

    onSuccess: async (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user),

      await queryClient.invalidateQueries({
        queryKey: userKeys.lists()
      })
    }
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,

    onSuccess: async (_, userId) => {
      queryClient.removeQueries({
        queryKey: userKeys.detail(userId),
      });

      await queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}
