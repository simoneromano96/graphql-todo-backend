import { Schema, model, Document } from "mongoose"

enum CompletitionStatus {
  NotCompleted = "NOT_COMPLETED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
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
      default: CompletitionStatus.NotCompleted,
      // Produces: [CompletitionStatus.NotCompleted, CompletitionStatus.InProgress, CompletitionStatus.Completed],
      enum: Object.values(CompletitionStatus),
    },
  },
  { timestamps: true },
)

const todoModel = model<TodoDocument>("todo", todoSchema)

export { Todo, todoModel, CompletitionStatus, todoSchema, TodoDocument }
