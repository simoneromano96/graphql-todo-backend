import { asNexusMethod } from "nexus"
import { DateTimeResolver } from "graphql-scalars"

export const GQLDateTime = asNexusMethod(DateTimeResolver, "dateTime")
