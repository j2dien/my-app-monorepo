import { type CreateUserInput, createUserInputSchema } from "@app/contracts";
import { useState } from "react";

import { ApiClientError } from "@/lib/api/api-error";

import { useAppForm } from "@/lib/form/use-app-form";

type UserFieldErrors = Partial<Record<keyof CreateUserInput, string>>;

interface UserFormProps {
  submitLabel: string;

  defaultValues?: CreateUserInput;

  onSubmit: (input: CreateUserInput) => Promise<void>;
}

function getUserFieldErrors(error: ApiClientError): UserFieldErrors {
  const fields = error.details?.fields;

  if (!fields) {
    return {};
  }

  return {
    ...(fields.name?.[0]
      ? { name: fields.name[0] }
      : {}),
    ...(fields.email?.[0]
      ? { email: fields.email[0] }
      : {}),
  };
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

  const clearServerError = (
    field: keyof CreateUserInput
  ) => {
    setServerErrors((current) => {
      if (!(field in current)) {
        return current;
      }
      
      const next = { ...current };
      delete next[field];

      return next;
    })
  }

  const form = useAppForm({
    defaultValues,

    validators: {
      onChange: createUserInputSchema,
    },

    onSubmit: async ({ value }) => {
      setServerErrors({});
      setFormError(null);

      const parsed = createUserInputSchema.parse(value);

      try {
        await onSubmit(parsed);
      } catch (error) {
        if (error instanceof ApiClientError) {
          const fieldErrors = getUserFieldErrors(error)
          
          if (Object.keys(fieldErrors).length > 0) {
            setServerErrors(fieldErrors);

            return;
          }

          setFormError(error.message)

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
              clearServerError("name")
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
              clearServerError("email")
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
