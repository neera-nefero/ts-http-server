import { Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { NewUser, UserPreview } from "../db/schema.js";
import { hashPassword, checkPasswordHash } from "./auth.js";

export async function handlerCreateUser(req: Request, res: Response) {
    type parameters = { email: string, password: string };
    const params: parameters = req.body;

    if (!params.email) {
        throw new BadRequestError("Email required");
    }
    if (!params.password) {
        throw new BadRequestError("Password required");
    }

    const hashedPassword = await hashPassword(params.password);
    const newUser: NewUser = {
        email: params.email,
        hashedPassword: hashedPassword
    }
    const insertedUser: UserPreview = await createUser(newUser);

    respondWithJSON(res, 201, insertedUser);
}

export async function handlerLoginUser(req: Request, res: Response) {
    type parameters = { email: string, password: string, expiresInSeconds?: number };
    const params: parameters = req.body;

    const expirationDate = getExpirationDate(params.expiresInSeconds);

    const user = await getUserByEmail(params.email);
    if (!user || !user.hashedPassword) {
        throw new UnauthorizedError("incorrect email or password");
    }

    const ok = await checkPasswordHash(params.password, user.hashedPassword);
    if (!ok) {
        throw new UnauthorizedError("incorrect email or password");
    }

    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email
    });
}

function getExpirationDate(proposedTime?: number) {
    const oneHourFromNow = Math.floor(Date.now() / 1000) + 3600;
    if (proposedTime && proposedTime < oneHourFromNow) {
        return proposedTime;
    }

    return oneHourFromNow;
}