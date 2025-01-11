import { json } from "@remix-run/react";
import { requireUserId } from "./auth.server";
import { prisma } from "./db.server";
import { parsePermissionString, PermissionString } from "./permissions";
import { sessionStorage } from "./session.server";

export async function requireUserWithPermission(
  request: Request,
  permission: PermissionString
) {
  const userId = await requireUserId(request);
  const permissionData = parsePermissionString(permission);
  const user = await prisma.user.findFirst({
    select: { id: true },
    where: {
      id: userId,
      roles: {
        some: {
          permissions: {
            some: {
              ...permissionData,
              access: permissionData.access
                ? { in: permissionData.access }
                : undefined,
            },
          },
        },
      },
    },
  });
  if (!user) {
    throw json(
      {
        error: "Unauthorized",
        requiredPermission: permissionData,
        message: `Unauthorized: required permissions: ${permission}`,
      },
      { status: 403 }
    );
  }
  return user.id;
}

export async function requireUserWithRole(request: Request, name: string) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findFirst({
    select: { id: true },
    where: { id: userId, roles: { some: { name } } },
  });
  if (!user) {
    throw json(
      {
        error: "Unauthorized",
        requiredRole: name,
        message: `Unauthorized: required role: ${name}`,
      },
      { status: 403 }
    );
  }
  return user.id;
}

export async function getUserWithRolesAndPermissions(request: Request) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const userId = cookieSession.get("userId");
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    select: {
      id: true,
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
  });
  return user;
}
