import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./errors.js";
export async function hashPassword(password) {
    return argon2.hash(password);
}
export async function checkPasswordHash(password, hash) {
    if (!password)
        return false;
    try {
        return await argon2.verify(hash, password);
    }
    catch {
        return false;
    }
}
export function makeJWT(userID, expiresIn, secret) {
    const payload = {
        iss: "chirpy",
        sub: userID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
    };
    return jwt.sign(payload, secret, { algorithm: "HS256" });
}
export function validateJWT(tokenString, secret) {
    let decoded;
    try {
        decoded = jwt.verify(tokenString, secret);
    }
    catch (e) {
        throw new UnauthorizedError("Invalid token");
    }
    if (!decoded.sub) {
        throw new UnauthorizedError("No user ID in token");
    }
    return decoded.sub;
}
export function getBearerToken(req) {
    const authorization = req.get("Authorization");
    if (!authorization) {
        throw new UnauthorizedError("Malformed authorization header");
    }
    return extractBearerToken(authorization);
}
export function extractBearerToken(authorization) {
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
    const { randomBytes, } = await import('node:crypto');
    const token = randomBytes(32).toString('hex');
    return token;
}
