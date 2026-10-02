import { queryOptions } from "@tanstack/react-query";

import type { UsersQueryParams } from "@app/contracts";

import {
  getUser,
  getUsers,
} from "./user.api";
import { userKeys } from "./user.keys";

export function usersQueryOptions(
  params: UsersQueryParams,
) {
  return queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  });
}

export function userQueryOptions(
  userId: string,
) {
  return queryOptions({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUser(userId),
  });
}