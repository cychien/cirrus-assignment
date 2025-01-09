import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  SESSION_SECRET: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    throw new Error("Invalid environment variables");
  }
}

export function getClientEnv() {
  return {};
}

type ENV = ReturnType<typeof getClientEnv>;

declare global {
  interface Window {
    ENV: ENV;
  }
}
