import { Schema, model, Document } from "mongoose"

interface User {
  username: string
  password: string
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
  },
  { timestamps: true },
)

const userModel = model<UserDocument>("user", userSchema)

export { User, UserDocument, userModel }
