import type { MigrationConfig } from "drizzle-orm/migrator";

type DBConfig = {
    url: string,
    migrationConfig: MigrationConfig
};

type APIConfig = {
    fileServerHits: number,
    port: number,
    platform: string
};

type Config = {
    db: DBConfig,
    api: APIConfig
}

process.loadEnvFile()

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
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

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} is not set`);
    }
    return value;
}