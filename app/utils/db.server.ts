import { PrismaClient } from "@prisma/client";
import { singleton } from "./misc";

const prisma = singleton("prisma", () => {
  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "info", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });

  client.$on("query", async (e) => {
    console.info(`prisma:query - ${e.duration}ms - ${e.query}`);
  });

  client.$connect();

  return client;
});

export { prisma };
