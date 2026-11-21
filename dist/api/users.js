import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash } from "./auth.js";
export async function handlerCreateUser(req, res) {
    const params = req.body;
    if (!params.email) {
        throw new BadRequestError("Email required");
    }
    if (!params.password) {
        throw new BadRequestError("Password required");
    }
    const hashedPassword = await hashPassword(params.password);
    const newUser = {
        email: params.email,
        hashedPassword: hashedPassword
    };
    const insertedUser = await createUser(newUser);
    respondWithJSON(res, 201, insertedUser);
}
export async function handlerLoginUser(req, res) {
    const params = req.body;
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
