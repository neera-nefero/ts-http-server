import { config } from "../config.js";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "./errors.js";
export function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        if (!(res.statusCode >= 200 && res.statusCode < 300)) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}
export function middlewareMetricsInc(req, res, next) {
    res.on("finish", () => {
        config.api.fileServerHits++;
    });
    next();
}
export function errorMiddlewareHandler(err, req, res, next) {
    console.log(err);
    if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
    }
    else if (err instanceof UnauthorizedError) {
        res.status(401).json({ error: err.message });
    }
    else if (err instanceof ForbiddenError) {
        res.status(403).json({ error: err.message });
    }
    else if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
    }
    else {
        res.status(500).json({ error: "Something went wrong on our end" });
    }
}
