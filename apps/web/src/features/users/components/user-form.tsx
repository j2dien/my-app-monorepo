import { useState, type FormEvent } from "react";

import { createUserSchema, type CreateUserInput } from "@app/contracts/users";

type FieldErrors = Partial<Record<keyof CreateUserInput, string>>;

interface UserFormProps {
  defaultValues?: CreateUserInput;

  submitLabel: string;

  isPending?: boolean;

  serverErrors?: FieldErrors;

  onSubmit: (input: CreateUserInput) => void | Promise<void>;
}

export function UserForm({
  defaultValues = {
    name: "",
    email: "",
  },
  submitLabel,
  isPending = false,
  serverErrors,
  onSubmit,
}: UserFormProps) {
  const [values, setValues] = useState(defaultValues);

  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = createUserSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateUserInput;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);

      return;
    }

    setErrors({});

    void onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>

        <input
          id="name"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
        />

        {(errors.name || serverErrors?.name) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name ?? serverErrors?.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={values.email}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
        />

        {(errors.email || serverErrors?.email) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.email ?? serverErrors?.email}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
