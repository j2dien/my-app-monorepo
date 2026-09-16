import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { deleteUserMutationOptions, updateUserMutationOptions } from "@/features/users/api/user.mutations";

import { userQueryOptions } from "@/features/users/api/user.queries";
import { router } from "@/app/router";

export const Route = createFileRoute("/users/$userId")({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...userQueryOptions(params.userId),
    }),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();

    const { data: user } = useSuspenseQuery(userQueryOptions(userId));
    
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
      ...updateUserMutationOptions(userId),

      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["users", userId],
          }),

          queryClient.invalidateQueries({
            queryKey: ["users"],
            exact: true,
          }),
        ]);
      },
    });

    const deleteMutation = useMutation({
      ...deleteUserMutationOptions(userId),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["users"],
          exact: true,
        });

        queryClient.removeQueries({
          queryKey: ["users", userId],
          exact: true,
        });

        await router.navigate({
          to: "/users",
        });
      },
    });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/users" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Users
      </Link>

      <div className="mt-6 rounded-xl border border-zinc-200 p-6">
        <h1 className="text-2xl font-semibold">{user.name}</h1>

        <p className="mt-2 text-zinc-500">{user.email}</p>

        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-zinc-500">ID</dt>

            <dd className="font-mono">{user.id}</dd>
          </div>

          <div>
            <dt className="text-zinc-500">Created</dt>

            <dd>{new Date(user.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}