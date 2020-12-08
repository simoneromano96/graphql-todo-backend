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
    description: {
      type: String,
      required: true,
      validate: (value: string) => value.length > 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completitionStatus: {
      type: String,
      default: "NOT_COMPLETED",
      enum: ["NOT_COMPLETED", "IN_PROGRESS", "COMPLETED"],
    },
  },
  { timestamps: true },
)

const todoModel = model<TodoDocument>("Todo", todoSchema)

export { Todo, todoModel, todoSchema }
