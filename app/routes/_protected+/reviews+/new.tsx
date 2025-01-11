import * as React from "react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { AutoComplete } from "~/components/AutoComplete";
import { ErrorMessage, Field, TextareaField } from "~/components/Field";
import { StatusButton } from "~/components/StatusButton";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { invariantResponse, useIsPending } from "~/utils/misc";
import {
  IdSchema,
  ReviewContentSchema,
  ReviewTitleSchema,
} from "~/utils/validation";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "~/utils/query";
import { Avatar } from "~/components/Avatar";
import { X } from "lucide-react";
import {
  requireUserWithPermission,
  requireUserWithRole,
} from "~/utils/permissions.server";

export const handle = {
  breadcrumb: {
    name: "Add review",
    href: "/reviews/new",
  },
};

const NewReviewSchema = z.object({
  title: ReviewTitleSchema,
  content: ReviewContentSchema,
  for: IdSchema,
});

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserWithRole(request, "admin");

  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employeeId");

  invariantResponse(!!employeeId, "Not found", { status: 404 });

  const user = await prisma.user.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  invariantResponse(user, "Not found", { status: 404 });

  return json({ revieweeId: user.id, revieweeName: user.name });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserWithPermission(request, "create:review");

  const userId = await requireUserId(request);
  const formData = await request.formData();
  const assignedTo = (formData.getAll("assigned-to") ?? []) as string[];

  const submission = await parse(formData, {
    schema: NewReviewSchema.superRefine(async (data, ctx) => {
      const existingReview = await prisma.performanceReview.findUnique({
        where: { revieweeId: data.for },
        select: { id: true },
      });
      if (existingReview) {
        ctx.addIssue({
          path: ["form"],
          code: z.ZodIssueCode.custom,
          message: "A user has already been reviewed",
        });
        return;
      }
    }).transform(async (data) => {
      const review = await prisma.performanceReview.create({
        select: { id: true },
        data: {
          title: data.title,
          content: data.content,
          revieweeId: data.for,
          reviewerId: userId,
          assignments: {
            create: assignedTo.map((id) => ({
              assignedTo: {
                connect: {
                  id: id,
                },
              },
            })),
          },
        },
      });

      return { ...data, review };
    }),
    async: true,
  });

  if (!submission.value?.review) {
    return json({ status: "error", submission } as const, {
      status: 400,
    });
  }

  return redirect(safeRedirect("/reviews"));
}

export default function NewReviewPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "new-review-form",
    constraint: getFieldsetConstraint(NewReviewSchema),
    lastSubmission: actionData?.submission,
    defaultValue: {
      for: loaderData.revieweeId,
      title: `Review for ${loaderData.revieweeName}`,
    },
    onValidate({ formData }) {
      return parse(formData, { schema: NewReviewSchema });
    },
  });

  return (
    <>
      <div className="flex py-5 border-b border-gray-100 justify-between items-center">
        <h1 className="text-3xl font-semibold">Add Review</h1>
      </div>

      <div className="py-8">
        <Form method="POST" className="max-w-md" {...form.props}>
          <input type="hidden" {...conform.input(fields.for)} />
          <div className="space-y-6">
            <Field
              labelProps={{ children: "For*" }}
              inputProps={{
                value: loaderData.revieweeName,
                readOnly: true,
                className: "read-only:bg-gray-50 read-only:cursor-not-allowed",
              }}
              className="grid w-full items-center gap-1.5"
            />
            <Field
              labelProps={{ children: "Title*" }}
              inputProps={{
                ...conform.input(fields.title),
                placeholder: "Enter review title",
                autoFocus: true,
              }}
              errors={fields.title.errors}
              className="grid w-full items-center gap-1.5"
            />
            <TextareaField
              labelProps={{ children: "Content*" }}
              textareaProps={{
                ...conform.textarea(fields.content),
                placeholder: "Enter review content",
                className: "min-h-[200px]",
              }}
              errors={fields.content.errors}
              className="grid w-full items-center gap-1.5"
            />
            <EmployeeAutoComplete />
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

function EmployeeAutoComplete() {
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["employees", searchValue],
    queryFn: () => getEmployees({ q: searchValue }),
  });

  const employeeIdNameMap: Record<string, string> = {};
  if (data) {
    for (const d of data) {
      employeeIdNameMap[d.id] = d.name;
    }
  }

  const options =
    data
      ?.filter((d) => !selectedValues.includes(d.id))
      .map((d) => ({
        label: d.name,
        value: d.id,
      })) ?? [];

  return (
    <div className="text-sm">
      <div className="font-medium">Feedback requests</div>
      <div className="mt-1.5">
        <AutoComplete
          onSelectedValueChange={(v) => {
            setSelectedValues((prev) => [...prev, v]);
          }}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          items={options}
          isLoading={isLoading}
          emptyMessage="No employees found."
          placeholder="Search employees..."
        />
      </div>
      {selectedValues.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {selectedValues.map((s) => (
            <div
              key={s}
              className="p-1 rounded-full border border-gray-200 shadow-sm flex items-center"
            >
              <Avatar name={employeeIdNameMap[s]} size={28} />
              <span className="ml-1.5 text-[13px]">{employeeIdNameMap[s]}</span>
              <button
                type="button"
                className="bg-gray-100 text-gray-400 p-1.5 rounded-full ml-1.5 transition-colors hover:bg-gray-200 hover:text-gray-900"
                onClick={() => {
                  setSelectedValues((prev) => prev.filter((p) => p !== s));
                }}
              >
                <X className="size-3" strokeWidth={3} />
              </button>
              <input
                type="checkbox"
                name="assigned-to"
                value={s}
                defaultChecked
                className="sr-only"
                readOnly
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
