import { db } from "../index";
import {
  rewardsTable,
  RewardInsertSchema,
  RewardUpdateSchema,
  RewardSelectSchema,
} from "../schema";
import { eq, desc, and, count } from "drizzle-orm";

export async function getAllRewards() {
  return await db.select().from(rewardsTable);
}

export async function getRewardById(id: string) {
  const result = await db.select().from(rewardsTable).where(eq(rewardsTable.id, id));
  return result[0] || null;
}

export async function getRewardsByUserAddress(userAddress: string, limit?: number, offset?: number) {
  const baseQuery = db
    .select()
    .from(rewardsTable)
    .where(eq(rewardsTable.userAddress, userAddress))
    .orderBy(desc(rewardsTable.createdAt));

  if (limit && offset !== undefined) {
    return await baseQuery.limit(limit).offset(offset);
  } else if (limit) {
    return await baseQuery.limit(limit);
  }

  return await baseQuery;
}

export async function getRewardsByEventType(eventType: 'MINI_GAMES' | 'SOCIAL_QUEST' | 'PARTNER_EVENTS') {
  return await db
    .select()
    .from(rewardsTable)
    .where(eq(rewardsTable.eventType, eventType))
    .orderBy(desc(rewardsTable.createdAt));
}

export async function createReward(reward: RewardInsertSchema) {
  const result = await db.insert(rewardsTable).values(reward).returning();
  return result[0];
}

export async function createMultipleRewards(rewards: RewardInsertSchema[]) {
  if (rewards.length === 0) return [];
  const result = await db.insert(rewardsTable).values(rewards).returning();
  return result;
}

export async function updateReward(id: string, reward: RewardUpdateSchema) {
  const result = await db
    .update(rewardsTable)
    .set(reward)
    .where(eq(rewardsTable.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteReward(id: string) {
  return await db.delete(rewardsTable).where(eq(rewardsTable.id, id));
}

export async function getTotalRewardsCount() {
  const result = await db.select({ count: count() }).from(rewardsTable);
  return result[0].count;
}

export async function getUserRewardsCount(userAddress: string) {
  const result = await db
    .select({ count: count() })
    .from(rewardsTable)
    .where(eq(rewardsTable.userAddress, userAddress));
  return result[0].count;
}

export async function getRewardsByTokenAddress(tokenAddress: string) {
  return await db
    .select()
    .from(rewardsTable)
    .where(eq(rewardsTable.tokenAddress, tokenAddress))
    .orderBy(desc(rewardsTable.createdAt));
}
