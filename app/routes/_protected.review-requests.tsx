import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: {
    name: "Review requests",
    href: "/review-requests",
  },
};

export default function ReviewRequestsPage() {
  return <Outlet />;
}
