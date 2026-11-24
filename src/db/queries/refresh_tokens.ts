import { db } from "../index.js";
import { NewRefreshToken, RefreshToken, refreshTokens, users } from "../schema.js";
import { eq, and, isNull, gt } from "drizzle-orm";

export async function insertRefreshToken(refreshToken: NewRefreshToken) {
    const [result] = await db
        .insert(refreshTokens)
        .values(refreshToken)
        .returning();
    return result;
}

export async function userForRefreshToken(token: string) {
    const [result] = await db
        .select({ user: users })
        .from(users)
        .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
        .where(
            and(
                eq(refreshTokens.token, token),
                isNull(refreshTokens.revokedAt),
                gt(refreshTokens.expiresAt, new Date()),
            ),
        )
        .limit(1);

    return result;
}

export async function revokeRefreshToken(token: string, date: Date) {
    await db
        .update(refreshTokens)
        .set({
            revokedAt: date,
            updatedAt: date
        })
        .where(eq(refreshTokens.token, token));
}