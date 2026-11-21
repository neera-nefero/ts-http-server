import type { Request, Response } from "express";
import { config } from "../config.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createChirp } from "../db/queries/chirps.js";
import { Chirp } from "../db/schema.js";

export async function handlerChirpsCreation(req: Request, res: Response) {
    type parameters = { body: string, userId: string };
    const params: parameters = req.body;

    checkMaxChirpLength(params.body);
    const cleanedBody = cleanChirpBody(params.body);
    const chirp: Chirp = await createChirp({
        body: params.body,
        userId: params.userId
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
