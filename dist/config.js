process.loadEnvFile();
const migrationConfig = {
    migrationsFolder: "./src/db/migrations",
};
export const config = {
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig
    },
    api: {
        fileServerHits: 0,
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM")
    }
};
function envOrThrow(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} is not set`);
    }
    return value;
}
