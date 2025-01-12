import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { ErrorMessage, Field } from "~/components/Field";
import { StatusButton } from "~/components/StatusButton";
import { validateCSRF } from "~/utils/csrf.server";
import { prisma } from "~/utils/db.server";
import { invariantResponse, useIsPending } from "~/utils/misc";
import {
  requireUserWithPermission,
  requireUserWithRole,
} from "~/utils/permissions.server";
import { EmailSchema, IdSchema, NameSchema } from "~/utils/validation";

export const handle = {
  breadcrumb: {
    name: "Edit employee",
    href: "",
  },
};

const deleteEmployeeIntent = "delete-employee";
const editEmployeeIntent = "edit-employee";

const EmployeeSchema = z.object({
  intent: z.literal(editEmployeeIntent),
  id: IdSchema.optional(),
  email: EmailSchema,
  name: NameSchema,
});

const DeleteEmployeeSchema = z.object({
  intent: z.literal(deleteEmployeeIntent),
  id: z.string(),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserWithRole(request, "admin");

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  invariantResponse(user, "Not found", { status: 404 });

  return json({
    editingUser: user,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);
  const intent = formData.get("intent");
  switch (intent) {
    case editEmployeeIntent: {
      await requireUserWithPermission(request, "update:user");
      return employeeUpdateAction({ formData });
    }
    case deleteEmployeeIntent: {
      await requireUserWithPermission(request, "delete:user");
      return deleteEmployeeAction({ formData });
    }
    default: {
      throw new Response(`Invalid intent "${intent}"`, { status: 400 });
    }
  }
}

export default function EditEmployeePage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();
  const navigation = useNavigation();

  const [form, fields] = useForm({
    id: "edit-employee-form",
    constraint: getFieldsetConstraint(EmployeeSchema),
    lastSubmission: actionData?.submission,
    defaultValue: {
      email: data.editingUser.email,
      name: data.editingUser.name,
    },
    onValidate({ formData }) {
      return parse(formData, { schema: EmployeeSchema });
    },
  });

  const [deleteForm] = useForm({
    id: "delete-employee-form",
    lastSubmission: actionData?.submission,
    constraint: getFieldsetConstraint(DeleteEmployeeSchema),
    onValidate({ formData }) {
      return parse(formData, { schema: DeleteEmployeeSchema });
    },
  });

  return (
    <>
      <div className="flex py-5 border-b border-gray-100 justify-between items-center">
        <h1 className="text-3xl font-semibold">Edit {data.editingUser.name}</h1>
        <Form method="post" className="flex items-center" {...deleteForm.props}>
          <AuthenticityTokenInput />
          <input type="hidden" name="id" value={data.editingUser.id} />
          <StatusButton
            type="submit"
            name="intent"
            value={deleteEmployeeIntent}
            status={
              navigation.formData?.get("intent") === deleteEmployeeIntent
                ? isPending
                  ? "pending"
                  : actionData?.status ?? "idle"
                : "idle"
            }
            disabled={isPending}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:enabled:bg-red-100/50 hover:enabled:text-red-500"
          >
            Delete employee
          </StatusButton>
          {deleteForm.errorId && (
            <div className="mt-1.5 text-center">
              <ErrorMessage
                errors={deleteForm.errors}
                id={deleteForm.errorId}
              />
            </div>
          )}
        </Form>
      </div>

      <div className="py-8">
        <Form method="POST" className="max-w-md" {...form.props}>
          <AuthenticityTokenInput />
          <input type="hidden" name="id" value={data.editingUser.id} />
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
          </div>

          <div>
            <StatusButton
              type="submit"
              name="intent"
              value={editEmployeeIntent}
              status={
                navigation.formData?.get("intent") === editEmployeeIntent
                  ? isPending
                    ? "pending"
                    : actionData?.status ?? "idle"
                  : "idle"
              }
              disabled={isPending}
              className="mt-8"
            >
              Update
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

async function employeeUpdateAction({ formData }: { formData: FormData }) {
  const submission = await parse(formData, {
    schema: EmployeeSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email, id: { not: data.id } },
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
      const user = await prisma.user.update({
        select: { id: true },
        where: { id: data.id },
        data: {
          email: data.email,
          name: data.name,
        },
      });
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

async function deleteEmployeeAction({ formData }: { formData: FormData }) {
  const submission = await parse(formData, {
    schema: DeleteEmployeeSchema.transform(async (data) => {
      const deletedUser = await prisma.user.delete({
        where: { id: data.id },
      });
      return { ...data, deletedUser };
    }),
    async: true,
  });

  if (!submission.value?.deletedUser) {
    return json({ status: "error", submission } as const, {
      status: 400,
    });
  }

  return redirect(safeRedirect("/employees"));
}
