import { roles } from "../../Middelware/authuntication.js";

export const endPoint = {
    admin: roles.Admin,
    instructor: roles.Instructor,
    user: roles.User
}