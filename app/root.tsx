import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./tailwind.css";
import { getClientEnv } from "./utils/env.server";
import { Header } from "./components/Header";
import { sessionStorage } from "./utils/session.server";
import { prisma } from "./utils/db.server";
import { TooltipProvider } from "./components/Tooltip";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const userId = cookieSession.get("userId");
  const user = userId
    ? await prisma.user.findUnique({
        select: {
          id: true,
          name: true,
          roles: {
            select: {
              name: true,
              permissions: {
                select: {
                  entity: true,
                  action: true,
                  access: true,
                },
              },
            },
          },
        },
        where: { id: userId },
      })
    : null;

  return json({
    user,
    ENV: getClientEnv(),
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
