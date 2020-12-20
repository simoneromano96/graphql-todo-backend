import {
  arg,
  booleanArg,
  enumType,
  extendType,
  list,
  nonNull,
  objectType,
  stringArg,
  subscriptionField,
} from "nexus"

import { todoModel, Todo as ITodo, CompletitionStatus } from "../models/todo"
import { userModel } from "../models/user"

const getUserFromSession = async (session: any) => {
  const userId = session.user._id
  const user = await userModel.findById(userId)
  if (!user) {
    throw new Error("Login first! You fucker")
  }
  return user
}

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
    t.boolean("completed", {
      description: "If the todo has been completed",
      deprecation: "This field has been deprecated in favour of completitionStatus",
    })
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
      resolve: async (_root, _args, { request }) => {
        const user = await getUserFromSession(request.session)
        await user.populate("todos").execPopulate()
        return user.todos
      },
    })
    t.field("allActiveTodos", {
      type: list(nonNull(Todo)),
      description: "Fetch all uncompleted todos",
      deprecation: "This query is using completed field, which is deprecated, use findTodos",
      resolve: async (_root, _args, { request }) => {
        const user = await getUserFromSession(request.session)
        await user.populate("todos").execPopulate()
        return user.todos.filter(({ completed }) => completed === false)
      },
    })
    t.field("findTodos", {
      type: list(nonNull(Todo)),
      description: "Fetches all todos from a user with the specified arguments",
      args: {
        completitionStatus: arg({
          type: completitionStatuses,
          description: "The new completition status",
        }),
      },
      resolve: async (_root, { completitionStatus: argCompletitionStatus }, { request }) => {
        const user = await getUserFromSession(request.session)
        await user.populate("todos").execPopulate()
        return user.todos.filter(
          ({ completitionStatus }) => completitionStatus === argCompletitionStatus,
        )
      },
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
      resolve: async (_root, { description }, { pubsub, request }) => {
        const user = await getUserFromSession(request.session)
        const newTodo = new todoModel({ description })
        await newTodo.save()

        user.todos.push(newTodo)
        await user.save()

        await pubsub.publish({
          topic: "TODO_CHANGED",
          payload: newTodo,
        })

        return newTodo
      },
    })
    t.field("editTodo", {
      type: nonNull(Todo),
      description: "Edits a todo",
      args: {
        id: nonNull(stringArg({ description: "The ID of the Todo to edit" })),
        description: stringArg({ description: "The new description of the edited todo" }),
        // completed: booleanArg({ description: "The new completed status of the edited todo" }),
        completitionStatus: arg({
          type: completitionStatuses,
          description: "The new completition status",
        }),
      },
      resolve: async (_root, { id, description, completitionStatus }, { pubsub, request }) => {
        const user = await getUserFromSession(request.session)
        await user.populate("todos").execPopulate()

        let toEdit = await todoModel.findById(id)
        if (toEdit === null) {
          throw new Error(`Todo with id ${id} not found`)
        }

        const hasTodo = user.todos.find(({ id }) => id === toEdit?.id)
        if (!hasTodo) {
          throw new Error("You cannot edit another person's TODO, you motherfucker!")
        }

        if (description !== null && description !== undefined) {
          toEdit.description = description
        }
        // if (completed !== null && completed !== undefined) {
        //   toEdit.completed = completed
        // }
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
      resolve: async (_root, { id }, { pubsub, request }) => {
        const user = await getUserFromSession(request.session)
        await user.populate("todos").execPopulate()

        let toRemove = await todoModel.findById(id)
        if (toRemove === null) {
          throw new Error(`Todo with id ${id} not found`)
        }

        const hasTodo = user.todos.find(({ id }) => id === toRemove?.id)
        if (!hasTodo) {
          throw new Error("You cannot delete another person's TODO, you motherfucker!")
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
