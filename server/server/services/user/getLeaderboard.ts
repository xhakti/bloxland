import { getLeaderboard, getTotalUsersCount } from "../../db/queries/users";
import { calculatePagination } from "../../utils/pagination";
import type { UserSelectSchema } from "../../db/zodSchemaAndTypes";
import type { PaginationParams, PaginationResponse } from "../../utils/types";

export const getLeaderboardService = async (
  params: PaginationParams
): Promise<{
  data: {
    users: UserSelectSchema[];
    pagination: PaginationResponse;
  } | null;
  message: string;
  error: any;
}> => {
  try {
    const totalCount = await getTotalUsersCount();
    const paginationData = calculatePagination(params, totalCount);
    
    const users = await getLeaderboard(paginationData.limit, paginationData.offset);

    return {
      data: {
        users,
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
          totalCount: paginationData.totalCount,
          totalPages: paginationData.totalPages,
          hasNextPage: paginationData.hasNextPage,
          hasPrevPage: paginationData.hasPrevPage,
        },
      },
      message: "Leaderboard fetched successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return {
      data: null,
      message: "Failed to fetch leaderboard",
      error: error,
    };
  }
};

export default getLeaderboardService;
