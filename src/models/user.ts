// MongoDB ODM
import { Document, model, Schema } from "mongoose"

import { Todo } from "./todo"

interface User {
  username: string
  password: string
  todos: Todo[]
}

interface UserDocument extends User, Document {}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    todos: [{ type: Schema.Types.ObjectId, ref: "Todo" }],
  },
  {
    timestamps: true,
    toObject: {
      // Call all getters
      getters: true,
      // Don't solve relations
      depopulate: true,
    },
  },
)

const userModel = model<UserDocument>("User", userSchema)

export { User, userSchema, userModel }
