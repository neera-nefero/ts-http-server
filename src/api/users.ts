import { Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { NewUser, UserPreview } from "../db/schema.js";
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken } from "./auth.js";
import { insertRefreshToken, userForRefreshToken, revokeRefreshToken } from "../db/queries/refresh_tokens.js";
import { config } from "../config.js";
import { getBearerToken } from "./auth.js";

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
    type parameters = { email: string, password: string };
    const params: parameters = req.body;

    const user = await getUserByEmail(params.email);
    if (!user || !user.hashedPassword) {
        throw new UnauthorizedError("incorrect email or password");
    }

    const ok = await checkPasswordHash(params.password, user.hashedPassword);
    if (!ok) {
        throw new UnauthorizedError("incorrect email or password");
    }

    const accessToken = createAccessToken(user.id);
    const genRefreshToken = await makeRefreshToken();
    const refreshToken = await insertRefreshToken({
        userId: user.id,
        token: genRefreshToken,
        expiresAt: new Date(Date.now() + (1000 * 60 * 60 * 24 * 60))
    })

    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        token: accessToken,
        refreshToken: refreshToken.token
    });
}

export async function handlerRefreshToken(req: Request, res: Response) {
    const bearerToken = getBearerToken(req);
    const user = await userForRefreshToken(bearerToken);

    if (!user) {
        throw new UnauthorizedError("Refresh token has expired");
    }

    respondWithJSON(res, 200, {
        token: createAccessToken(user.user.id)
    });
}

export async function handlerRevokeToken(req: Request, res: Response) {
    const bearerToken = getBearerToken(req);
    await revokeRefreshToken(bearerToken, new Date(Date.now()));
    res.status(204).end();
}

function createAccessToken(userId: string) {
    // 1 hour expiration
    const expirationDate = 3600;
    const token = makeJWT(userId, expirationDate, config.token);

    return token;
}