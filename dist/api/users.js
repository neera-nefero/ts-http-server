import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
export async function handlerCreateUser(req, res) {
    const params = req.body;
    if (!params.email) {
        throw new BadRequestError("Email required");
    }
    const newUser = {
        email: params.email,
    };
    const insertedUser = await createUser(newUser);
    respondWithJSON(res, 201, insertedUser);
}
