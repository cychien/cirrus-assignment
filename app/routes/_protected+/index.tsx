import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getUserWithRolesAndPermissions } from "~/utils/permissions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserWithRolesAndPermissions(request);

  if (user?.roles.some((r) => r.name === "admin")) {
    return redirect("/employees");
  }

  return redirect("/review-requests");
}
