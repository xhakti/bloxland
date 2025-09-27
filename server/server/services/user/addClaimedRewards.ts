import { createReward } from "../../db/queries/rewards";
import { getUserByAddress } from "../../db/queries/users";
import type { RewardSelectSchema } from "../../db/zodSchemaAndTypes";

export interface AddClaimedRewardsData {
  userAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenAmount: string;
  eventType: 'MINI_GAMES' | 'SOCIAL_QUEST' | 'PARTNER_EVENTS';
}

export const addClaimedRewardsService = async (data: AddClaimedRewardsData): Promise<{
  data: RewardSelectSchema | null;
  message: string;
  error: any;
}> => {
  try {
    const { userAddress, tokenAddress, tokenSymbol, tokenAmount, eventType } = data;

    // Validate that the user exists
    const user = await getUserByAddress(userAddress);
    if (!user) {
      return {
        data: null,
        message: "User not found",
        error: null,
      };
    }

    // Validate token amount is positive
    const amount = parseFloat(tokenAmount);
    if (isNaN(amount) || amount <= 0) {
      return {
        data: null,
        message: "Invalid token amount",
        error: null,
      };
    }

    // Create the reward entry
    const reward = await createReward({
      userAddress,
      tokenAddress,
      tokenSymbol,
      tokenAmount: tokenAmount,
      eventType,
    });

    return {
      data: reward,
      message: "Reward added successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error adding claimed rewards:", error);
    return {
      data: null,
      message: "Failed to add rewards",
      error: error,
    };
  }
};

export default addClaimedRewardsService;
