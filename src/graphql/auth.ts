import { hash, verify } from "argon2"
import { mutationField, nonNull, objectType, queryField, stringArg } from "nexus"

import config from "../config"
import { userModel } from "../models/user"

const User = objectType({
  name: "User",
  description: "A user object",
  definition(t) {
    t.string("username", { description: "The user's username" })
  },
})

const meQuery = queryField("me", {
  type: User,
  description: "Gives back logged user info",
  resolve: async (_root, _args, { request }) => {
    if (!request.session.user) {
      throw new Error("User not logged in")
    }
    return request.session.user
  },
})

const loginMutation = mutationField("login", {
  type: User,
  description: "Login a User with username and password",
  args: {
    username: nonNull(stringArg({ description: "The user's username" })),
    password: nonNull(stringArg({ description: "The user's password" })),
  },
  resolve: async (_root, { username, password }, { request }) => {
    const user = await userModel.findOne({ username })
    if (!user) {
      throw new Error(`User with username: ${username} not found!`)
    }
    const matches = await verify(user.password, password)
    if (!matches) {
      throw new Error("Check your password again!")
    }
    request.session.user = user.toObject()
    return user
  },
})

const signupMutation = mutationField("signup", {
  type: User,
  description: "Signup a new User with username and password",
  args: {
    username: nonNull(stringArg({ description: "The new user's username" })),
    password: nonNull(stringArg({ description: "The new user's password" })),
  },
  resolve: async (_root, { username, password }, { request }) => {
    const hashedPassword = await hash(password, config.app.hash)
    const newUser = new userModel({ username, password: hashedPassword })
    await newUser.save()
    request.session.user = newUser.toObject()
    return newUser
  },
})

const AuthQuery = [meQuery]

const AuthMutation = [signupMutation, loginMutation]

export { AuthQuery, AuthMutation }
