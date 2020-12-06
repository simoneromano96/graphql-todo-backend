import Fastify from "fastify"
import cors from "fastify-cors"
// SESSION
import fastifyCookie from "fastify-cookie"
import fastifySession from "fastify-session"
import connectRedis from "connect-redis"
import redis from "redis"

import mercurius from "mercurius"
import mongoose from "mongoose"

import { schema } from "./schema"
import config from "./config"

const redisClient = redis.createClient()

const RedisStore = connectRedis(fastifySession as any)

const main = async () => {
  // DEBUG mode, this will show the queries to the db
  mongoose.set("debug", true)

  await mongoose.connect(config.app.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })

  const app = Fastify()

  app.register(cors, {
    origin: config.cors.origin,
  })

  app.register(fastifyCookie)
  app.register(fastifySession, {
    secret: config.app.session.secret,
    store: new RedisStore({
      host: "localhost",
      port: 6379,
      client: redisClient,
      ttl: 600,
    }),
    cookieName: "sesId",
    cookie: {
      secure: false,
      httpOnly: false,
      domain: "localhost",
      path: "/",
    },
  })

  app.register(mercurius, {
    schema,
    subscription: true,
    graphiql: "playground",
    prefix: config.app.apiPrefix,
  })

  // Login route
  app.post("/login", (request, reply) => {
    const { email, password } = request.body as any

    if (password === "password") {
      request.session.authenticated = true
      reply.send({ authenticated: true })
    } else {
      reply.send({ error: true, message: "Wrong password, try password" })
    }
  })

  // Get session route
  app.get("/session", (request, reply) => {
    reply.send({ ...request.session })
  })

  // Logout route
  app.get("/logout", (request, reply) => {
    if (request.session.authenticated) {
      request.destroySession((err) => {
        if (err) {
          reply.status(500)
          reply.send("Internal Server Error")
        } else {
          reply.send({ message: "Logged out" })
        }
      })
    } else {
      reply.send({ error: true, message: "You're not logged in" })
    }
  })

  await app.listen(config.app.port, "0.0.0.0")
}

main()
