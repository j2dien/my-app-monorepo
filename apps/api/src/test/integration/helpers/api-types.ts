type UserDto = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type UserPayload = {
  name: string;
  email: string;
};

export type UsersListResponse = {
  data: UserDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApiErrorResponse = {
  error: {
    code: string
    message: string
    fields?: Record<string, string>
    requestId?: string
  }
}

export type UserResponse = {
  data: UserDto
}

export type CreateUserResponse = {
  data: UserPayload
}