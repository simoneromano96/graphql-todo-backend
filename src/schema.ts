import { makeSchema } from "nexus"
import { join } from "path"

import { TodoMutation, TodoQuery, TodoSubscription } from "./graphql/todo"
import { AuthMutation, AuthQuery } from "./graphql/auth"

import { GQLDateTime } from "./typings/dateTime"

export const schema = makeSchema({
  types: [GQLDateTime, TodoQuery, TodoMutation, TodoSubscription, AuthQuery, AuthMutation],
  outputs: {
    typegen: join(__dirname, "generated", "typegen.ts"),
    schema: join(__dirname, "generated", "schema.graphql"),
  },
})
