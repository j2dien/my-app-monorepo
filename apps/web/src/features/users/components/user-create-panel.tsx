import type { CreateUserInput } from "@app/contracts/users";

import { UserForm } from "./user-form";

interface UserCreatePanelProps {
  formKey: number;
  isPending: boolean;

  onSubmit: (input: CreateUserInput) => Promise<void>;
}

export function UserCreatePanel({
  formKey,
  isPending,
  onSubmit,
}: UserCreatePanelProps) {
  return (
    <aside>
      <div className="sticky top-6 rounded-xl border border-zinc-200 p-6">
        <div>
          <h2 className="text-lg font-semibold">Create user</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Add a new user to the application.
          </p>
        </div>

        <div className="mt-6">
          <UserForm
            key={formKey}
            submitLabel={isPending ? "Creating..." : "Create user"}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </aside>
  );
}
