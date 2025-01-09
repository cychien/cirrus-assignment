import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  return null;
}

export default function Index() {
  return null;
}
