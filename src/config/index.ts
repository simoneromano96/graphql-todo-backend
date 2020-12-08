import { argon2id } from "argon2"

export default {
  app: {
    port: process.env.APP_PORT ?? 3000,
    db: process.env.APP_DB ?? "mongodb://root:example@localhost",
    apiPrefix: process.env.APP_API_PREFIX,
    session: {
      secret: process.env.APP_SESSION_SECRET ?? "CNLxr58XzCaZuodxfZxQsOCRxTRrCki5",
    },
  },
  cors: {
    origin: process.env.APP_CORS_ORIGIN ?? "*",
  },
  hash: {
    type: argon2id,
  },
}
