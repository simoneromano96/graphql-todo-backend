import Fastify from "fastify"
import cors from "fastify-cors"
// SESSION
import fastifyCookie from "fastify-cookie"
import fastifySession from "fastify-session"
import connectRedis from "connect-redis"
import Redis from "ioredis"

import mercurius from "mercurius"
import mongoose from "mongoose"

import { schema } from "./schema"
import config from "./config"

const main = async () => {
  // Init redis
  const RedisClient = new Redis()
  const RedisStore = connectRedis(fastifySession as any)

  // DEBUG mode, this will show the queries to the db
  mongoose.set("debug", true)

  await mongoose.connect(config.app.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })

  const app = Fastify()

  app.register(cors, {
    origin: config.app.cors.origin,
  })

  app.register(fastifyCookie)
  app.register(fastifySession, {
    secret: config.app.session.secret,
    store: new RedisStore({
      host: config.app.redis.host,
      port: config.app.redis.port,
      client: RedisClient,
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
