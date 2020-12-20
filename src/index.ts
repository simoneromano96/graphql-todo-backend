import Fastify from "fastify"
// Security
import cors from "fastify-cors"
import helmet from "fastify-helmet"
// Session
import cookie from "fastify-cookie"
import session from "fastify-session"
// Redis
import RedisClient from "ioredis"
import connectRedis from "connect-redis"

import mercurius from "mercurius"
import mongoose from "mongoose"

import { schema } from "./schema"
import config from "./config"

const main = async () => {
  // Create a new redis client
  const redisClient = new RedisClient({
    host: config.app.redis.host,
    port: config.app.redis.port,
  })
  const RedisStore = connectRedis(session as any)

  // DEBUG mode, this will show the queries to the db
  mongoose.set("debug", true)

  await mongoose.connect(config.app.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })

  const app = Fastify()

  app.register(helmet)

  app.register(cors, {
    origin: config.app.cors.origin,
    credentials: true,
  })

  app.register(cookie)
  app.register(session, {
    secret: config.app.session.secret,
    store: new RedisStore({
      // host: config.app.redis.host,
      // port: config.app.redis.port,
      client: redisClient,
      ttl: 600,
    }),
    cookieName: "sesId",
    cookie: {
      secure: config.app.cookie.secure,
      httpOnly: config.app.cookie.httpOnly,
      domain: config.app.cookie.domain,
    },
  })

  app.register(mercurius, {
    schema,
    subscription: true,
    graphiql: "playground",
    prefix: config.app.apiPrefix,
    // Expose request and reply objects in context
    context: (request, reply) => ({ request, reply }),
  })

  await app.listen(config.app.port, "0.0.0.0")
}

main()
