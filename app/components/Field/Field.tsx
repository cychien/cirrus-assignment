import { useId } from "react";
import { Input } from "../Input";
import { Label } from "../Label";
import { Textarea } from "../Textarea";

type ListOfErrors = Array<string | null | undefined> | null | undefined;

function ErrorMessage({ id, errors }: { errors?: ListOfErrors; id?: string }) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <p className="text-sm text-red-600" id={id}>
      {errorsToRender[0]}
    </p>
  );
}

function Field({
  labelProps,
  inputProps,
  errors,
  className,
}: {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: ListOfErrors;
  className?: string;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div>
      <div className={className}>
        <Label htmlFor={id} {...labelProps} />
        <Input
          id={id}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          {...inputProps}
        />
      </div>
      {/* TODO: resolve layout shift when error message appears */}
      {errorId ? (
        <div className="mt-1">
          <ErrorMessage id={errorId} errors={errors} />
        </div>
      ) : null}
    </div>
  );
}

function TextareaField({
  labelProps,
  textareaProps,
  errors,
  className,
}: {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  errors?: ListOfErrors;
  className?: string;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} {...labelProps} />
      <Textarea
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...textareaProps}
      />
      {errorId ? (
        <div className="mt-1">
          <ErrorMessage id={errorId} errors={errors} />
        </div>
      ) : null}
    </div>
  );
}

export { Field, TextareaField, ErrorMessage };
export type { ListOfErrors };
