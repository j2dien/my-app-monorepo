import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { Link, createFileRoute, useRouter, notFound } from "@tanstack/react-router";

import {
  deleteUserMutationOptions,
  updateUserMutationOptions,
} from "@/features/users/api/user.mutations";

import { userQueryOptions } from "@/features/users/api/user.queries";
import { ApiError } from "@/lib/api/error";
import { UserForm } from "@/features/users/components/user-form";
import { userKeys } from "@/features/users/api/user.keys";

export const Route = createFileRoute("/users_/$userId")({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.query({
        ...userQueryOptions(params.userId),
      });
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "USER_NOT_FOUND"
      ) {
        throw notFound();
      }

      throw error;
    }
  },
  notFoundComponent: UserNotFound,
  errorComponent: UserDetailError,
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

function UserNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-xl border border-zinc-200 p-8 text-center">
        <h1 className="text-xl font-semibold">
          User not found
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          The user you are looking for does not exist.
        </p>

        <Link
          to="/users"
          className="mt-6 inline-block rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Back to users
        </Link>
      </div>
    </main>
  );
}

function UserDetailError({
  error,
}: {
  error: unknown;
}) {
  const router = useRouter();

  const message =
    error instanceof ApiError
      ? error.message
      : "Something went wrong";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-xl border border-red-200 p-8">
        <h1 className="text-xl font-semibold">
          Failed to load user
        </h1>

        <p className="mt-2 text-sm text-red-700">
          {message}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => {
              void router.invalidate();
            }}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>

          <Link
            to="/users"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium"
          >
            Back to users
          </Link>
        </div>
      </div>
    </main>
  );
}
