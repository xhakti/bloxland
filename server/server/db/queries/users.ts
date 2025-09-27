import { db } from "../index";
import {
  usersTable,
  UserInsertSchema,
  UserUpdateSchema,
  UserSelectSchema,
} from "../schema";
import { eq, desc, count, sql } from "drizzle-orm";

export async function getAllUsers() {
  return await db.select().from(usersTable);
}

export async function getUserById(id: string) {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  return result[0] || null;
}

export async function getUserByAddress(userAddress: string) {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userAddress, userAddress));
  return result[0] || null;
}

export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  return result[0] || null;
}

export async function createUser(user: UserInsertSchema) {
  const result = await db.insert(usersTable).values(user).returning();
  return result[0];
}

export async function updateUser(userAddress: string, user: UserUpdateSchema) {
  const result = await db
    .update(usersTable)
    .set({ ...user, updatedAt: new Date() })
    .where(eq(usersTable.userAddress, userAddress))
    .returning();
  return result[0] || null;
}

export async function deleteUser(id: string) {
  return await db.delete(usersTable).where(eq(usersTable.id, id));
}

export async function getLeaderboard(limit: number = 50, offset: number = 0) {
  return await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.distanceTravelled))
    .limit(limit)
    .offset(offset);
}

export async function getTotalUsersCount() {
  const result = await db.select({ count: count() }).from(usersTable);
  return result[0].count;
}

export async function getPartnerUsers() {
  return await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userType, "Partner"));
}

export async function validatePartnerUser(
  userAddress: string
): Promise<boolean> {
  const result = await db
    .select({ userType: usersTable.userType })
    .from(usersTable)
    .where(eq(usersTable.userAddress, userAddress));

  return result[0]?.userType === "Partner";
}
