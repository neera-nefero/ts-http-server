import { db } from "../index.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";
export async function createUser(user) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function getUserByEmail(email) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}
export async function resetUser() {
    const [result] = await db.delete(users);
}
export async function updateUser(id, hashedPassword, email, now) {
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
