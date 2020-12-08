import { mutationField, nonNull, objectType, queryField, stringArg } from "@nexus/schema"
import { hash, verify } from "argon2"
import config from "../config"
import { userModel } from "../models/user"

const User = objectType({
  name: "User",
  description: "A user object",
  definition(t) {
    t.string("id", { description: "The unique identifier of the User" })
    t.string("username", { description: "The user's username" })
  },
})

const meQuery = queryField("me", {
  type: User,
  description: "Get currently logged user's info",
  resolve: (_root, _args, { request }) => request.session.user,
})

const signupMutation = mutationField("signup", {
  type: nonNull(User),
  description: "Create new user",
  args: {
    username: nonNull(stringArg({ description: "The new user's username" })),
    password: nonNull(stringArg({ description: "The new user's password" })),
  },
  resolve: async (_root, { username, password }, { request }) => {
    const hashed = await hash(password, config.app.hash)
    const newUser = new userModel({ username, password: hashed })
    // User on the DB
    const user = await newUser.save()
    request.session.user = user.toObject()
    return user
  },
})

const loginMutation = mutationField("login", {
  type: nonNull(User),
  description: "Login user",
  args: {
    username: nonNull(stringArg({ description: "The user's username" })),
    password: nonNull(stringArg({ description: "The user's password" })),
  },
  resolve: async (_root, { username, password }, { request }) => {
    const user = await userModel.findOne({ username })
    if (!user) {
      throw new Error(`User with username: ${username} not found`)
    }
    const hashed = user.password
    const valid = await verify(hashed, password, config.app.hash)
    if (!valid) {
      throw new Error("Wrong password")
    }
    request.session.user = user.toObject()
    return user
  },
})

const logoutMutation = mutationField("logout", {
  type: "String",
  description: "Logs out user",
  resolve: (_root, _args, { request }) =>
    new Promise((resolve, reject) => {
      request.destroySession((e: string) => {
        if (e) {
          reject(e)
        } else {
          resolve("Logged out")
        }
      })
    }),
})

const AuthQuery = [meQuery]

const AuthMutation = [signupMutation, loginMutation, logoutMutation]

export { AuthMutation, AuthQuery }
