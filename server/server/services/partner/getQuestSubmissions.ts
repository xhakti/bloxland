import { getSubmissionsByQuest, getQuestSubmissionsCount } from "../../db/queries/questSubmissions";
import { getSocialQuestById } from "../../db/queries/socialQuests";
import { validatePartnerUser } from "../../db/queries/users";
import { calculatePagination } from "../../utils/pagination";
import type { PaginationParams, PaginationResponse } from "../../utils/types";

export const getQuestSubmissionsService = async (
  questId: string,
  partnerAddress: string,
  params: PaginationParams
): Promise<{
  data: {
    submissions: any[];
    pagination: PaginationResponse;
  } | null;
  message: string;
  error: any;
}> => {
  try {
    // Validate that the user is a partner
    const isPartner = await validatePartnerUser(partnerAddress);
    if (!isPartner) {
      return {
        data: null,
        message: "Only partners can view quest submissions",
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
        message: "You can only view submissions for your own quests",
        error: null,
      };
    }

    // Get total count and calculate pagination
    const totalCount = await getQuestSubmissionsCount(questId);
    const paginationData = calculatePagination(params, totalCount);

    // Get submissions with user details
    const submissions = await getSubmissionsByQuest(questId, paginationData.limit, paginationData.offset);

    return {
      data: {
        submissions,
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
          totalCount: paginationData.totalCount,
          totalPages: paginationData.totalPages,
          hasNextPage: paginationData.hasNextPage,
          hasPrevPage: paginationData.hasPrevPage,
        },
      },
      message: "Quest submissions fetched successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error fetching quest submissions:", error);
    return {
      data: null,
      message: "Failed to fetch quest submissions",
      error: error,
    };
  }
};

export default getQuestSubmissionsService;
