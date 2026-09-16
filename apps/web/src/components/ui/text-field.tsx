import { useFieldContext } from "@/lib/form/form-context";

interface TextFieldProps {
  label: string;
  type?: "text" | "email";
  placeholder?: string;
}

export function TextField({
  label,
  type = "text",
  placeholder,
}: TextFieldProps) {
  const field = useFieldContext<string>();

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
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
      />

      {!field.state.meta.isValid && (
        <div className="mt-1 space-y-1">
          {field.state.meta.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {typeof error === "string" ? error : error?.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
