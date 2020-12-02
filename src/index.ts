import Fastify from "fastify"
import cors from "fastify-cors"
import mongoose from "mongoose"
import mercurius from "mercurius"

import { schema } from "./schema"
import config from "./config"

const main = async () => {
  // DEBUG mode, this will show the queries to the db
  mongoose.set("debug", true)

  console.log("Config")
  console.log({ ...config })

  console.log("Mongo init")

  await mongoose.connect(config.app.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })

  console.log("Mongo initialised")

  const app = Fastify()

  app.register(cors, {
    origin: config.cors.origin,
  })

  console.log("CORS initialised")

  app.register(mercurius, {
    schema,
    subscription: true,
    // graphiql: "playground",
    // path: "/graphql",
    // prefix: config.app.apiPrefix,
  })

  console.log("API initialised")

  await app.listen(config.app.port, "0.0.0.0")
}

main()
