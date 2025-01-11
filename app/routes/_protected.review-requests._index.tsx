import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import { buttonVariant } from "~/components/Button";
import { prisma } from "~/utils/db.server";
import { cn } from "~/utils/misc";
import { requireUserWithRole } from "~/utils/permissions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserWithRole(request, "employee");

  const reviewRequests = await prisma.performanceReview.findMany({
    select: {
      id: true,
      title: true,
      reviewee: {
        select: {
          id: true,
          name: true,
        },
      },
      assignments: {
        take: 1,
        select: {
          feedback: {
            select: {
              id: true,
              content: true,
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
      assignments: {
        some: {
          assignedTo: {
            id: userId,
          },
        },
      },
    },
  });

  return json({ reviewRequests });
}

export default function ReviewRequestPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex py-5 border-b border-gray-100 justify-between items-center">
        <h1 className="text-3xl font-semibold">Review requests</h1>
      </div>

      <div className="py-8">
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(min(300px,_100%),_1fr))] gap-3 grid-rows-[auto] mt-3">
          {data.reviewRequests.map((r) => (
            <div
              key={r.id}
              className="pretty-shadow rounded-md p-4 pt-5 pb-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex gap-3">
                <Avatar name={r.reviewee.name} size={32} />
                <div>
                  <div className="font-medium text-sm">{r.title}</div>
                  <div className="text-[13px] text-gray-500">
                    {r.reviewee.name}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <Link
                  to={`/review-requests/${r.id}`}
                  className={cn(
                    buttonVariant({ variant: "link", size: "xs" }),
                    r.assignments[0].feedback
                      ? "text-gray-400 hover:text-gray-900"
                      : "text-gray-900 hover:text-gray-900/60",
                    "group-hover:underline pl-1"
                  )}
                >
                  {r.assignments[0].feedback ? "View review" : "Write feedback"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
