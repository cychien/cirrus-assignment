import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: {
    name: "Employees",
    href: "/employees",
  },
};

export default function EmployeesPage() {
  return <Outlet />;
}
