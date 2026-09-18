import type {
  UserSearch,
} from "./user-search.schema";

export type UserSortBy =
  UserSearch["sortBy"];

export type SortOrder =
  UserSearch["sortOrder"];

export type PageSize =
  UserSearch["pageSize"];

export type UsersQueryParams =
  UserSearch;