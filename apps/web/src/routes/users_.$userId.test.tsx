import {
  afterEach,
  expect,
  test,
  mock
} from "bun:test";

import userEvent from "@testing-library/user-event";

import { userQueryOptions } from "@/features/users/api/user.queries";
import {
  mockFetchWithHandler,
} from "@/test/mock-fetch";

import {
  renderRouter,
} from "@/test/render-router";
import { waitFor } from "@testing-library/react";


const originalFetch =
  globalThis.fetch;

const originalConfirm =
  window.confirm;

const originalConsoleError =
  console.error;

afterEach(() => {
  globalThis.fetch =
    originalFetch;

  window.confirm =
    originalConfirm;

  console.error =
      originalConsoleError;
});

test("renders user detail returned by the API", async () => {
  mockFetchWithHandler(
    async (request) => {
      const url =
        new URL(request.url);

      if (
        request.method === "GET" &&
        url.pathname.endsWith(
          "/api/v1/users/user-1",
        )
      ) {
        return Response.json({
          data: {
            id: "user-1",
            name: "John Doe",
            email:
              "john@example.com",
            createdAt:
              "2026-09-18T00:00:00.000Z",
            updatedAt:
              "2026-09-18T00:00:00.000Z",
          },
        });
      }

      return new Response(
        null,
        {
          status: 404,
        },
      );
    },
  );

  const {
    findByDisplayValue,
    findByRole,
  } = renderRouter({
    initialEntry:
      "/users/user-1",
  });

  /*
   * Detail page berhasil load.
   */
  expect(
    await findByDisplayValue(
      "John Doe",
    ),
  ).toBeInTheDocument();

  expect(
    await findByDisplayValue(
      "john@example.com",
    ),
  ).toBeInTheDocument();

  /*
   * Form edit tersedia.
   */
  expect(
    await findByRole(
      "button",
      {
        name: "Update user",
      },
    ),
  ).toBeInTheDocument();

  /*
   * Delete action tersedia.
   */
  expect(
    await findByRole(
      "button",
      {
        name: "Delete user",
      },
    ),
  ).toBeInTheDocument();
});

test("updates user successfully", async () => {
  const user = userEvent.setup();

  const userId =
    "11111111-1111-4111-8111-111111111111";

  let patchBody: unknown;

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    /*
     * Initial user detail.
     */
    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json({
        data: {
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",
          updatedAt:
            "2026-09-18T00:00:00.000Z",
        },
      });
    }

    /*
     * Update user.
     */
    if (
      request.method === "PATCH" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      patchBody =
        await request.json();

      return Response.json({
        data: {
          id: userId,
          name: "John Smith",
          email: "john.smith@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",

          /*
           * Response server terbaru.
           */
          updatedAt:
            "2026-09-20T01:00:00.000Z",
        },
      });
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByDisplayValue,
    getByLabelText,
    getByRole,
    queryClient,
  } = renderRouter({
    initialEntry:
      `/users/${userId}`,
  });

  /*
   * Tunggu initial detail selesai.
   */
  expect(
    await findByDisplayValue(
      "John Doe",
    ),
  ).toBeInTheDocument();

  expect(
    await findByDisplayValue(
      "john@example.com",
    ),
  ).toBeInTheDocument();

  const nameInput =
    getByLabelText(
      "Name",
    ) as HTMLInputElement;

  const emailInput =
    getByLabelText(
      "Email",
    ) as HTMLInputElement;

  /*
   * Edit user.
   */
  await user.clear(
    nameInput,
  );

  await user.type(
    nameInput,
    "John Smith",
  );

  await user.clear(
    emailInput,
  );

  await user.type(
    emailInput,
    "john.smith@example.com",
  );

  /*
   * Submit update.
   *
   * Sesuaikan nama button jika
   * submitLabel-mu berbeda.
   */
  await user.click(
    getByRole("button", {
      name: /update user|save changes/i,
    }),
  );

  /*
   * PATCH harus membawa input baru.
   */
  expect(
    patchBody,
  ).toEqual({
    name: "John Smith",
    email:
      "john.smith@example.com",
  });

  /*
   * Input tetap menampilkan perubahan.
   */
  expect(
    nameInput,
  ).toHaveValue(
    "John Smith",
  );

  expect(
    emailInput,
  ).toHaveValue(
    "john.smith@example.com",
  );

  /*
   * Cache detail harus menggunakan
   * response authoritative dari server.
   */
  const detailOptions =
    userQueryOptions(userId);

  const cachedUser =
    queryClient.getQueryData(
      detailOptions.queryKey,
    );

  expect(
    cachedUser,
  ).toEqual({
    id: userId,
    name: "John Smith",
    email:
      "john.smith@example.com",
    createdAt:
      "2026-09-18T00:00:00.000Z",
    updatedAt:
      "2026-09-20T01:00:00.000Z",
  });
});

