import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq, and } from "drizzle-orm";

export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function getUserByEmail(email: string) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}

export async function resetUser() {
    const [result] = await db.delete(users);
}

export async function updateUser(id: string, hashedPassword: string, email: string, now: Date) {
    const [updatedUser] = await db.update(users)
        .set({
            email: email,
            hashedPassword: hashedPassword,
            updatedAt: now
        })
        .where(eq(users.id, id))
        .returning();

    return updatedUser;
}