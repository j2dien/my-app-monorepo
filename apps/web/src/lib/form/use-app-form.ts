import { createFormHook } from "@tanstack/react-form";

import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";

import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
  },

  formComponents: {
    SubmitButton,
  },

  fieldContext,
  formContext,
});
