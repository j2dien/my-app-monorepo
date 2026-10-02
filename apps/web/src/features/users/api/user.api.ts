import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UsersQueryParams,
  UsersResponse,
} from "@app/contracts";

import { api } from "@/lib/api/client";
import { createApiError } from "@/lib/api/api-error";

export async function getUsers(
  params: UsersQueryParams,
): Promise<UsersResponse> {
  const response = await api.api.v1.users.$get({
    query: {
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.search
        ? { search: params.search }
        : {}),
      ...(params.sortBy
        ? { sortBy: params.sortBy }
        : {}),
      ...(params.sortOrder
        ? { sortOrder: params.sortOrder }
        : {}),
    },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

export async function getUser(
  userId: string,
): Promise<User> {
  const response =
    await api.api.v1.users[":id"].$get({
      param: {
        id: userId,
      },
    });

  if (!response.ok) {
    throw await createApiError(response);
  }

  const result = await response.json();

  return result.data;
}

export async function createUser(
  input: CreateUserInput,
): Promise<User> {
  const response =
    await api.api.v1.users.$post({
      json: input,
    });

  if (!response.ok) {
    throw await createApiError(response);
  }

  const result = await response.json();

  return result.data;
}

interface UpdateUserVariables {
  userId: string;
  input: UpdateUserInput;
}

export async function updateUser({
  userId,
  input,
}: UpdateUserVariables): Promise<User> {
  const response =
    await api.api.v1.users[":id"].$patch({
      param: {
        id: userId,
      },
      json: input,
    });

  if (!response.ok) {
    throw await createApiError(response);
  }

  const result = await response.json();

  return result.data;
}

export async function deleteUser(
  userId: string,
): Promise<void> {
  const response =
    await api.api.v1.users[":id"].$delete({
      param: {
        id: userId,
      },
    });

  if (!response.ok) {
    throw await createApiError(response);
  }
}