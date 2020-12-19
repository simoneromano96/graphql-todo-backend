import { arg, booleanArg, enumType, extendType, list, nonNull, objectType, stringArg, subscriptionField } from "nexus"

import { todoModel, Todo as ITodo, CompletitionStatus } from "../models/todo"

const completitionStatuses = enumType({
  name: "CompletitionStatus",
  // Take all enum values (NOT_COMPLETED, IN_PROGRESS, COMPLETED)
  members: Object.values(CompletitionStatus),
  description: "A list of possible completition statuses",
})

const Todo = objectType({
  name: "Todo",
  description: "A todo object",
  definition(t) {
    t.string("id", { description: "The unique identifier of the Todo" })
    t.string("description", { description: "The Todo description" })
    t.boolean("completed", { description: "If the todo has been completed" })
    t.field("createdAt", { type: "DateTime", description: "When the Todo has been created" })
    t.field("updatedAt", { type: "DateTime", description: "When the Todo has been updated" })
    t.field("completitionStatus", {
      type: completitionStatuses,
      description: "The current completition status of the Todo",
    })
  },
})

const TodoQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("allTodos", {
      type: list(nonNull(Todo)),
      description: "Fetch all todos (completed or not)",
      resolve: async (_root, _args, _ctx) => await todoModel.find(),
    })
    t.field("allActiveTodos", {
      type: list(nonNull(Todo)),
      description: "Fetch all uncompleted todos",
      resolve: async (_root, _args, _ctx) => await todoModel.find({ completed: false }),
    })
  },
})

const TodoMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("newTodo", {
      type: nonNull(Todo),
      description: "Add a new todo",
      args: {
        description: nonNull(stringArg({ description: "Description of the new todo" })),
      },
      resolve: async (_root, { description }, { pubsub }) => {
        const newTodo = new todoModel({ description })
        await pubsub.publish({
          topic: "TODO_CHANGED",
          payload: newTodo,
        })
        return await newTodo.save()
      },
    })
    t.field("editTodo", {
      type: nonNull(Todo),
      description: "Edits a todo",
      args: {
        id: nonNull(stringArg({ description: "The ID of the Todo to edit" })),
        description: stringArg({ description: "The new description of the edited todo" }),
        completed: booleanArg({ description: "The new completed status of the edited todo" }),
        completitionStatus: arg({ type: completitionStatuses, description: "The new completition status" }),
      },
      resolve: async (_root, { id, description, completed, completitionStatus }, { pubsub }) => {
        let toEdit = await todoModel.findById(id)
        if (toEdit === null) {
          throw new Error(`Todo with id ${id} not found`)
        }
        if (description !== null && description !== undefined) {
          toEdit.description = description
        }
        if (completed !== null && completed !== undefined) {
          toEdit.completed = completed
        }
        if (completitionStatus !== null && completitionStatus !== undefined) {
          // Safe cast, the "COMPLETED" | "IN_PROGRESS" | "NOT_COMPLETED" Union is compatible with the CompletitionStatus enum
          toEdit.completitionStatus = completitionStatus as CompletitionStatus
        }
        toEdit = await toEdit.save()
        await pubsub.publish({
          topic: "TODO_CHANGED",
          payload: toEdit,
        })
        return toEdit
      },
    })
    t.field("deleteTodo", {
      type: "String",
      description: "Deletes a todo",
      args: {
        id: nonNull(stringArg({ description: "The ID of the Todo to delete" })),
      },
      resolve: async (_root, { id }, { pubsub }) => {
        let toRemove = await todoModel.findById(id)
        if (toRemove === null) {
          throw new Error(`Todo with id ${id} not found`)
        }
        await pubsub.publish({
          topic: "TODO_CHANGED",
          payload: toRemove,
        })
        toRemove = await toRemove.deleteOne()
        return "Removed todo successfully"
      },
    })
  },
})

const TodoSubscription = subscriptionField("Tod", {
  type: nonNull(Todo),
  description: "React to a Todo mutation",
  subscribe: async (_root, _args, { pubsub }) => await pubsub.subscribe("TODO_CHANGED"),
  resolve: async (payload: ITodo) => payload,
})

export { TodoQuery, TodoMutation, TodoSubscription }
