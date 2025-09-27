import { createSocialQuest } from "../../db/queries/socialQuests";
import { validatePartnerUser } from "../../db/queries/users";
import type { SocialQuestSelectSchema, SocialQuestInsertSchema } from "../../db/zodSchemaAndTypes";

export interface AddSocialQuestData {
  partnerAddress: string;
  rewardToken: string;
  rewardAmount: string;
  rewardSymbol: string;
  questLocation: string;
  energyToBeBurned: string;
  questName: string;
  questDescription: string;
  partnerName: string;
}

export const addSocialQuestService = async (data: AddSocialQuestData): Promise<{
  data: SocialQuestSelectSchema | null;
  message: string;
  error: any;
}> => {
  try {
    const {
      partnerAddress,
      rewardToken,
      rewardAmount,
      rewardSymbol,
      questLocation,
      energyToBeBurned,
      questName,
      questDescription,
      partnerName,
    } = data;

    // Validate that the user is a partner
    const isPartner = await validatePartnerUser(partnerAddress);
    if (!isPartner) {
      return {
        data: null,
        message: "Only partners can create social quests",
        error: null,
      };
    }

    // Validate reward amount is positive
    const amount = parseFloat(rewardAmount);
    if (isNaN(amount) || amount <= 0) {
      return {
        data: null,
        message: "Invalid reward amount",
        error: null,
      };
    }

    // Validate energy amount is positive
    const energy = parseFloat(energyToBeBurned);
    if (isNaN(energy) || energy <= 0) {
      return {
        data: null,
        message: "Invalid energy amount",
        error: null,
      };
    }

    // Create the quest
    const questData: SocialQuestInsertSchema = {
      partnerAddress,
      rewardToken,
      rewardAmount,
      rewardSymbol,
      questLocation,
      energyToBeBurned,
      questName,
      questDescription,
      partnerName,
      isActive: true,
    };

    const quest = await createSocialQuest(questData);

    return {
      data: quest,
      message: "Social quest created successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error creating social quest:", error);
    return {
      data: null,
      message: "Failed to create social quest",
      error: error,
    };
  }
};

export default addSocialQuestService;
