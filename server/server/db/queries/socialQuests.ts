import { db } from "../index";
import {
  socialQuestsTable,
  SocialQuestInsertSchema,
  SocialQuestUpdateSchema,
  SocialQuestSelectSchema,
} from "../schema";
import { eq, desc, and, count, isNull, isNotNull } from "drizzle-orm";

export async function getAllSocialQuests() {
  return await db.select().from(socialQuestsTable);
}

export async function getActiveSocialQuests(limit?: number, offset?: number) {
  const baseQuery = db
    .select()
    .from(socialQuestsTable)
    .where(eq(socialQuestsTable.isActive, true))
    .orderBy(desc(socialQuestsTable.createdAt));

  if (limit && offset !== undefined) {
    return await baseQuery.limit(limit).offset(offset);
  } else if (limit) {
    return await baseQuery.limit(limit);
  }

  return await baseQuery;
}

export async function getSocialQuestById(questId: string) {
  const result = await db
    .select()
    .from(socialQuestsTable)
    .where(eq(socialQuestsTable.questId, questId));
  return result[0] || null;
}

export async function getSocialQuestsByPartner(partnerAddress: string, limit?: number, offset?: number) {
  const baseQuery = db
    .select()
    .from(socialQuestsTable)
    .where(eq(socialQuestsTable.partnerAddress, partnerAddress))
    .orderBy(desc(socialQuestsTable.createdAt));

  if (limit && offset !== undefined) {
    return await baseQuery.limit(limit).offset(offset);
  } else if (limit) {
    return await baseQuery.limit(limit);
  }

  return await baseQuery;
}

export async function getQuestsWithWinners() {
  return await db
    .select()
    .from(socialQuestsTable)
    .where(isNotNull(socialQuestsTable.questWinner))
    .orderBy(desc(socialQuestsTable.updatedAt));
}

export async function getQuestsWithoutWinners() {
  return await db
    .select()
    .from(socialQuestsTable)
    .where(and(
      isNull(socialQuestsTable.questWinner),
      eq(socialQuestsTable.isActive, true)
    ))
    .orderBy(desc(socialQuestsTable.createdAt));
}

export async function createSocialQuest(quest: SocialQuestInsertSchema) {
  const result = await db.insert(socialQuestsTable).values(quest).returning();
  return result[0];
}

export async function updateSocialQuest(questId: string, quest: SocialQuestUpdateSchema) {
  const result = await db
    .update(socialQuestsTable)
    .set({ ...quest, updatedAt: new Date() })
    .where(eq(socialQuestsTable.questId, questId))
    .returning();
  return result[0] || null;
}

export async function updateQuestWinner(questId: string, questWinner: string) {
  const result = await db
    .update(socialQuestsTable)
    .set({ 
      questWinner, 
      updatedAt: new Date() 
    })
    .where(eq(socialQuestsTable.questId, questId))
    .returning();
  return result[0] || null;
}

export async function deactivateQuest(questId: string) {
  const result = await db
    .update(socialQuestsTable)
    .set({ 
      isActive: false, 
      updatedAt: new Date() 
    })
    .where(eq(socialQuestsTable.questId, questId))
    .returning();
  return result[0] || null;
}

export async function deleteSocialQuest(questId: string) {
  return await db.delete(socialQuestsTable).where(eq(socialQuestsTable.questId, questId));
}

export async function getTotalQuestsCount() {
  const result = await db.select({ count: count() }).from(socialQuestsTable);
  return result[0].count;
}

export async function getActiveQuestsCount() {
  const result = await db
    .select({ count: count() })
    .from(socialQuestsTable)
    .where(eq(socialQuestsTable.isActive, true));
  return result[0].count;
}

export async function getPartnerQuestsCount(partnerAddress: string) {
  const result = await db
    .select({ count: count() })
    .from(socialQuestsTable)
    .where(eq(socialQuestsTable.partnerAddress, partnerAddress));
  return result[0].count;
}

export async function getQuestsByLocation(questLocation: string) {
  return await db
    .select()
    .from(socialQuestsTable)
    .where(and(
      eq(socialQuestsTable.questLocation, questLocation),
      eq(socialQuestsTable.isActive, true)
    ))
    .orderBy(desc(socialQuestsTable.createdAt));
}
