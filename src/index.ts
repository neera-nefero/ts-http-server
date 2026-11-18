import express, { type Express, type Request, type Response } from "express";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerChirpsValidate } from "./api/chirps.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";

const app: Express = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);

app.use("/app", express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerChirpsValidate);

app.post("/admin/reset", handlerReset);
app.get("/admin/metrics", handlerMetrics);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});