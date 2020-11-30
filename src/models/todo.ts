import { Schema, model, Document } from "mongoose"

interface Todo {
  description: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

interface TodoDocument extends Todo, Document {}

const todoSchema = new Schema(
  {
    description: String,
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const todoModel = model<TodoDocument>("Todo", todoSchema)

export { Todo, todoModel }
