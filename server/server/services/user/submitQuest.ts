import { createQuestSubmission, checkExistingSubmission } from "../../db/queries/questSubmissions";
import { getSocialQuestById } from "../../db/queries/socialQuests";
import { getUserByAddress } from "../../db/queries/users";
import type { QuestSubmissionSelectSchema } from "../../db/zodSchemaAndTypes";

export interface SubmitQuestData {
  questId: string;
  userAddress: string;
  submissionLink: string;
}

export const submitQuestService = async (data: SubmitQuestData): Promise<{
  data: QuestSubmissionSelectSchema | null;
  message: string;
  error: any;
}> => {
  try {
    const { questId, userAddress, submissionLink } = data;

    // Validate that the user exists
    const user = await getUserByAddress(userAddress);
    if (!user) {
      return {
        data: null,
        message: "User not found",
        error: null,
      };
    }

    // Validate that the quest exists and is active
    const quest = await getSocialQuestById(questId);
    if (!quest) {
      return {
        data: null,
        message: "Quest not found",
        error: null,
      };
    }

    if (!quest.isActive) {
      return {
        data: null,
        message: "Quest is no longer active",
        error: null,
      };
    }

    // Check if user has already submitted for this quest
    const existingSubmission = await checkExistingSubmission(userAddress, questId);
    if (existingSubmission) {
      return {
        data: null,
        message: "You have already submitted for this quest",
        error: null,
      };
    }

    // Create the submission
    const submission = await createQuestSubmission({
      address: userAddress,
      questId,
      submissionLink,
    });

    return {
      data: submission,
      message: "Quest submission created successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error submitting quest:", error);
    return {
      data: null,
      message: "Failed to submit quest",
      error: error,
    };
  }
};

export default submitQuestService;
