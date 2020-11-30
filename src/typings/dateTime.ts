import { asNexusMethod } from "@nexus/schema"
import { DateTimeResolver } from "graphql-scalars"

export const GQLDateTime = asNexusMethod(DateTimeResolver, "dateTime")
