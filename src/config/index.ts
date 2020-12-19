import { argon2id } from "argon2"

export default {
  app: {
    port: process.env.APP_PORT ?? 3000,
    db: process.env.APP_DB ?? "mongodb://root:example@localhost",
    apiPrefix: process.env.APP_API_PREFIX,
    session: {
      secret: process.env.APP_SESSION_SECRET ?? "CNLxr58XzCaZuodxfZxQsOCRxTRrCki5",
    },
    cookie: {
      domain: process.env.APP_SESSION_DOMAIN ?? "localhost",
      secure: process.env.APP_SESSION_SECURE === "true",
      httpOnly: process.env.APP_SESSION_HTTP_ONLY === "true",
    },
    redis: {
      host: process.env.APP_REDIS_HOST ?? "localhost",
      port: parseInt(process.env.APP_REDIS_PORT ?? "6379", 10),
    },
    cors: {
      origin: process.env.APP_CORS_ORIGIN ?? "*",
    },
    hash: {
      type: argon2id,
    },
  },
}
