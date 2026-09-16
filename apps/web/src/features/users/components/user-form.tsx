import { useState } from "react";

import { createUserSchema, type CreateUserInput } from "@app/contracts/users";

import { ApiError } from "@/lib/api/error";

import { useAppForm } from "@/lib/form/use-app-form";

type UserFieldErrors = Partial<Record<keyof CreateUserInput, string>>;

interface UserFormProps {
  submitLabel: string;

  defaultValues?: CreateUserInput;

  onSubmit: (input: CreateUserInput) => Promise<void>;
}

export function UserForm({
  submitLabel,

  defaultValues = {
    name: "",
    email: "",
  },

  onSubmit,
}: UserFormProps) {
  const [serverErrors, setServerErrors] = useState<UserFieldErrors>({});

  const [formError, setFormError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues,

    validators: {
      onChange: createUserSchema,
    },

    onSubmit: async ({ value }) => {
      setServerErrors({});
      setFormError(null);

      const parsed = createUserSchema.parse(value);

      try {
        await onSubmit(parsed);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.fields) {
            setServerErrors(error.fields);

            return;
          }

          /*
           * Business error yang secara
           * semantik milik email.
           */
          if (error.code === "EMAIL_ALREADY_EXISTS") {
            setServerErrors({
              email: error.message,
            });

            return;
          }

          setFormError(error.message);

          return;
        }

        setFormError("Something went wrong");
      }
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();

        void form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Name"
            placeholder="John Doe"
            serverError={serverErrors.name}
            onValueChange={() => {
              if (serverErrors.name) {
                setServerErrors((current) => ({ ...current, name: undefined }));
              }
            }}
          />
        )}
      </form.AppField>

      <form.AppField name="email">
        {(field) => (
          <field.TextField
            label="Email"
            type="email"
            placeholder="john@example.com"
            serverError={serverErrors.email}
            onValueChange={() => {
              if (serverErrors.email) {
                setServerErrors((current) => ({
                  ...current,
                  email: undefined,
                }));
              }
            }}
          />
        )}
      </form.AppField>

      {formError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      )}

      <form.AppForm>
        <form.SubmitButton>{submitLabel}</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
