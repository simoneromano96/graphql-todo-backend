export default {
  app: {
    port: process.env.APP_PORT ?? 3000,
    db: process.env.APP_DB ?? "mongodb://root:example@localhost",
  },
  cors: {
    origin: process.env.APP_CORS_ORIGIN ?? "*",
  },
}
