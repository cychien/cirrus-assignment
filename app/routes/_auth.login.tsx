import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect, useActionData } from "@remix-run/react";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { ErrorMessage, Field } from "~/components/Field";
import { StatusButton } from "~/components/StatusButton";
import { useIsPending } from "~/utils/misc";
import { PasswordSchema, EmailSchema } from "~/utils/user-validation";

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: (intent) =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, user: null };

        // TODO: check user
        ctx.addIssue({
          code: "custom",
          message: "Invalid username or password",
        });
        return z.NEVER;
      }),
    async: true,
  });

  // get the password off the payload that's sent back
  delete submission.payload.password;

  if (!submission.value?.user) {
    return Response.json({ status: "error", submission } as const, {
      status: 400,
    });
  }

  // TODO: save the user to the session
  // TODO: support dynamic redirect

  return redirect(safeRedirect("/"));
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getFieldsetConstraint(LoginFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <main className="pt-16 container mx-auto flex justify-center">
      <div className="max-w-sm flex-1">
        <div>
          <h1 className="text-3xl font-semibold text-center tracking-wide	">
            Log in to your account
          </h1>
          <p className="mt-3 text-gray-600 text-center">
            Welcome back! Please enter your details.
          </p>
        </div>

        <Form method="POST" className="mt-8" {...form.props}>
          <div className="space-y-6">
            <Field
              labelProps={{ children: "Email" }}
              inputProps={{
                ...conform.input(fields.email),
                placeholder: "Enter your email",
                autoFocus: true,
              }}
              errors={fields.email.errors}
              className="grid w-full items-center gap-1.5"
            />
            <Field
              labelProps={{ children: "Password" }}
              inputProps={{
                ...conform.input(fields.password, { type: "password" }),
                placeholder: "Enter your password",
              }}
              errors={fields.password.errors}
              className="grid w-full items-center gap-1.5"
            />
          </div>

          <div>
            <StatusButton
              type="submit"
              status={isPending ? "pending" : actionData?.status ?? "idle"}
              disabled={isPending}
              className="mt-8 w-full"
            >
              Log in
            </StatusButton>
            {/* TODO: show error message on toast */}
            {form.errorId && (
              <div className="mt-1.5 text-center">
                <ErrorMessage errors={form.errors} id={form.errorId} />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Don’t have an account?
            <Link
              to="/signup"
              className="ml-1 text-gray-700 underline font-medium hover:text-gray-500"
            >
              Sign up
            </Link>
          </p>
        </Form>
      </div>
    </main>
  );
}
