import { json, LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/utils/db.server";
import { requireUserWithRole } from "~/utils/permissions.server";

/**
  endpoint: /apis/employees
  
 Error Response
    Status Code: 403 Forbidden
    Body: {
      "error": "Unauthorized",
      "message": "Unauthorized: required role: {name}"
    }
 
 Success Response
    Status Code: 200
    Body: {
      "users": [
        {
          "id": "string",
          "email": "string",
          "name": "string"
        }
      ]
    }
 * 
 */

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserWithRole(request, "admin");

  const query = new URL(request.url).searchParams.get("q") ?? "";

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    where: {
      name: {
        startsWith: `%${query}%`,
      },
      roles: { some: { name: "employee" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return json(users);
}
