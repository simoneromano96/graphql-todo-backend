import Fastify from "fastify"
import cors from "fastify-cors"
import mongoose from "mongoose"
import mercurius from "mercurius"

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

  app.register(cors, {
    origin: config.cors.origin,
  })

  app.register(mercurius, {
    schema,
    subscription: true,
    graphiql: "playground",
    prefix: config.app.apiPrefix,
  })

  await app.listen(config.app.port, "0.0.0.0")
}

main()
