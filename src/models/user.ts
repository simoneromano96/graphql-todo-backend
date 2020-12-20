import { Schema, model, Document } from "mongoose"
import { TodoDocument, todoModel } from "./todo"

interface User {
  username: string
  password: string
  todos: TodoDocument[]
}

interface UserDocument extends User, Document {}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      validate: (value: string) => value.length > 0,
    },
    password: {
      type: String,
      required: true,
    },
    todos: [
      {
        type: Schema.Types.ObjectId,
        ref: todoModel,
      },
    ],
  },
  { timestamps: true },
)

const userModel = model<UserDocument>("user", userSchema)

export { User, UserDocument, userModel }
