import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  uuid, 
  integer, 
  numeric, 
  boolean, 
  pgEnum,
  uniqueIndex
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Enums
export const userTypeEnum = pgEnum('user_type', ['Partner', 'User']);
export const eventTypeEnum = pgEnum('event_type', ['MINI_GAMES', 'SOCIAL_QUEST', 'PARTNER_EVENTS']);


// Users table
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  userAddress: text("user_address").notNull().unique(),
  username : text("username").notNull().unique(),
  email : text("email").unique(),
  level: integer("level").notNull().default(1),
  distanceTravelled: numeric("distance_travelled", { precision: 20, scale: 2 }).notNull().default("0"),
  checkpointsConquered: integer("checkpoints_conquered").notNull().default(0),
  currentAvatarId: integer("current_avatar_id").notNull().default(1),
  purchasedAvatarIds: text("purchased_avatar_ids").array().notNull().default(["1"]),
  currentLocation: text("current_location"),
  subDomainName: text("sub_domain_name"),
  userType: userTypeEnum("user_type").notNull().default("User"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userAddressIdx: uniqueIndex("users_user_address_idx").on(table.userAddress),
}));

// Rewards table
export const rewardsTable = pgTable("rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userAddress: text("user_address").notNull().references(() => usersTable.userAddress),
  tokenAddress: text("token_address").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenAmount: numeric("token_amount", { precision: 20, scale: 8 }).notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Social Quests table
export const socialQuestsTable = pgTable("social_quests", {
  questId: uuid("quest_id").primaryKey().defaultRandom(),
  partnerAddress: text("partner_address").notNull().references(() => usersTable.userAddress),
  rewardToken: text("reward_token").notNull(),
  rewardAmount: text("reward_amount").notNull(),
  rewardSymbol: text("reward_symbol").notNull(),
  questLocation: text("quest_location").notNull(),
  energyToBeBurned: text("energy_to_be_burned").notNull(),
  questName: text("quest_name").notNull(),
  questDescription: text("quest_description").notNull(),
  partnerName: text("partner_name").notNull(),
  questWinner: text("quest_winner"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Quest Submissions table
export const questSubmissionsTable = pgTable("quest_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  address: text("address").notNull().references(() => usersTable.userAddress),
  questId: uuid("quest_id").notNull().references(() => socialQuestsTable.questId),
  submissionLink: text("submission_link").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
}, (table) => ({
  uniqueSubmission: uniqueIndex("quest_submissions_address_quest_id_idx").on(table.address, table.questId),
}));


// Schema exports for users
export const userInsertSchema = createInsertSchema(usersTable);
export const userSelectSchema = createSelectSchema(usersTable);
export const userUpdateSchema = createUpdateSchema(usersTable);

// Schema exports for rewards
export const rewardInsertSchema = createInsertSchema(rewardsTable);
export const rewardSelectSchema = createSelectSchema(rewardsTable);
export const rewardUpdateSchema = createUpdateSchema(rewardsTable);

// Schema exports for social quests
export const socialQuestInsertSchema = createInsertSchema(socialQuestsTable);
export const socialQuestSelectSchema = createSelectSchema(socialQuestsTable);
export const socialQuestUpdateSchema = createUpdateSchema(socialQuestsTable);

// Schema exports for quest submissions
export const questSubmissionInsertSchema = createInsertSchema(questSubmissionsTable);
export const questSubmissionSelectSchema = createSelectSchema(questSubmissionsTable);
export const questSubmissionUpdateSchema = createUpdateSchema(questSubmissionsTable);


// Type exports for users
export type UserInsertSchema = z.infer<typeof userInsertSchema>;
export type UserSelectSchema = z.infer<typeof userSelectSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;

// Type exports for rewards
export type RewardInsertSchema = z.infer<typeof rewardInsertSchema>;
export type RewardSelectSchema = z.infer<typeof rewardSelectSchema>;
export type RewardUpdateSchema = z.infer<typeof rewardUpdateSchema>;

// Type exports for social quests
export type SocialQuestInsertSchema = z.infer<typeof socialQuestInsertSchema>;
export type SocialQuestSelectSchema = z.infer<typeof socialQuestSelectSchema>;
export type SocialQuestUpdateSchema = z.infer<typeof socialQuestUpdateSchema>;

// Type exports for quest submissions
export type QuestSubmissionInsertSchema = z.infer<typeof questSubmissionInsertSchema>;
export type QuestSubmissionSelectSchema = z.infer<typeof questSubmissionSelectSchema>;
export type QuestSubmissionUpdateSchema = z.infer<typeof questSubmissionUpdateSchema>;
