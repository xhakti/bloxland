import { z } from "zod";

// User validation schemas
export const getUserByIdSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export const getLeaderboardSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

export const submitQuestSchema = z.object({
  userAddress: z.string().min(1, "User address is required"),
  submissionLink: z.string().url("Invalid submission link format"),
});

export const addClaimedRewardsSchema = z.object({
  userAddress: z.string().min(1, "User address is required"),
  tokenAddress: z.string().min(1, "Token address is required"),
  tokenSymbol: z.string().min(1, "Token symbol is required"),
  tokenAmount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Token amount must be a positive number"
  ),
  eventType: z.enum(['MINI_GAMES', 'SOCIAL_QUEST', 'PARTNER_EVENTS']),
});


export const registerUserSchema = z.object({
  address: z.string().min(1, "User address is required"),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email format").optional()
})

export const updateUserSchema = z.object({
  level: z.number().int().min(1).optional(),
  distanceTravelled: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    "Distance travelled must be a non-negative number"
  ).optional(),
  checkpointsConquered: z.number().int().min(0).optional(),
  currentAvatarId: z.number().int().min(1).optional(),
  purchasedAvatarIds: z.array(z.string()).optional(),
  currentLocation: z.string().optional(),
  subDomainName: z.string().optional(),
});

// Partner validation schemas
export const addSocialQuestSchema = z.object({
  partnerAddress: z.string().min(1, "Partner address is required"),
  rewardToken: z.string().min(1, "Reward token is required"),
  rewardAmount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Reward amount must be a positive number"
  ),
  rewardSymbol: z.string().min(1, "Reward symbol is required"),
  questLocation: z.string().min(1, "Quest location is required"),
  energyToBeBurned: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Energy to be burned must be a positive number"
  ),
  questName: z.string().min(1, "Quest name is required"),
  questDescription: z.string().min(1, "Quest description is required"),
  partnerName: z.string().min(1, "Partner name is required"),
});

export const getQuestSubmissionsSchema = z.object({
  partnerAddress: z.string().min(1, "Partner address is required"),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

export const addQuestWinnersSchema = z.object({
  partnerAddress: z.string().min(1, "Partner address is required"),
  winnerAddresses: z.array(z.string().min(1, "Winner address cannot be empty"))
    .min(1, "At least one winner address is required"),
});

export const getPartnerQuestsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

// Route parameter schemas
export const questIdParamSchema = z.object({
  questId: z.string().uuid("Invalid quest ID format"),
});

export const userAddressParamSchema = z.object({
  address: z.string().min(1, "User address is required"),
});

export const partnerAddressParamSchema = z.object({
  partnerAddress: z.string().min(1, "Partner address is required"),
});
