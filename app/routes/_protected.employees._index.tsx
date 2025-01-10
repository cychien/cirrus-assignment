import type { MetaFunction } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";
import { Pencil, Plus } from "lucide-react";
import { buttonVariant } from "~/components/Button";
import { prisma } from "~/utils/db.server";
import { cn } from "~/utils/misc";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  return json({ users });
}

export default function EmployeesPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex py-5 border-b border-gray-100 justify-between items-center">
        <h1 className="text-3xl font-semibold">Employees</h1>
        <Link
          to="/employees/new"
          className={cn(buttonVariant({ size: "sm" }), "hover:bg-gray-900/80")}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add employee
        </Link>
      </div>

      <div className="py-8">
        <p className="text-gray-500 text-sm">
          Sort by creation time (old first)
        </p>

        <div className="grid grid-cols-[repeat(auto-fill,_minmax(min(300px,_100%),_1fr))] gap-3 grid-rows-[auto] mt-3">
          {data.users.map((user) => (
            <div
              key={user.id}
              className="pretty-shadow rounded p-4 relative group hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-gray-500 mt-1">{user.email}</div>
              <Link
                to={`/employees/${user.id}`}
                className="p-2 bg-gray-200/70 rounded-full absolute top-2 right-2 hidden group-hover:inline-block hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
