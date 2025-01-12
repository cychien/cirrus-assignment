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
import { z } from "zod";
import { ErrorMessage, Field, TextareaField } from "~/components/Field";
import { StatusButton } from "~/components/StatusButton";
import { prisma } from "~/utils/db.server";
import { cn, invariantResponse, useIsPending } from "~/utils/misc";
import {
  IdSchema,
  ReviewContentSchema,
  ReviewTitleSchema,
} from "~/utils/validation";
import { Avatar } from "~/components/Avatar";
import { AutoComplete } from "~/components/AutoComplete";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "~/utils/query";
import { X } from "lucide-react";
import { requireUserId } from "~/utils/auth.server";
import { safeRedirect } from "remix-utils/safe-redirect";
import { format } from "date-fns";
import {
  requireUserWithPermission,
  requireUserWithRole,
} from "~/utils/permissions.server";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { validateCSRF } from "~/utils/csrf.server";

export const handle = {
  breadcrumb: {
    name: "Edit review",
    href: "",
  },
};

const ReviewSchema = z.object({
  id: IdSchema,
  title: ReviewTitleSchema,
  content: ReviewContentSchema,
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserWithRole(request, "admin");

  const review = await prisma.performanceReview.findUnique({
    where: { id: params.reviewId },
    select: {
      id: true,
      title: true,
      content: true,
      reviewee: {
        select: {
          id: true,
          name: true,
        },
      },
      assignments: {
        select: {
          assignedTo: { select: { id: true, name: true } },
          feedback: { select: { id: true, content: true, createdAt: true } },
        },
      },
    },
  });

  invariantResponse(review, "Not found", { status: 404 });

  return json({
    editingReview: review,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserWithPermission(request, "update:review");
  await requireUserId(request);
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);

  const assignedTo = (formData.getAll("assigned-to") ?? []) as string[];
  const submission = await parse(formData, {
    schema: ReviewSchema.transform(async (data) => {
      const review = await prisma.performanceReview.update({
        select: { id: true },
        where: { id: data.id },
        data: {
          title: data.title,
          content: data.content,
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

export default function EditReviewPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "edit-review-form",
    constraint: getFieldsetConstraint(ReviewSchema),
    lastSubmission: actionData?.submission,
    defaultValue: {
      id: data.editingReview.id,
      title: data.editingReview.title,
      content: data.editingReview.content,
    },
    onValidate({ formData }) {
      return parse(formData, { schema: ReviewSchema });
    },
  });

  const feedbacks = data.editingReview.assignments
    .filter((a) => !!a.feedback)
    .map((a) => ({
      id: a.feedback?.id,
      author: a.assignedTo.name,
      content: a.feedback?.content,
      createdAt: a.feedback?.createdAt,
    }));

  return (
    <>
      <div className="flex py-5 border-b border-gray-100 justify-between items-center">
        <h1 className="text-3xl font-semibold">
          Edit {`${data.editingReview.reviewee.name}'s`} Review
        </h1>
      </div>

      <div className="py-8">
        <div className="flex space-x-20">
          <Form method="POST" className="flex-1 max-w-md" {...form.props}>
            <AuthenticityTokenInput />
            <input type="hidden" {...conform.input(fields.id)} />
            <div className="space-y-6">
              <Field
                labelProps={{ children: "For*" }}
                inputProps={{
                  value: data.editingReview.reviewee.name,
                  readOnly: true,
                  className:
                    "read-only:bg-gray-50 read-only:cursor-not-allowed",
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
              <EmployeeAutoComplete
                defaultAssignedTo={data.editingReview.assignments.map(
                  (a) => a.assignedTo
                )}
                revieweeId={data.editingReview.reviewee.id}
              />
            </div>

            <div>
              <StatusButton
                type="submit"
                status={isPending ? "pending" : actionData?.status ?? "idle"}
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

          {feedbacks.length > 0 && (
            <div className="flex-1 max-w-xs space-y-2">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="text-sm border border-gray-200 shadow-sm p-3 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <Avatar name={feedback.author} size={28} />
                    <div className="text-gray-400 text-xs">
                      {format(feedback.createdAt ?? "", "yyyy/MM/dd")}
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700">{feedback.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

type AssignedTo = {
  id: string;
  name: string;
  readonly?: boolean;
};

function EmployeeAutoComplete({
  defaultAssignedTo,
  revieweeId,
}: {
  defaultAssignedTo: Array<{ id: string; name: string }>;
  revieweeId: string;
}) {
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [selectedValues, setSelectedValues] = React.useState<AssignedTo[]>(() =>
    defaultAssignedTo.map((a) => ({ id: a.id, name: a.name, readonly: true }))
  );

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
      ?.filter((d) => d.id !== revieweeId)
      ?.filter((d) => !selectedValues.find((s) => s.id === d.id))
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
            setSelectedValues((prev) => [
              ...prev,
              { id: v, name: employeeIdNameMap[v] },
            ]);
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
              key={s.id}
              className="p-1 rounded-full border border-gray-200 shadow-sm flex items-center"
            >
              <Avatar name={s.name} size={28} />
              <span
                className={cn("ml-1.5 text-[13px]", { "mr-2": s.readonly })}
              >
                {s.name}
              </span>
              {!s.readonly && (
                <>
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
                    value={s.id}
                    defaultChecked
                    className="sr-only"
                    readOnly
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