test("rolls back optimistic update when update fails", async () => {
  const user = userEvent.setup();

  const userId =
    "11111111-1111-4111-8111-111111111111";

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json({
        data: {
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",
          updatedAt:
            "2026-09-18T00:00:00.000Z",
        },
      });
    }

    if (
      request.method === "PATCH" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user",
            requestId: "request-update-1",
          },
        },
        {
          status: 500,
        },
      );
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByDisplayValue,
    findByText,
    getByLabelText,
    getByRole,
    queryClient,
  } = renderRouter({
    initialEntry:
      `/users/${userId}`,
  });

  /*
   * Initial detail.
   */
  expect(
    await findByDisplayValue(
      "John Doe",
    ),
  ).toBeInTheDocument();

  const nameInput =
    getByLabelText(
      "Name",
    ) as HTMLInputElement;

  const emailInput =
    getByLabelText(
      "Email",
    ) as HTMLInputElement;

  const detailOptions =
    userQueryOptions(userId);

  /*
   * Pastikan cache awal benar.
   */
  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toMatchObject({
    id: userId,
    name: "John Doe",
    email: "john@example.com",
  });

  /*
   * Edit form.
   */
  await user.clear(nameInput);

  await user.type(
    nameInput,
    "John Smith",
  );

  await user.clear(emailInput);

  await user.type(
    emailInput,
    "john.smith@example.com",
  );

  /*
   * Submit PATCH.
   */
  await user.click(
    getByRole("button", {
      name: /update user|save changes/i,
    }),
  );

  /*
   * Error harus tampil.
   */
  expect(
    await findByText(
      "Failed to update user",
    ),
  ).toBeInTheDocument();

  /*
   * Cache harus rollback
   * ke data sebelum mutation.
   */
  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toMatchObject({
    id: userId,
    name: "John Doe",
    email: "john@example.com",
    updatedAt:
      "2026-09-18T00:00:00.000Z",
  });

  /*
   * Draft form user jangan ikut di-reset.
   *
   * Cache rollback ≠ form rollback.
   */
  expect(
    nameInput,
  ).toHaveValue(
    "John Smith",
  );

  expect(
    emailInput,
  ).toHaveValue(
    "john.smith@example.com",
  );
});

test("shows duplicate email error and rolls back cache", async () => {
  const user = userEvent.setup();

  const userId =
    "11111111-1111-4111-8111-111111111111";

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json({
        data: {
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",
          updatedAt:
            "2026-09-18T00:00:00.000Z",
        },
      });
    }

    if (
      request.method === "PATCH" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json(
        {
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email already exists",
            fields: {
              email: "Email already exists",
            },
            requestId: "request-update-duplicate",
          },
        },
        {
          status: 409,
        },
      );
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByDisplayValue,
    findByText,
    getByLabelText,
    getByRole,
    queryByText,
    queryClient,
  } = renderRouter({
    initialEntry:
      `/users/${userId}`,
  });

  /*
   * Initial detail.
   */
  expect(
    await findByDisplayValue(
      "John Doe",
    ),
  ).toBeInTheDocument();

  const nameInput =
    getByLabelText(
      "Name",
    ) as HTMLInputElement;

  const emailInput =
    getByLabelText(
      "Email",
    ) as HTMLInputElement;

  const detailOptions =
    userQueryOptions(userId);

  /*
   * Edit form.
   */
  await user.clear(nameInput);

  await user.type(
    nameInput,
    "John Smith",
  );

  await user.clear(emailInput);

  await user.type(
    emailInput,
    "duplicate@example.com",
  );

  /*
   * Submit update.
   */
  await user.click(
    getByRole("button", {
      name: /update user|save changes/i,
    }),
  );

  /*
   * Error duplicate harus tampil
   * inline di field email.
   */
  expect(
    await findByText(
      "Email already exists",
    ),
  ).toBeInTheDocument();

  /*
   * Cache harus rollback.
   */
  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toMatchObject({
    id: userId,
    name: "John Doe",
    email: "john@example.com",
    updatedAt:
      "2026-09-18T00:00:00.000Z",
  });

  /*
   * Draft form tetap dipertahankan.
   */
  expect(
    nameInput,
  ).toHaveValue(
    "John Smith",
  );

  expect(
    emailInput,
  ).toHaveValue(
    "duplicate@example.com",
  );

  /*
   * User memperbaiki email.
   */
  await user.clear(emailInput);

  await user.type(
    emailInput,
    "john.smith@example.com",
  );

  expect(
    emailInput,
  ).toHaveValue(
    "john.smith@example.com",
  );

  /*
   * Server error lama hilang
   * setelah field diedit.
   */
  await waitFor(
    () => {
      expect(
        queryByText(
          "Email already exists",
        ) === null,
      ).toBe(true);
    },
    {
      timeout: 1000,
    },
  );
});

