import { db } from "../index";
import {
  questSubmissionsTable,
  usersTable,
  socialQuestsTable,
  QuestSubmissionInsertSchema,
  QuestSubmissionUpdateSchema,
  QuestSubmissionSelectSchema,
} from "../schema";
import { eq, desc, and, count } from "drizzle-orm";

export async function getAllQuestSubmissions() {
  return await db.select().from(questSubmissionsTable);
}

export async function getQuestSubmissionById(id: string) {
  const result = await db
    .select()
    .from(questSubmissionsTable)
    .where(eq(questSubmissionsTable.id, id));
  return result[0] || null;
}

export async function getSubmissionsByQuest(questId: string, limit?: number, offset?: number) {
  const baseQuery = db
    .select({
      submission: questSubmissionsTable,
      user: {
        userAddress: usersTable.userAddress,
        level: usersTable.level,
        distanceTravelled: usersTable.distanceTravelled,
        checkpointsConquered: usersTable.checkpointsConquered,
        currentAvatarId: usersTable.currentAvatarId,
        currentLocation: usersTable.currentLocation,
        subDomainName: usersTable.subDomainName,
        userType: usersTable.userType,
      },
    })
    .from(questSubmissionsTable)
    .leftJoin(usersTable, eq(questSubmissionsTable.address, usersTable.userAddress))
    .where(eq(questSubmissionsTable.questId, questId))
    .orderBy(desc(questSubmissionsTable.submittedAt));

  if (limit && offset !== undefined) {
    return await baseQuery.limit(limit).offset(offset);
  } else if (limit) {
    return await baseQuery.limit(limit);
  }

  return await baseQuery;
}

export async function getSubmissionsByUser(userAddress: string, limit?: number, offset?: number) {
  const baseQuery = db
    .select({
      submission: questSubmissionsTable,
      quest: {
        questId: socialQuestsTable.questId,
        questName: socialQuestsTable.questName,
        questDescription: socialQuestsTable.questDescription,
        rewardAmount: socialQuestsTable.rewardAmount,
        rewardSymbol: socialQuestsTable.rewardSymbol,
        partnerName: socialQuestsTable.partnerName,
        questLocation: socialQuestsTable.questLocation,
        isActive: socialQuestsTable.isActive,
        questWinner: socialQuestsTable.questWinner,
      },
    })
    .from(questSubmissionsTable)
    .leftJoin(socialQuestsTable, eq(questSubmissionsTable.questId, socialQuestsTable.questId))
    .where(eq(questSubmissionsTable.address, userAddress))
    .orderBy(desc(questSubmissionsTable.submittedAt));

  if (limit && offset !== undefined) {
    return await baseQuery.limit(limit).offset(offset);
  } else if (limit) {
    return await baseQuery.limit(limit);
  }

  return await baseQuery;
}

export async function createQuestSubmission(submission: QuestSubmissionInsertSchema) {
  const result = await db.insert(questSubmissionsTable).values(submission).returning();
  return result[0];
}

export async function updateQuestSubmission(id: string, submission: QuestSubmissionUpdateSchema) {
  const result = await db
    .update(questSubmissionsTable)
    .set(submission)
    .where(eq(questSubmissionsTable.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteQuestSubmission(id: string) {
  return await db.delete(questSubmissionsTable).where(eq(questSubmissionsTable.id, id));
}

export async function checkExistingSubmission(userAddress: string, questId: string): Promise<boolean> {
  const result = await db
    .select({ id: questSubmissionsTable.id })
    .from(questSubmissionsTable)
    .where(and(
      eq(questSubmissionsTable.address, userAddress),
      eq(questSubmissionsTable.questId, questId)
    ));
  
  return result.length > 0;
}

export async function getTotalSubmissionsCount() {
  const result = await db.select({ count: count() }).from(questSubmissionsTable);
  return result[0].count;
}

export async function getQuestSubmissionsCount(questId: string) {
  const result = await db
    .select({ count: count() })
    .from(questSubmissionsTable)
    .where(eq(questSubmissionsTable.questId, questId));
  return result[0].count;
}

export async function getUserSubmissionsCount(userAddress: string) {
  const result = await db
    .select({ count: count() })
    .from(questSubmissionsTable)
    .where(eq(questSubmissionsTable.address, userAddress));
  return result[0].count;
}

export async function getSubmissionWithDetails(id: string) {
  const result = await db
    .select({
      submission: questSubmissionsTable,
      user: {
        userAddress: usersTable.userAddress,
        level: usersTable.level,
        distanceTravelled: usersTable.distanceTravelled,
        checkpointsConquered: usersTable.checkpointsConquered,
        currentAvatarId: usersTable.currentAvatarId,
        currentLocation: usersTable.currentLocation,
        subDomainName: usersTable.subDomainName,
        userType: usersTable.userType,
      },
      quest: {
        questId: socialQuestsTable.questId,
        questName: socialQuestsTable.questName,
        questDescription: socialQuestsTable.questDescription,
        rewardAmount: socialQuestsTable.rewardAmount,
        rewardSymbol: socialQuestsTable.rewardSymbol,
        partnerName: socialQuestsTable.partnerName,
        questLocation: socialQuestsTable.questLocation,
        isActive: socialQuestsTable.isActive,
        questWinner: socialQuestsTable.questWinner,
      },
    })
    .from(questSubmissionsTable)
    .leftJoin(usersTable, eq(questSubmissionsTable.address, usersTable.userAddress))
    .leftJoin(socialQuestsTable, eq(questSubmissionsTable.questId, socialQuestsTable.questId))
    .where(eq(questSubmissionsTable.id, id));
  
  return result[0] || null;
}
