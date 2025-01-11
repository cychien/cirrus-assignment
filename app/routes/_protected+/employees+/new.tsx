import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, json, redirect, useActionData } from "@remix-run/react";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { ErrorMessage, Field } from "~/components/Field";
import { StatusButton } from "~/components/StatusButton";
import { signup } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { useIsPending } from "~/utils/misc";
import { requireUserWithPermission } from "~/utils/permissions.server";
import { EmailSchema, NameSchema, PasswordSchema } from "~/utils/validation";

export const handle = {
  breadcrumb: {
    name: "Add employee",
    href: "/employees/new",
  },
};

const NewEmployeeSchema = z.object({
  email: EmailSchema,
  name: NameSchema,
  password: PasswordSchema,
});

export async function action({ request }: ActionFunctionArgs) {
  await requireUserWithPermission(request, "create:user");

  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: NewEmployeeSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "A user already exists with this email",
        });
        return;
      }
    }).transform(async (data) => {
      const user = await signup(data);
      return { ...data, user };
    }),
    async: true,
  });

  if (!submission.value?.user) {
    return json({ status: "error", submission } as const, {
      status: 400,
    });
  }

  return redirect(safeRedirect("/employees"));
}

export default function NewEmployeePage() {
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "new-employee-form",
    constraint: getFieldsetConstraint(NewEmployeeSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: NewEmployeeSchema });
    },
  });

  return (
    <>
      <div className="flex py-5 border-b border-gray-100 justify-between items-center">
        <h1 className="text-3xl font-semibold">Add Employee</h1>
      </div>

      <div className="py-8">
        <Form method="POST" className="max-w-md" {...form.props}>
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
          </div>

          <div>
            <StatusButton
              type="submit"
              status={isPending ? "pending" : actionData?.status ?? "idle"}
              disabled={isPending}
              className="mt-8"
            >
              Add
            </StatusButton>
            {form.errorId && (
              <div className="mt-1.5 text-center">
                <ErrorMessage errors={form.errors} id={form.errorId} />
              </div>
            )}
          </div>
        </Form>
      </div>
    </>
  );
}
