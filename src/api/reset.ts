import { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "./errors.js";
import { resetUser } from "../db/queries/users.js";

export function handlerReset(req: Request, res: Response) {
    if (config.api.platform != "dev") {
        throw new ForbiddenError("Reset only allowed in dev");
    }
    config.api.fileServerHits = 0;
    resetUser();
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits and Users reset`);
}