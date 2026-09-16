import { createUserSchema, type CreateUserInput } from "@app/contracts/users";

import { useAppForm } from "@/lib/form/use-app-form";

interface UserFormProps {
  defaultValues?: CreateUserInput;

  submitLabel: string;

  onSubmit: (input: CreateUserInput) => void | Promise<void>;
}

export function UserForm({
  defaultValues = {
    name: "",
    email: "",
  },

  submitLabel,

  onSubmit,
}: UserFormProps) {
  const form = useAppForm({
    defaultValues,

    validators: {
      onChange: createUserSchema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit(value);
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
        {(field) => <field.TextField label="Name" placeholder="John Doe" />}
      </form.AppField>

      <form.AppField name="email">
        {(field) => (
          <field.TextField
            label="Email"
            type="email"
            placeholder="john@example.com"
          />
        )}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton>{submitLabel}</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
