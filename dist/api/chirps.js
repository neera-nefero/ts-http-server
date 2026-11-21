import { config } from "../config.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getChirps, createChirp } from "../db/queries/chirps.js";
export async function handlerChirpsRetrieval(req, res) {
    const chirps = await getChirps();
    console.log(chirps);
    respondWithJSON(res, 200, chirps);
}
export async function handlerChirpsCreation(req, res) {
    const params = req.body;
    checkMaxChirpLength(params.body);
    const cleanedBody = cleanChirpBody(params.body);
    const chirp = await createChirp({
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
function checkMaxChirpLength(body) {
    if (body.length > config.chirp.maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }
}
function cleanChirpBody(body) {
    const bodyWords = body.split(" ");
    for (let i = 0; i < bodyWords.length; i++) {
        if (config.chirp.meanWords.includes(bodyWords[i].toLocaleLowerCase())) {
            bodyWords[i] = "****";
        }
    }
    return bodyWords.join(" ");
}
