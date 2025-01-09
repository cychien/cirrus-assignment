import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect, useActionData } from "@remix-run/react";
import { z } from "zod";
import { safeRedirect } from "remix-utils/safe-redirect";
import { ErrorMessage, Field } from "~/components/Field";
import { StatusButton } from "~/components/StatusButton";
import { useIsPending } from "~/utils/misc";
import {
  EmailSchema,
  NameSchema,
  PasswordSchema,
} from "~/utils/user-validation";

const SignupFormSchema = z
  .object({
    email: EmailSchema,
    name: NameSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "The passwords must match",
      });
    }
  });

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: SignupFormSchema.superRefine(async (data, ctx) => {
      // const existingUser = await prisma.user.findUnique({
      //   where: { username: data.username },
      //   select: { id: true },
      // });
      // if (existingUser) {
      //   ctx.addIssue({
      //     path: ["username"],
      //     code: z.ZodIssueCode.custom,
      //     message: "A user already exists with this username",
      //   });
      //   return;
      // }
    }).transform(async (data) => {
      // const user = await signup(data);
      return { ...data, user: null };
    }),
    async: true,
  });

  if (!submission.value?.user) {
    return Response.json({ status: "error", submission } as const, {
      status: 400,
    });
  }

  const { user } = submission.value;

  return redirect(safeRedirect("/"));
}

export default function SignupPage() {
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "signup-form",
    constraint: getFieldsetConstraint(SignupFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: SignupFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <main className="pt-16 container mx-auto flex justify-center">
      <div className="max-w-sm flex-1">
        <div>
          <h1 className="text-3xl font-semibold text-center tracking-wide	">
            Create an account
          </h1>
          <p className="mt-3 text-gray-600 text-center">
            Start being part of us!
          </p>
        </div>

        <Form method="POST" className="mt-8" {...form.props}>
          <div className="space-y-6">
            <Field
              labelProps={{ children: "Email*" }}
              inputProps={{
                ...conform.input(fields.email),
                placeholder: "Enter your email",
                autoComplete: "email",
                autoFocus: true,
              }}
              errors={fields.email.errors}
              className="grid w-full items-center gap-1.5"
            />
            <Field
              labelProps={{ children: "Name*" }}
              inputProps={{
                ...conform.input(fields.name),
                placeholder: "Enter your name",
                autoComplete: "name",
              }}
              errors={fields.name.errors}
              className="grid w-full items-center gap-1.5"
            />
            <Field
              labelProps={{ children: "Password*" }}
              inputProps={{
                ...conform.input(fields.password, { type: "password" }),
                placeholder: "Create a password",
                autoComplete: "new-password",
              }}
              errors={fields.password.errors}
              className="grid w-full items-center gap-1.5"
            />
            <Field
              labelProps={{
                htmlFor: fields.confirmPassword.id,
                children: "Confirm Password*",
              }}
              inputProps={{
                ...conform.input(fields.confirmPassword, { type: "password" }),
                placeholder: "Confirm Password",
                autoComplete: "new-password",
              }}
              errors={fields.confirmPassword.errors}
            />
          </div>

          <div>
            <StatusButton
              type="submit"
              status={isPending ? "pending" : actionData?.status ?? "idle"}
              disabled={isPending}
              className="mt-8 w-full"
            >
              Get started
            </StatusButton>
            {/* TODO: show error message on toast */}
            {form.errorId && (
              <div className="mt-1.5 text-center">
                <ErrorMessage errors={form.errors} id={form.errorId} />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Already have an account?
            <Link
              to="/login"
              className="ml-1 text-gray-700 underline font-medium hover:text-gray-500"
            >
              Log in
            </Link>
          </p>
        </Form>
      </div>
    </main>
  );
}
