export type UserSortBy = "name" | "email" | "createdAt";

export type SortOrder = "asc" | "desc";

export interface UsersQueryParams {
  page: number;
  pageSize: number;
  search?: string;

  sortBy: UserSortBy;
  sortOrder: SortOrder;
}
