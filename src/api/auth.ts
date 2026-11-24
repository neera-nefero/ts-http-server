import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { BadRequestError, UnauthorizedError } from "./errors.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string) {
    return argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
    if (!password) return false;
    try {
        return await argon2.verify(hash, password);
    } catch {
        return false;
    }
}

export function makeJWT(userID: string, expiresIn: number, secret: string) {
    const payload: payload = {
        iss: "chirpy",
        sub: userID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
    };
    return jwt.sign(payload, secret, { algorithm: "HS256" });
}

export function validateJWT(tokenString: string, secret: string) {
    let decoded: payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
        throw new UnauthorizedError("Invalid token");
    }

    if (!decoded.sub) {
        throw new UnauthorizedError("No user ID in token");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request) {
    const authorization = req.get("Authorization");
    if (!authorization) {
        throw new BadRequestError("Malformed authorization header");
    }
    return extractBearerToken(authorization);
}

export function extractBearerToken(authorization: string | undefined) {
    if (!authorization) {
        throw new BadRequestError("Malformed authorization header");
    }

    const [type, value] = authorization.trim().split(" ");
    if (type != "Bearer" || !value) {
        throw new BadRequestError("Malformed authorization header");
    }

    return value;
}

export async function makeRefreshToken() {
    const {
        randomBytes,
    } = await import('node:crypto');

    const token = randomBytes(32).toString('hex');
    return token;
}