import { updateQuestWinner } from "../../db/queries/socialQuests";
import { getSocialQuestById } from "../../db/queries/socialQuests";
import { validatePartnerUser, getUserByAddress } from "../../db/queries/users";
import { createMultipleRewards } from "../../db/queries/rewards";
import type { SocialQuestSelectSchema, RewardInsertSchema } from "../../db/zodSchemaAndTypes";

export interface AddQuestWinnersData {
  questId: string;
  partnerAddress: string;
  winnerAddresses: string[];
}

export const addQuestWinnersService = async (data: AddQuestWinnersData): Promise<{
  data: {
    quest: SocialQuestSelectSchema;
    rewardsCreated: number;
  } | null;
  message: string;
  error: any;
}> => {
  try {
    const { questId, partnerAddress, winnerAddresses } = data;

    // Validate that the user is a partner
    const isPartner = await validatePartnerUser(partnerAddress);
    if (!isPartner) {
      return {
        data: null,
        message: "Only partners can add quest winners",
        error: null,
      };
    }

    // Validate that the quest exists
    const quest = await getSocialQuestById(questId);
    if (!quest) {
      return {
        data: null,
        message: "Quest not found",
        error: null,
      };
    }

    // Validate that the partner owns this quest
    if (quest.partnerAddress !== partnerAddress) {
      return {
        data: null,
        message: "You can only add winners for your own quests",
        error: null,
      };
    }

    // Validate that quest doesn't already have winners
    if (quest.questWinner) {
      return {
        data: null,
        message: "Quest already has winners assigned",
        error: null,
      };
    }

    // Validate that all winner addresses exist
    const validWinners: string[] = [];
    for (const address of winnerAddresses) {
      const user = await getUserByAddress(address);
      if (user) {
        validWinners.push(address);
      }
    }

    if (validWinners.length === 0) {
      return {
        data: null,
        message: "No valid winner addresses provided",
        error: null,
      };
    }

    // Update quest with winners (store as comma-separated string)
    const winnersString = validWinners.join(",");
    const updatedQuest = await updateQuestWinner(questId, winnersString);

    if (!updatedQuest) {
      return {
        data: null,
        message: "Failed to update quest winners",
        error: null,
      };
    }

    // Create reward entries for all winners
    const rewardEntries: RewardInsertSchema[] = validWinners.map((address) => ({
      userAddress: address,
      tokenAddress: quest.rewardToken,
      tokenSymbol: quest.rewardSymbol,
      tokenAmount: quest.rewardAmount,
      eventType: 'SOCIAL_QUEST' as const,
    }));

    const createdRewards = await createMultipleRewards(rewardEntries);

    return {
      data: {
        quest: updatedQuest,
        rewardsCreated: createdRewards.length,
      },
      message: `Quest winners updated successfully. ${createdRewards.length} reward entries created.`,
      error: null,
    };
  } catch (error) {
    console.error("Error adding quest winners:", error);
    return {
      data: null,
      message: "Failed to add quest winners",
      error: error,
    };
  }
};

export default addQuestWinnersService;

