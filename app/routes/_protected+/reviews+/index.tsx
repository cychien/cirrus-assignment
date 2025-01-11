import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";
import { Check, CircleDashed } from "lucide-react";
import { Avatar } from "~/components/Avatar";
import { Badge } from "~/components/Badge";
import { buttonVariant } from "~/components/Button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/Table";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { prisma } from "~/utils/db.server";
import { cn } from "~/utils/misc";
import { requireUserWithRole } from "~/utils/permissions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserWithRole(request, "admin");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      receivedReview: {
        select: {
          id: true,
          title: true,
          assignments: {
            select: {
              assignedTo: { select: { id: true, name: true } },
              feedback: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return json({ users });
}

export default function ReviewsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex pb-5 border-b border-gray-100 justify-between items-center">
        <h1 className="text-3xl font-semibold">Performance reviews</h1>
      </div>

      <div className="py-8">
        <Table>
          <TableCaption className="sr-only">
            A list of performance reviews.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>For</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Feedback Requests</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.receivedReview?.title ?? `Review for ${user.name}`}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  {user.receivedReview ? (
                    user.receivedReview.assignments.every(
                      (a) => !!a.feedback
                    ) ? (
                      <Badge variant="outline">
                        <Check className="flex-none w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <CircleDashed className="flex-none w-3 h-3 mr-1" />
                        Await Feedback
                      </Badge>
                    )
                  ) : (
                    <div className="text-gray-400 font-medium text-xs">
                      Incomplete
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {user.receivedReview?.assignments.map((a) => (
                      <Tooltip key={a.assignedTo.id}>
                        <TooltipTrigger>
                          <div className="relative">
                            <div className="rounded-full h-7 w-7 overflow-hidden">
                              <Avatar name={a.assignedTo.name} size={28} />
                            </div>
                            {a.feedback && (
                              <div className="absolute -right-0.5 -bottom-0.5 rounded-full bg-gray-900 p-[3px] ring-1 ring-white">
                                <Check
                                  strokeWidth={4}
                                  className="h-2 w-2 text-white"
                                />
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{a.assignedTo.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {user.receivedReview ? (
                    <Link
                      to={`/reviews/${user.receivedReview.id}`}
                      className={cn(
                        buttonVariant({ variant: "link", size: "xs" }),
                        "text-gray-400 hover:underline hover:text-gray-900"
                      )}
                    >
                      Edit
                    </Link>
                  ) : (
                    <Link
                      to={`/reviews/new?employeeId=${user.id}`}
                      className={cn(
                        buttonVariant({ size: "xs" }),
                        "hover:bg-gray-900/80"
                      )}
                    >
                      Add
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
