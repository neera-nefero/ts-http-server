type APIConfig = {
    fileserverHits: number,
    dbURL: any
};

process.loadEnvFile()

export const config: APIConfig = {
    fileserverHits: 0,
    dbURL: envOrThrow("DB_URL"),
};

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} is not set`);
    }
    return value;
}