import { getSocialQuestsByPartner, getPartnerQuestsCount } from "../../db/queries/socialQuests";
import { validatePartnerUser } from "../../db/queries/users";
import { calculatePagination } from "../../utils/pagination";
import type { SocialQuestSelectSchema } from "../../db/zodSchemaAndTypes";
import type { PaginationParams, PaginationResponse } from "../../utils/types";

export const getPartnerQuestsService = async (
  partnerAddress: string,
  params: PaginationParams
): Promise<{
  data: {
    quests: SocialQuestSelectSchema[];
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
        message: "Only partners can view their quests",
        error: null,
      };
    }

    // Get total count and calculate pagination
    const totalCount = await getPartnerQuestsCount(partnerAddress);
    const paginationData = calculatePagination(params, totalCount);

    // Get quests
    const quests = await getSocialQuestsByPartner(partnerAddress, paginationData.limit, paginationData.offset);

    return {
      data: {
        quests,
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
          totalCount: paginationData.totalCount,
          totalPages: paginationData.totalPages,
          hasNextPage: paginationData.hasNextPage,
          hasPrevPage: paginationData.hasPrevPage,
        },
      },
      message: "Partner quests fetched successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error fetching partner quests:", error);
    return {
      data: null,
      message: "Failed to fetch partner quests",
      error: error,
    };
  }
};

export default getPartnerQuestsService;
