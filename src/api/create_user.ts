import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
import { NewUser, User } from "../db/schema.js";

export async function handlerCreateUser(req: Request, res: Response) {
    if (!req.body.email) {
        throw new BadRequestError("Email required");
    }
    const newUser: NewUser = {
        email: req.body.email,
    }
    const insertedUser: User = await createUser(newUser);

    respondWithJSON(res, 201, insertedUser);
}