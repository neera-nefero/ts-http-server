import type { Request, Response } from "express";
import { config } from "../config.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { getChirps, getChirp, createChirp } from "../db/queries/chirps.js";
import { Chirp } from "../db/schema.js";
import { getBearerToken, validateJWT } from "./auth.js";

export async function handlerGetAllChirps(req: Request, res: Response) {
    const chirps = await getChirps();
    respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirp(req: Request, res: Response) {
    const chirpId = req.params.chirpId;
    if (typeof chirpId !== "string") {
        throw new BadRequestError("Invalid chirp ID");
    }

    const chirp = await getChirp(chirpId);

    if (!chirp) {
        respondWithError(res, 404, "Chirp not found")
    }

    respondWithJSON(res, 200, chirp);
}

export async function handlerChirpsCreation(req: Request, res: Response) {
    type parameters = { body: string };
    const params: parameters = req.body;

    const bearerToken = getBearerToken(req);
    const userId = validateJWT(bearerToken, config.token);

    checkMaxChirpLength(params.body);
    const cleanedBody = cleanChirpBody(params.body);
    const chirp: Chirp = await createChirp({
        body: cleanedBody,
        userId: userId
    });

    respondWithJSON(res, 201, {
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: chirp.body,
        userId: chirp.userId
    });
}

function checkMaxChirpLength(body: string) {
    if (body.length > config.chirp.maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }
}

function cleanChirpBody(body: string) {
    const bodyWords = body.split(" ");
    for (let i = 0; i < bodyWords.length; i++) {
        if (config.chirp.meanWords.includes(bodyWords[i].toLocaleLowerCase())) {
            bodyWords[i] = "****";
        }
    }

    return bodyWords.join(" ");
}