test("deletes user and navigates back to users list", async () => {
  const user = userEvent.setup();

  const userId =
    "11111111-1111-4111-8111-111111111111";

  let deleteCalled = false;

  window.confirm = () => true;

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    /*
     * Initial detail.
     */
    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json({
        data: {
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",
          updatedAt:
            "2026-09-18T00:00:00.000Z",
        },
      });
    }

    /*
     * Delete user.
     */
    if (
      request.method === "DELETE" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      deleteCalled = true;

      return Response.json({
        data: {
          id: userId,
        },
      });
    }

    /*
     * Setelah delete berhasil,
     * router pindah ke /users.
     *
     * Loader list akan melakukan GET.
     */
    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        "/api/v1/users",
      )
    ) {
      return Response.json({
        data: [
          {
            id:
              "22222222-2222-4222-8222-222222222222",
            name: "Jane Doe",
            email:
              "jane@example.com",
            createdAt:
              "2026-09-18T00:00:00.000Z",
            updatedAt:
              "2026-09-18T00:00:00.000Z",
          },
        ],

        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      });
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByDisplayValue,
    findByText,
    getByRole,
    queryClient,
    router,
  } = renderRouter({
    initialEntry:
      `/users/${userId}`,
  });

  /*
   * Tunggu detail selesai load.
   */
  expect(
    await findByDisplayValue(
      "John Doe",
    ),
  ).toBeInTheDocument();

  const detailOptions =
    userQueryOptions(userId);

  /*
   * Sebelum delete, detail ada
   * di query cache.
   */
  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toMatchObject({
    id: userId,
    name: "John Doe",
  });

  /*
   * Klik Delete.
   */
  await user.click(
    getByRole("button", {
      name: /delete/i,
    }),
  );

  /*
   * DELETE harus terkirim.
   */
  expect(
    deleteCalled,
  ).toBe(true);

  /*
   * Detail query harus dihapus
   * dari cache.
   */
  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toBeUndefined();

  /*
   * Router harus kembali ke
   * halaman users.
   */
  await waitFor(
    () => {
      expect(
        router.state.location.pathname ===
          "/users",
      ).toBe(true);
    },
    {
      timeout: 1000,
    },
  );

  /*
   * User list baru tampil.
   */
  expect(
    await findByText(
      "Jane Doe",
    ),
  ).toBeInTheDocument();

  /*
   * Restore confirm agar tidak
   * memengaruhi test berikutnya.
   */
  window.confirm = () => true;
});

test("does not delete user when confirmation is cancelled", async () => {
  const user = userEvent.setup();

  const userId =
    "11111111-1111-4111-8111-111111111111";

  let deleteCalled = false;

  window.confirm = () => false;

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json({
        data: {
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",
          updatedAt:
            "2026-09-18T00:00:00.000Z",
        },
      });
    }

    if (
      request.method === "DELETE" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      deleteCalled = true;

      return Response.json({
        data: {
          id: userId,
        },
      });
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByDisplayValue,
    getByRole,
    queryClient,
    router,
  } = renderRouter({
    initialEntry:
      `/users/${userId}`,
  });

  expect(
    await findByDisplayValue(
      "John Doe",
    ),
  ).toBeInTheDocument();

  const detailOptions =
    userQueryOptions(userId);

  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toMatchObject({
    id: userId,
    name: "John Doe",
  });

  await user.click(
    getByRole("button", {
      name: /delete/i,
    }),
  );

  expect(
    deleteCalled,
  ).toBe(false);

  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toMatchObject({
    id: userId,
    name: "John Doe",
  });

  expect(
    router.state.location.pathname,
  ).toBe(
    `/users/${userId}`,
  );
});

