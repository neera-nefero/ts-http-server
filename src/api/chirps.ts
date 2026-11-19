import type { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function handlerChirpsValidate(req: Request, res: Response) {
    type parameters = { body: string };
    const params: parameters = req.body;

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const meanWords = ['kerfuffle', 'sharbert', 'fornax'];
    const bodyWords = params.body.split(" ");
    for (let i = 0; i < bodyWords.length; i++) {
        if (meanWords.includes(bodyWords[i].toLocaleLowerCase())) {
            bodyWords[i] = "****";
        }
    }

    respondWithJSON(res, 200, {
        cleanedBody: bodyWords.join(" "),
    });
}
