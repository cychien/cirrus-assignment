import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./tailwind.css";
import { getClientEnv } from "./utils/env.server";
import { Header } from "./components/Header";
import { sessionStorage } from "./utils/session.server";
import { prisma } from "./utils/db.server";
import { TooltipProvider } from "./components/Tooltip";
import { GeneralErrorBoundary } from "./components/ErrorBoundry";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { honeypot } from "./utils/honeypot.server";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { csrf } from "./utils/csrf.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Eureka Internal System" },
    { name: "description", content: `Welcome to Eureka` },
  ];
};

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
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request);
  const honeyProps = await honeypot.getInputProps();
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

  return json(
    {
      user,
      honeyProps,
      csrfToken,
      ENV: getClientEnv(),
    },
    {
      headers: csrfCookieHeader ? { "set-cookie": csrfCookieHeader } : {},
    }
  );
}

function Document({
  children,
  env,
}: {
  children: React.ReactNode;
  env?: Record<string, string>;
}) {
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
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const queryClient = new QueryClient();

function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <Document env={data.ENV}>
      <Header />
      <Outlet />
    </Document>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <QueryClientProvider client={queryClient}>
      <HoneypotProvider {...data.honeyProps}>
        <AuthenticityTokenProvider token={data.csrfToken}>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </AuthenticityTokenProvider>
      </HoneypotProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
