import { useFieldContext } from "@/lib/form/form-context";

interface TextFieldProps {
  label: string;
  type?: "text" | "email";
  placeholder?: string;
  serverError?: string;
  onValueChange?: () => void;
}

export function TextField({
  label,
  type = "text",
  placeholder,
  serverError,
  onValueChange,
}: TextFieldProps) {
  const field = useFieldContext<string>();

  const clientErrors = field.state.meta.errors;

  const hasClientError = !field.state.meta.isValid;

  const hasError = hasClientError || Boolean(serverError);

  return (
    <div>
      <label htmlFor={field.name} className="text-sm font-medium">
        {label}
      </label>

      <input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        placeholder={placeholder}
        aria-invalid={hasError}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value);

          onValueChange?.();
        }}
        className={[
          "mt-1 w-full rounded-md border px-3 py-2 outline-none transition",
          hasError
            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200",
        ].join(" ")}
      />

      {hasClientError && (
        <div className="mt-1 space-y-1">
          {clientErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {typeof error === "string" ? error : error?.message}
            </p>
          ))}
        </div>
      )}

      {!hasClientError && serverError && (
        <p className="mt-1 text-sm text-red-600">{serverError}</p>
      )}
    </div>
  );
}
