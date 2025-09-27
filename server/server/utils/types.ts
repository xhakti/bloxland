export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginationResponse = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

