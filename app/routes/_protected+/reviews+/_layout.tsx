import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: {
    name: "Performance reviews",
    href: "/reviews",
  },
};

export default function ReviewsPage() {
  return <Outlet />;
}