test("keeps user detail when delete fails", async () => {
  const user = userEvent.setup();

  const userId =
    "11111111-1111-4111-8111-111111111111";

  window.confirm = () => true;

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json({
        data: {
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",
          updatedAt:
            "2026-09-18T00:00:00.000Z",
        },
      });
    }

    if (
      request.method === "DELETE" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete user",
            requestId: "request-delete-1",
          },
        },
        {
          status: 500,
        },
      );
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByDisplayValue,
    findByText,
    getByRole,
    queryClient,
    router,
  } = renderRouter({
    initialEntry:
      `/users/${userId}`,
  });

  /*
   * Initial detail selesai.
   */
  expect(
    await findByDisplayValue(
      "John Doe",
    ),
  ).toBeInTheDocument();

  const detailOptions =
    userQueryOptions(userId);

  /*
   * Cache detail tersedia sebelum delete.
   */
  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toMatchObject({
    id: userId,
    name: "John Doe",
    email: "john@example.com",
  });

  /*
   * User menyetujui delete.
   */
  await user.click(
    getByRole("button", {
      name: /delete/i,
    }),
  );

  /*
   * Error delete harus terlihat.
   *
   * Sesuaikan text ini dengan
   * implementasi UI detail-mu.
   */
  expect(
    await findByText(
      "Failed to delete user",
    ),
  ).toBeInTheDocument();

  /*
   * Route tidak boleh pindah.
   */
  expect(
    router.state.location.pathname,
  ).toBe(
    `/users/${userId}`,
  );

  /*
   * Cache detail tetap ada.
   */
  expect(
    queryClient.getQueryData(
      detailOptions.queryKey,
    ),
  ).toMatchObject({
    id: userId,
    name: "John Doe",
    email: "john@example.com",
  });
});

test("renders not found state when user does not exist", async () => {
  const userId =
    "11111111-1111-4111-8111-111111111111";

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      return Response.json(
        {
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
            requestId:
              "request-not-found",
          },
        },
        {
          status: 404,
        },
      );
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByRole,
    findByText,
  } = renderRouter({
    initialEntry:
      `/users/${userId}`,
  });

  expect(
    await findByRole(
      "heading",
      {
        name: "User not found",
      },
    ),
  ).toBeInTheDocument();

  expect(
    await findByText(
      "The user you are looking for does not exist.",
    ),
  ).toBeInTheDocument();

  expect(
    await findByRole(
      "link",
      {
        name: "Back to users",
      },
    ),
  ).toBeInTheDocument();
});

test("renders error state when loading user fails", async () => {
  const originalConsoleError =
    console.error;

  console.error = mock(() => {});

  try {
    const userId =
      "11111111-1111-4111-8111-111111111111";

    mockFetchWithHandler(async (request) => {
      const url = new URL(request.url);

      if (
        request.method === "GET" &&
        url.pathname.endsWith(
          `/api/v1/users/${userId}`,
        )
      ) {
        return Response.json(
          {
            error: {
              code:
                "INTERNAL_SERVER_ERROR",
              message:
                "Unable to fetch user details",
              requestId:
                "request-detail-error",
            },
          },
          {
            status: 500,
          },
        );
      }

      return new Response(null, {
        status: 404,
      });
    });

    const {
      findByRole,
      findByText,
    } = renderRouter({
      initialEntry:
        `/users/${userId}`,
    });

    expect(
      await findByRole("heading", {
        name: "Failed to load user",
      }),
    ).toBeInTheDocument();

    expect(
      await findByText(
        "Unable to fetch user details",
      ),
    ).toBeInTheDocument();
  } finally {
    console.error =
      originalConsoleError;
  }
});


test("retries loading user after an error", async () => {
  console.error = mock(() => {});

  const user = userEvent.setup();

  const userId =
    "11111111-1111-4111-8111-111111111111";

  let getUserCount = 0;

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname.endsWith(
        `/api/v1/users/${userId}`,
      )
    ) {
      getUserCount += 1;

      if (getUserCount === 1) {
        return Response.json(
          {
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Unable to fetch user details",
              requestId: "request-retry-1",
            },
          },
          {
            status: 500,
          },
        );
      }

      return Response.json({
        data: {
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",
          updatedAt:
            "2026-09-18T00:00:00.000Z",
        },
      });
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByDisplayValue,
    findByRole,
    findByText,
    queryByText,
  } = renderRouter({
    initialEntry:
      `/users/${userId}`,
  });

  expect(
    await findByRole("heading", {
      name: "Failed to load user",
    }),
  ).toBeInTheDocument();

  expect(
    await findByText(
      "Unable to fetch user details",
    ),
  ).toBeInTheDocument();

  expect(getUserCount).toBe(1);

  await user.click(
    await findByRole("button", {
      name: "Try again",
    }),
  );

  expect(
    await findByDisplayValue(
      "John Doe",
    ),
  ).toBeInTheDocument();

  expect(
    await findByDisplayValue(
      "john@example.com",
    ),
  ).toBeInTheDocument();

  expect(getUserCount).toBe(2);

  expect(
    queryByText(
      "Unable to fetch user details",
    ) === null,
  ).toBe(true);
});
