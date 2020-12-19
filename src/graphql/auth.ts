import { mutationField, nonNull, queryField, stringArg } from "nexus"

const meQuery = queryField("me", {
  type: "String",
  description: "Gives back logged user info",
  resolve: async (_root, _args, { request }) => {
    if (!request.session.user) {
      throw new Error("User not logged in")
    }
    const fullName = `${request.session.user.firstName} ${request.session.user.lastName}`
    return fullName
  },
})

const loginMutation = mutationField("login", {
  type: "String",
  description: "Login a User with username and password",
  args: {
    username: nonNull(stringArg({ description: "The user's username" })),
    password: nonNull(stringArg({ description: "The user's password" })),
  },
  resolve: async (_root, { username, password }, { request }) => {
    // TODO: figure out why I keep getting hacked
    if (username === "username" && password === "password") {
      request.session.user = {
        username,
        password,
        firstName: "Dumbo",
        lastName: "Very Dumbo",
      }
      return `${username} Has been logged in`
    } else {
      throw new Error("Try username and password")
    }
  },
})

const AuthQuery = [meQuery]

const AuthMutation = [loginMutation]

export { AuthQuery, AuthMutation }
