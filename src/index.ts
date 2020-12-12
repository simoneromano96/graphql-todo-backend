import Fastify from "fastify"
// Security
import cors from "fastify-cors"
import helmet from "fastify-helmet"

import mercurius from "mercurius"
import mongoose from "mongoose"

import { schema } from "./schema"
import config from "./config"

const main = async () => {
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
