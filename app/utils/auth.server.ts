import { type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "./db.server";
import { combineResponseInits } from "./misc";
import { safeRedirect } from "remix-utils/safe-redirect";
import { redirect } from "@remix-run/react";
import { sessionStorage } from "./session.server";

async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

async function getUserId(request: Request) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const userId = cookieSession.get("userId");
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { id: userId },
  });
  if (!user) {
    throw await logout({ request });
  }
  return user.id;
}

async function verifyUserPassword(
  where: Pick<User, "email"> | Pick<User, "id">,
  password: string
) {
  const userWithPassword = await prisma.user.findUnique({
    where,
    select: { id: true, password: true },
  });

  if (!userWithPassword) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password);

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id };
}

export async function signup({
  email,
  name,
  password,
}: {
  email: User["email"];
  name: User["name"];
  password: string;
}) {
  const hashedPassword = await getPasswordHash(password);

  const user = await prisma.user.create({
    select: { id: true },
    data: {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      roles: { connect: { name: "employee" } },
    },
  });

  return user;
}

export async function login({
  email,
  password,
}: {
  email: User["email"];
  password: string;
}) {
  return verifyUserPassword({ email }, password);
}

export async function logout(
  {
    request,
  }: {
    request: Request;
  },
  responseInit?: ResponseInit
) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  throw redirect(
    safeRedirect("/login"),
    combineResponseInits(responseInit, {
      headers: {
        "set-cookie": await sessionStorage.destroySession(cookieSession),
      },
    })
  );
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
}

export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}
