import { config } from "../config.js";
import { BadRequestError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { getChirps, getChirp, createChirp } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "./auth.js";
export async function handlerGetAllChirps(req, res) {
    const chirps = await getChirps();
    respondWithJSON(res, 200, chirps);
}
export async function handlerGetChirp(req, res) {
    const chirpId = req.params.chirpId;
    if (typeof chirpId !== "string") {
        throw new BadRequestError("Invalid chirp ID");
    }
    const chirp = await getChirp(chirpId);
    if (!chirp) {
        respondWithError(res, 404, "Chirp not found");
    }
    respondWithJSON(res, 200, chirp);
}
export async function handlerChirpsCreation(req, res) {
    const params = req.body;
    const bearerToken = getBearerToken(req);
    const userId = validateJWT(bearerToken, config.token);
    checkMaxChirpLength(params.body);
    const cleanedBody = cleanChirpBody(params.body);
    const chirp = await createChirp({
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
