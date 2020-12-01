import { booleanArg, extendType, list, nonNull, objectType, stringArg, subscriptionField } from "@nexus/schema"

import { todoModel, Todo as TodoInterface } from "../models/todo"

const Todo = objectType({
  name: "Todo",
  description: "A todo object",
  definition(t) {
    t.string("id", { description: "The unique identifier of the Todo" })
    t.string("description", { description: "The Todo description" })
    t.boolean("completed", { description: "If the todo has been completed" })
    t.field("createdAt", { type: "DateTime", description: "When the Todo has been created" })
    t.field("updatedAt", { type: "DateTime", description: "When the Todo has been updated" })
    // t.dateTime("createdAt"),
    // t.dateTime("updatedAt"),
  },
})

const TodoQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("allTodos", {
      type: list(Todo),
      description: "Fetch all todos (completed or not)",
      resolve: async (_root, _args, _ctx) => await todoModel.find(),
    })
    t.field("allActiveTodos", {
      type: list(Todo),
      description: "Fetch all uncompleted todos",
      resolve: async (_root, _args, _ctx) => await todoModel.find({ completed: false }),
    })
  },
})

const TodoMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("newTodo", {
      type: Todo,
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
      type: Todo,
      description: "Edits a todo",
      args: {
        id: nonNull(stringArg({ description: "The ID of the Todo to edit" })),
        description: stringArg({ description: "The new description of the edited todo" }),
        completed: booleanArg({ description: "The new completed status of the edited todo" }),
      },
      resolve: async (_root, { id, description, completed }, { pubsub }) => {
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
  resolve: async (payload: TodoInterface) => payload,
})

export { TodoQuery, TodoMutation, TodoSubscription }
