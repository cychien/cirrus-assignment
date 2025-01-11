import { LoaderFunctionArgs } from "@remix-run/node";
import { requireAnonymous } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname === "/logout") {
    return null;
  }

  await requireAnonymous(request);
  return null;
}
