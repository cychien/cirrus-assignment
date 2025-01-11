import { json, LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const query = new URL(request.url).searchParams.get("q") ?? "";

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    where: {
      name: {
        startsWith: `%${query}%`,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return json(users);
}
