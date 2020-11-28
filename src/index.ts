import Fastify from "fastify"
import mongoose from "mongoose"
import mercurius from "mercurius"

import { schema } from "./schema"

const main = async () => {
  // DEBUG mode, this will show the queries to the db
  mongoose.set("debug", true)

  await mongoose.connect("mongodb://root:example@localhost", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })

  const app = Fastify()

  app.register(mercurius, {
    schema,
    subscription: true,
    graphiql: "playground",
  })

  await app.listen(3000, "0.0.0.0")
}

main()
