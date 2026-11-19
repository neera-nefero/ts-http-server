process.loadEnvFile();
envOrThrow('DB_URL');
export const config = {
    fileserverHits: 0,
    dbURL: process.env.DB_URL,
};
function envOrThrow(key) {
    if (!process.env.key) {
        throw new Error(`${key} is not set`);
    }
}
