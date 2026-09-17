export type UserSortBy = "name" | "email" | "createdAt";

export type SortOrder = "asc" | "desc";

export type PageSize =
  | 10
  | 20
  | 50
  | 100;

export interface UsersQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy: UserSortBy;
  sortOrder: SortOrder;
}
