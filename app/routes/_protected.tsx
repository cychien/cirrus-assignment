import * as React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useMatches } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { cn } from "~/utils/misc";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/Breadcrumb";
import { z } from "zod";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  return null;
}

function SubHeader() {
  const location = useLocation();

  return (
    <NavigationMenu.Root className="border-t-2 border-b-2 border-gray-100 py-3">
      <NavigationMenu.List className="container mx-auto flex space-x-1">
        <NavigationMenu.Item>
          <NavigationMenu.Link
            href="/employees"
            className={cn(
              "font-medium px-3 py-2 hover:bg-gray-50 rounded-md text-gray-700 text-sm",
              {
                "bg-gray-50 text-gray-900":
                  location.pathname.startsWith("/employees"),
              }
            )}
          >
            Employees
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            href="/reviews"
            className={cn(
              "font-medium px-3 py-2 hover:bg-gray-50 rounded-md text-gray-700 text-sm",
              {
                "bg-gray-50 text-gray-900":
                  location.pathname.startsWith("/reviews"),
              }
            )}
          >
            Performance reviews
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

type BreadcrumbType = {
  name: string;
  href: string;
};

function AppBreadcrumb({ breadcrumbs }: { breadcrumbs: BreadcrumbType[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={breadcrumb.href}>
                  {breadcrumb.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const BreadcrumbHandleMatch = z.object({
  handle: z.object({
    breadcrumb: z.object({
      name: z.string(),
      href: z.string(),
    }),
  }),
});

export default function ProtectedPage() {
  const matches = useMatches();
  const breadcrumbs = matches
    .map((m) => {
      const result = BreadcrumbHandleMatch.safeParse(m);
      if (!result.success) return null;
      return result.data.handle.breadcrumb;
    })
    .filter((breadcrumb): breadcrumb is { name: string; href: string } =>
      Boolean(breadcrumb)
    );

  return (
    <>
      <SubHeader />
      <main className="container mx-auto pt-12">
        {breadcrumbs.length > 1 && <AppBreadcrumb breadcrumbs={breadcrumbs} />}
        <Outlet />
      </main>
    </>
  );
}
