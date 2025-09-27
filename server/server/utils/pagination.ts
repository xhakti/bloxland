import { PaginationParams, PaginationResponse } from "./types";

export function calculatePagination(
  params: PaginationParams,
  totalCount: number
): PaginationResponse & { offset: number } {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    offset,
  };
}

