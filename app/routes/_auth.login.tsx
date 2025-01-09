import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect, useActionData } from "@remix-run/react";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { ErrorMessage, Field } from "~/components/Field";
import { StatusButton } from "~/components/StatusButton";
import { login, requireAnonymous } from "~/utils/auth.server";
import { useIsPending } from "~/utils/misc";
import { sessionStorage } from "~/utils/session.server";
import { PasswordSchema, EmailSchema } from "~/utils/user-validation";

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request);
  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: () =>
      LoginFormSchema.transform(async (data, ctx) => {
        const user = await login(data);
        if (!user) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        return { ...data, user };
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

  const { user } = submission.value;

  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  cookieSession.set("userId", user.id);

  // TODO: support dynamic redirect
  return redirect(safeRedirect("/"), {
    headers: {
      "set-cookie": await sessionStorage.commitSession(cookieSession),
    },
  });
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
