import express, { type Express, type Request, type Response } from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerGetChirp, handlerGetAllChirps, handlerChirpsCreation } from "./api/chirps.js";
import { middlewareLogResponses, middlewareMetricsInc, errorMiddlewareHandler } from "./api/middleware.js";
import { handlerCreateUser, handlerLoginUser, handlerRefreshToken, handlerRevokeToken } from "./api/users.js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app: Express = express();
const PORT = config.api.port;

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc);

app.use("/app", express.static("./src/app"));

// API
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);

app.post("/api/refresh", handlerRefreshToken);
app.post("/api/revoke", handlerRevokeToken);
app.post("/admin/reset", handlerReset);

// Users
app.post("/api/users", handlerCreateUser);
app.post("/api/login", handlerLoginUser);

// Chirps
app.get("/api/chirps", handlerGetAllChirps);
app.get("/api/chirps/:chirpId", handlerGetChirp);

app.post("/api/chirps", handlerChirpsCreation);


app.use(errorMiddlewareHandler);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});