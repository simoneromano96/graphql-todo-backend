import { Schema, model, Document } from "mongoose"

enum CompletitionStatus {
  "NOT_COMPLETED", // 0
  "IN_PROGRESS", // 1
  "COMPLETED", // 2
}

interface Todo {
  description: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
  completitionStatus: CompletitionStatus
}

interface TodoDocument extends Todo, Document {}

const todoSchema = new Schema(
  {
    description: String,
    completed: {
      type: Boolean,
      default: false,
    },
    completitionStatus: {
      type: Number,
      default: 0,
      enum: [0, 1, 2],
    },
  },
  { timestamps: true },
)

const todoModel = model<TodoDocument>("Todo", todoSchema)

export { Todo, todoModel }
