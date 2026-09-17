import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

import {
  deleteUserMutationOptions,
  updateUserMutationOptions,
} from "@/features/users/api/user.mutations";

import { userQueryOptions } from "@/features/users/api/user.queries";
import { ApiError } from "@/lib/api/error";
import { UserForm } from "@/features/users/components/user-form";
import { userKeys } from "@/features/users/api/user.keys";

export const Route = createFileRoute("/users_/$userId")({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...userQueryOptions(params.userId),
    }),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useSuspenseQuery(userQueryOptions(userId));

  const detailOptions = userQueryOptions(userId);

  const updateMutation = useMutation({
    ...updateUserMutationOptions(userId),

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: detailOptions.queryKey,
        exact: true,
      });

      const previousUser = queryClient.getQueryData(detailOptions.queryKey);

      queryClient.setQueryData(detailOptions.queryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          ...input,
        };
      });

      return {
        previousUser,
      };
    },

    onError: (_error, _input, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(detailOptions.queryKey, context.previousUser);
      }
    },

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(detailOptions.queryKey, updatedUser);
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });

  const deleteMutation = useMutation({
    ...deleteUserMutationOptions(userId),

    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: userKeys.detail(userId),
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });

      await router.navigate({
        to: "/users",
      });
    },
  });

  const updateError =
    updateMutation.error instanceof ApiError ? updateMutation.error : null;

  const deleteError =
    deleteMutation.error instanceof ApiError ? deleteMutation.error : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/users" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Users
      </Link>

      <section className="mt-6 rounded-xl border border-zinc-200 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Edit user</h1>

          <p className="mt-1 text-sm text-zinc-500">{user.id}</p>
        </div>

        <div className="mt-6">
          <UserForm
            defaultValues={{
              name: user.name,
              email: user.email,
            }}
            submitLabel="Update user"
            onSubmit={async (input) => {
              await updateMutation.mutateAsync(input);
            }}
          />

          {updateError && !updateError.fields && (
            <p className="mt-3 text-sm text-red-600">{updateError.message}</p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-700">Danger zone</h2>

        <p className="mt-2 text-sm text-zinc-600">
          Deleting this user cannot be undone.
        </p>

        {deleteError && (
          <p className="mt-3 text-sm text-red-600">{deleteError.message}</p>
        )}

        <button
          type="button"
          disabled={deleteMutation.isPending}
          onClick={() => {
            const confirmed = window.confirm(`Delete ${user.name}?`);

            if (!confirmed) {
              return;
            }

            deleteMutation.mutate();
          }}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete user"}
        </button>
      </section>
    </main>
  );
}
