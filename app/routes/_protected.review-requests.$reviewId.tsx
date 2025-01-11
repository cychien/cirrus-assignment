import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { ErrorMessage, TextareaField } from "~/components/Field";
import { StatusButton } from "~/components/StatusButton";
import { prisma } from "~/utils/db.server";
import { invariantResponse, useIsPending } from "~/utils/misc";
import { useUser } from "~/utils/user";
import { FeedbackContentSchema, IdSchema } from "~/utils/validation";
import { format } from "date-fns";
import { requireUserWithRole } from "~/utils/permissions.server";

export const handle = {
  breadcrumb: {
    name: "View review",
    href: "",
  },
};

const FeedbackSchema = z.object({
  assignmentId: IdSchema,
  content: FeedbackContentSchema,
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserWithRole(request, "employee");
  const review = await prisma.performanceReview.findUnique({
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
        take: 1,
        select: {
          id: true,
          feedback: {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },
        },
        where: {
          assignedTo: {
            id: userId,
          },
        },
      },
    },
    where: {
      id: params.reviewId,
      assignments: {
        some: {
          assignedTo: {
            id: userId,
          },
        },
      },
    },
  });

  invariantResponse(review, "Not found", { status: 404 });

  return json({
    viewingReview: review,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserWithRole(request, "employee");
  const formData = await request.formData();

  const submission = await parse(formData, {
    schema: FeedbackSchema.transform(async (data) => {
      const feedback = await prisma.feedback.create({
        select: { id: true },
        data: {
          content: data.content,
          assignment: {
            connect: {
              id: data.assignmentId,
            },
          },
        },
      });

      return { ...data, feedback };
    }),
    async: true,
  });

  if (!submission.value?.feedback) {
    return json({ status: "error", submission } as const, {
      status: 400,
    });
  }

  return json({ status: "success", submission } as const);
}

export default function ViewReviewPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "feedback-form",
    constraint: getFieldsetConstraint(FeedbackSchema),
    defaultValue: {
      assignmentId: data.viewingReview.assignments[0].id,
    },
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: FeedbackSchema });
    },
  });

  return (
    <>
      <div className="flex py-5 border-b border-gray-100 justify-between items-center">
        <h1 className="text-3xl font-semibold">{data.viewingReview.title}</h1>
      </div>

      <div className="py-8">
        <div className="flex space-x-20">
          <p className="flex-1 max-w-md">{data.viewingReview.content}</p>

          {data.viewingReview.assignments[0].feedback ? (
            <div className="flex-1 max-w-xs">
              <div className="text-sm border border-gray-200 shadow-sm p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <Avatar name={user.name} size={28} />
                  <div className="text-gray-400 text-xs">
                    {format(
                      data.viewingReview.assignments[0].feedback.createdAt,
                      "yyyy/MM/dd"
                    )}
                  </div>
                </div>
                <p className="mt-3 text-gray-700">
                  {data.viewingReview.assignments[0].feedback.content}
                </p>
              </div>
            </div>
          ) : (
            <Form method="POST" className="flex-1 max-w-xs" {...form.props}>
              <input type="hidden" {...conform.input(fields.assignmentId)} />
              <TextareaField
                labelProps={{ children: "Feedback" }}
                textareaProps={{
                  ...conform.textarea(fields.content),
                  placeholder: "Write some feedback",
                  autoFocus: true,
                  className: "min-h-[150px]",
                }}
                errors={fields.content.errors}
                className="grid w-full items-center gap-2"
              />

              <div>
                <StatusButton
                  type="submit"
                  status={isPending ? "pending" : actionData?.status ?? "idle"}
                  disabled={isPending}
                  className="mt-4"
                >
                  Submit
                </StatusButton>
                {form.errorId && (
                  <div className="mt-1.5 text-center">
                    <ErrorMessage errors={form.errors} id={form.errorId} />
                  </div>
                )}
              </div>
            </Form>
          )}
        </div>
      </div>
    </>
  );
}
