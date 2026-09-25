import { afterEach, expect, test } from "bun:test";
import userEvent from "@testing-library/user-event";

import { renderRouter } from "@/test/render-router";
import { mockJsonFetch, mockFetchWithHandler } from "@/test/mock-fetch";
import { waitFor } from "@testing-library/react";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const usersResponse = {
  data: [
    {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      createdAt: "2026-09-18T00:00:00.000Z",
      updatedAt: "2026-09-18T00:00:00.000Z",
    },
    {
      id: "user-2",
      name: "Jane Doe",
      email: "jane@example.com",
      createdAt: "2026-09-18T00:00:00.000Z",
      updatedAt: "2026-09-18T00:00:00.000Z",
    },
  ],

  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    totalPages: 1,
  },
};

test("renders users returned by the API", async () => {
  mockJsonFetch(usersResponse);

  const { findByText } = renderRouter({
    initialEntry: "/users?page=1&pageSize=20",
  });

  expect(await findByText("John Doe")).toBeInTheDocument();

  expect(await findByText("john@example.com")).toBeInTheDocument();

  expect(await findByText("Jane Doe")).toBeInTheDocument();

  expect(await findByText("jane@example.com")).toBeInTheDocument();
});

test("renders users page heading", async () => {
  mockJsonFetch(usersResponse);

  const { findByRole } = renderRouter({
    initialEntry: "/users?page=1&pageSize=20",
  });

  expect(
    await findByRole("heading", {
      name: "Users",
    }),
  ).toBeInTheDocument();
});

test("renders pagination information", async () => {
  mockJsonFetch(usersResponse);

  const { findByText } = renderRouter({
    initialEntry: "/users?page=1&pageSize=20",
  });

  expect(await findByText("2 users")).toBeInTheDocument();

  expect(await findByText("Page 1 of 1")).toBeInTheDocument();
});

test("renders empty state when API returns no users", async () => {
  mockJsonFetch({
    data: [],

    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },
  });

  const { findByText } = renderRouter({
    initialEntry: "/users?page=1&pageSize=20",
  });

  expect(await findByText("No users yet")).toBeInTheDocument();

  expect(
    await findByText("Create your first user using the form."),
  ).toBeInTheDocument();
});

test("renders no results state when search returns no users", async () => {
  mockJsonFetch({
    data: [],

    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },
  });

  const { findByText, findByRole } = renderRouter({
    initialEntry: "/users?page=1&pageSize=20&search=unknown",
  });

  expect(await findByText("No users found")).toBeInTheDocument();

  expect(await findByText('No users match "unknown".')).toBeInTheDocument();

  expect(
    await findByRole("button", {
      name: "Clear search",
    }),
  ).toBeInTheDocument();
});

test("searches users after debounce", async () => {
  const user = userEvent.setup();

  const requestedUrls: string[] = [];

  mockFetchWithHandler(async (request) => {
    requestedUrls.push(request.url);

    const url = new URL(request.url);

    const search = url.searchParams.get("search");

    if (search === "john") {
      return Response.json({
        data: [
          {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            createdAt: "2026-09-18T00:00:00.000Z",
            updatedAt: "2026-09-18T00:00:00.000Z",
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

    return Response.json({
      data: [
        {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          createdAt: "2026-09-18T00:00:00.000Z",
          updatedAt: "2026-09-18T00:00:00.000Z",
        },

        {
          id: "user-2",
          name: "Jane Doe",
          email: "jane@example.com",
          createdAt: "2026-09-18T00:00:00.000Z",
          updatedAt: "2026-09-18T00:00:00.000Z",
        },
      ],

      pagination: {
        page: 1,
        pageSize: 20,
        total: 2,
        totalPages: 1,
      },
    });
  });

  const { findByText, getByRole, queryByText, getByText, router } =
    renderRouter({
      initialEntry: "/users?page=1&pageSize=20",
    });

  /*
   * Pastikan initial request selesai.
   */
  expect(await findByText("Jane Doe")).toBeInTheDocument();

  const searchInput = getByRole("searchbox");

  await user.type(searchInput, "john");

  await waitFor(
    () => {
      if (queryByText("Jane Doe") !== null) {
        throw new Error("Jane Doe is still visible");
      }
    },
    {
      timeout: 1500,
    },
  );

  /*
   * Tunggu debounce + navigation +
   * query selesai.
   */
  expect(getByText("John Doe")).toBeInTheDocument();

  /*
   * URL router harus ikut berubah.
   */
  expect(router.state.location.search).toMatchObject({
    page: 1,
    pageSize: 20,
    search: "john",
  });

  /*
   * Pastikan API memang menerima
   * search=john.
   */
  expect(
    requestedUrls.some((requestUrl) => {
      const url = new URL(requestUrl);

      return url.searchParams.get("search") === "john";
    }),
  ).toBe(true);
});

test("clears search and restores the full user list", async () => {
  const user = userEvent.setup();

  const requestedUrls: string[] = [];

  mockFetchWithHandler(async (request) => {
    requestedUrls.push(request.url);

    const url = new URL(request.url);

    const search = url.searchParams.get("search");

    if (search === "john") {
      return Response.json({
        data: [
          {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            createdAt: "2026-09-18T00:00:00.000Z",
            updatedAt: "2026-09-18T00:00:00.000Z",
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

    return Response.json(usersResponse);
  });

  const { findByText, getByRole, queryByText, router } = renderRouter({
    initialEntry: "/users?page=1&pageSize=20",
  });

  /*
   * Tunggu initial list selesai.
   */
  expect(await findByText("Jane Doe")).toBeInTheDocument();

  const searchInput = getByRole("searchbox");

  /*
   * Search "john".
   */
  await user.type(searchInput, "john");

  /*
   * Tunggu sampai hasil search
   * menggantikan initial list.
   */
  await waitFor(
    () => {
      expect(queryByText("Jane Doe") === null).toBe(true);
    },
    {
      timeout: 1500,
    },
  );

  /*
   * Pastikan John tetap terlihat.
   */
  expect(queryByText("John Doe") !== null).toBe(true);

  /*
   * URL harus memiliki search=john.
   */
  expect(router.state.location.search).toMatchObject({
    page: 1,
    pageSize: 20,
    search: "john",
  });

  /*
   * Pastikan request search=john
   * memang pernah dikirim.
   */
  function getSearchParam(requestUrl: string) {
    return new URL(requestUrl).searchParams.get("search");
  }

  const johnRequestIndex = requestedUrls.findIndex(
    (requestUrl) => getSearchParam(requestUrl) === "john",
  );

  expect(johnRequestIndex).toBeGreaterThanOrEqual(0);

  /*
   * Clear search dengan menghapus seluruh
   * teks dari input.
   */
  await user.clear(searchInput);

  /*
   * Full list harus kembali.
   *
   * Data ini bisa berasal dari
   * TanStack Query cache, jadi kita
   * tidak mewajibkan request baru.
   */
  expect(await findByText("Jane Doe")).toBeInTheDocument();

  expect(await findByText("John Doe")).toBeInTheDocument();

  /*
   * URL search param harus hilang.
   */
  await waitFor(
    () => {
      expect(router.state.location.search.search === undefined).toBe(true);
    },
    {
      timeout: 1000,
    },
  );

  /*
   * Input harus kembali kosong.
   */
  expect(getByRole("searchbox")).toHaveValue("");
});

test("navigates to the next page and renders page 2 users", async () => {
  const user = userEvent.setup();

  const requestedUrls: string[] = [];

  mockFetchWithHandler(async (request) => {
    requestedUrls.push(request.url);

    const url = new URL(request.url);

    const page = Number(
      url.searchParams.get("page") ?? "1",
    );

    if (page === 2) {
      return Response.json({
        data: [
          {
            id: "user-3",
            name: "Alice Smith",
            email: "alice@example.com",
            createdAt: "2026-09-18T00:00:00.000Z",
            updatedAt: "2026-09-18T00:00:00.000Z",
          },
          {
            id: "user-4",
            name: "Bob Smith",
            email: "bob@example.com",
            createdAt: "2026-09-18T00:00:00.000Z",
            updatedAt: "2026-09-18T00:00:00.000Z",
          },
        ],

        pagination: {
          page: 2,
          pageSize: 20,
          total: 4,
          totalPages: 2,
        },
      });
    }

    return Response.json({
      data: [
        {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          createdAt: "2026-09-18T00:00:00.000Z",
          updatedAt: "2026-09-18T00:00:00.000Z",
        },
        {
          id: "user-2",
          name: "Jane Doe",
          email: "jane@example.com",
          createdAt: "2026-09-18T00:00:00.000Z",
          updatedAt: "2026-09-18T00:00:00.000Z",
        },
      ],

      pagination: {
        page: 1,
        pageSize: 20,
        total: 4,
        totalPages: 2,
      },
    });
  });

  const {
    findByText,
    getByRole,
    queryByText,
    router,
  } = renderRouter({
    initialEntry: "/users?page=1&pageSize=20",
  });

  /*
   * Tunggu page 1 selesai.
   */
  expect(
    await findByText("Jane Doe"),
  ).toBeInTheDocument();

  expect(
    await findByText("Page 1 of 2"),
  ).toBeInTheDocument();

  /*
   * Klik Next.
   */
  await user.click(
    getByRole("button", {
      name: "Next",
    }),
  );

  /*
   * Tunggu sampai data page 2 tampil.
   */
  expect(
    await findByText("Alice Smith"),
  ).toBeInTheDocument();

  expect(
    await findByText("Bob Smith"),
  ).toBeInTheDocument();

  /*
   * Data page 1 akhirnya harus hilang.
   */
  await waitFor(
    () => {
      expect(
        queryByText("Jane Doe") === null,
      ).toBe(true);
    },
    {
      timeout: 1000,
    },
  );

  /*
   * Pagination UI harus berubah.
   */
  expect(
    await findByText("Page 2 of 2"),
  ).toBeInTheDocument();

  /*
   * Router search state harus page=2.
   */
  expect(
    router.state.location.search,
  ).toMatchObject({
    page: 2,
    pageSize: 20,
  });

  /*
   * API harus pernah menerima page=2.
   */
  expect(
    requestedUrls.some((requestUrl) => {
      const url = new URL(requestUrl);

      return (
        url.searchParams.get("page") === "2"
      );
    }),
  ).toBe(true);
});

test("navigates back to the previous page", async () => {
  const user = userEvent.setup();

  const requestedUrls: string[] = [];

  mockFetchWithHandler(async (request) => {
    requestedUrls.push(request.url);

    const url = new URL(request.url);

    const page = Number(
      url.searchParams.get("page") ?? "1",
    );

    if (page === 2) {
      return Response.json({
        data: [
          {
            id: "user-3",
            name: "Alice Smith",
            email: "alice@example.com",
            createdAt: "2026-09-18T00:00:00.000Z",
            updatedAt: "2026-09-18T00:00:00.000Z",
          },
          {
            id: "user-4",
            name: "Bob Smith",
            email: "bob@example.com",
            createdAt: "2026-09-18T00:00:00.000Z",
            updatedAt: "2026-09-18T00:00:00.000Z",
          },
        ],

        pagination: {
          page: 2,
          pageSize: 20,
          total: 4,
          totalPages: 2,
        },
      });
    }

    return Response.json({
      data: [
        {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          createdAt: "2026-09-18T00:00:00.000Z",
          updatedAt: "2026-09-18T00:00:00.000Z",
        },
        {
          id: "user-2",
          name: "Jane Doe",
          email: "jane@example.com",
          createdAt: "2026-09-18T00:00:00.000Z",
          updatedAt: "2026-09-18T00:00:00.000Z",
        },
      ],

      pagination: {
        page: 1,
        pageSize: 20,
        total: 4,
        totalPages: 2,
      },
    });
  });

  const {
    findByText,
    getByRole,
    queryByText,
    router,
  } = renderRouter({
    initialEntry:
      "/users?page=1&pageSize=20",
  });

  /*
   * Page 1.
   */
  expect(
    await findByText("Jane Doe"),
  ).toBeInTheDocument();

  /*
   * Pindah ke page 2.
   */
  await user.click(
    getByRole("button", {
      name: "Next",
    }),
  );

  expect(
    await findByText("Alice Smith"),
  ).toBeInTheDocument();

  expect(
    await findByText("Page 2 of 2"),
  ).toBeInTheDocument();

  /*
   * Kembali ke page 1.
   */
  await user.click(
    getByRole("button", {
      name: "Previous",
    }),
  );

  /*
   * Page 1 harus tampil lagi.
   *
   * Boleh berasal dari cache.
   */
  expect(
    await findByText("John Doe"),
  ).toBeInTheDocument();

  expect(
    await findByText("Jane Doe"),
  ).toBeInTheDocument();

  /*
   * Data page 2 hilang.
   */
  await waitFor(
    () => {
      expect(
        queryByText("Alice Smith") === null,
      ).toBe(true);
    },
    {
      timeout: 1000,
    },
  );

  expect(
    await findByText("Page 1 of 2"),
  ).toBeInTheDocument();

  /*
   * URL kembali ke page=1.
   */
  expect(
    router.state.location.search,
  ).toMatchObject({
    page: 1,
    pageSize: 20,
  });
});

test("changes page size and resets to page 1", async () => {
  const user = userEvent.setup();

  const requestedUrls: string[] = [];

  mockFetchWithHandler(async (request) => {
    requestedUrls.push(request.url);

    const url = new URL(request.url);

    const page = Number(
      url.searchParams.get("page") ?? "1",
    );

    const pageSize = Number(
      url.searchParams.get("pageSize") ?? "20",
    );

    if (pageSize === 50) {
      return Response.json({
        data: [
          {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            createdAt:
              "2026-09-18T00:00:00.000Z",
            updatedAt:
              "2026-09-18T00:00:00.000Z",
          },
          {
            id: "user-2",
            name: "Jane Doe",
            email: "jane@example.com",
            createdAt:
              "2026-09-18T00:00:00.000Z",
            updatedAt:
              "2026-09-18T00:00:00.000Z",
          },
          {
            id: "user-3",
            name: "Alice Smith",
            email: "alice@example.com",
            createdAt:
              "2026-09-18T00:00:00.000Z",
            updatedAt:
              "2026-09-18T00:00:00.000Z",
          },
        ],

        pagination: {
          page: 1,
          pageSize: 50,
          total: 3,
          totalPages: 1,
        },
      });
    }

    return Response.json({
      data: [
        {
          id: "user-3",
          name: "Alice Smith",
          email: "alice@example.com",
          createdAt:
            "2026-09-18T00:00:00.000Z",
          updatedAt:
            "2026-09-18T00:00:00.000Z",
        },
      ],

      pagination: {
        page,
        pageSize: 20,
        total: 3,
        totalPages: 2,
      },
    });
  });

  const {
    findByText,
    getByRole,
    router,
  } = renderRouter({
    initialEntry:
      "/users?page=2&pageSize=20",
  });

  /*
   * Pastikan initial page selesai.
   */
  expect(
    await findByText("Alice Smith"),
  ).toBeInTheDocument();

  expect(
    await findByText("Page 2 of 2"),
  ).toBeInTheDocument();

  /*
   * Pilih page size 50.
   */
  const pageSizeSelect =
    getByRole("combobox", {
      name: /per page/i,
    });

  await user.selectOptions(
    pageSizeSelect,
    "50",
  );

  /*
   * Karena pageSize berubah,
   * page harus reset ke 1.
   */
  await waitFor(
    () => {
      expect(
        router.state.location.search.page === 1,
      ).toBe(true);

      expect(
        router.state.location.search.pageSize === 50,
      ).toBe(true);
    },
    {
      timeout: 1000,
    },
  );

  /*
   * Data untuk pageSize=50 tampil.
   */
  expect(
    await findByText("John Doe"),
  ).toBeInTheDocument();

  expect(
    await findByText("Jane Doe"),
  ).toBeInTheDocument();

  /*
   * Pagination ikut berubah.
   */
  expect(
    await findByText("Page 1 of 1"),
  ).toBeInTheDocument();

  /*
   * Pastikan API pernah menerima
   * page=1&pageSize=50.
   */
  expect(
    requestedUrls.some((requestUrl) => {
      const url = new URL(requestUrl);

      return (
        url.searchParams.get("page") === "1" &&
        url.searchParams.get("pageSize") === "50"
      );
    }),
  ).toBe(true);
});

test("changes sort field and resets page to 1", async () => {
  const user = userEvent.setup();

  const requestedUrls: string[] = [];

  mockFetchWithHandler(async (request) => {
    requestedUrls.push(request.url);

    const url = new URL(request.url);

    const sortBy =
      url.searchParams.get("sortBy");

    if (sortBy === "name") {
      return Response.json({
        data: [
          {
            id: "user-2",
            name: "Jane Doe",
            email: "jane@example.com",
            createdAt: "2026-09-18T00:00:00.000Z",
            updatedAt: "2026-09-18T00:00:00.000Z",
          },
          {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            createdAt: "2026-09-18T00:00:00.000Z",
            updatedAt: "2026-09-18T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 2,
          totalPages: 1,
        },
      });
    }

    return Response.json(usersResponse);
  });

  const {
    findByText,
    getByRole,
    router,
  } = renderRouter({
    initialEntry:
      "/users?page=2&pageSize=20&sortBy=createdAt&sortOrder=desc",
  });

  expect(
    await findByText("John Doe"),
  ).toBeInTheDocument();

  const sortBySelect =
    getByRole("combobox", {
      name: /sort by/i,
    });

  await user.selectOptions(
    sortBySelect,
    "name",
  );

  await waitFor(
    () => {
      expect(
        router.state.location.search.page === 1,
      ).toBe(true);

      expect(
        router.state.location.search.sortBy === "name",
      ).toBe(true);
    },
    {
      timeout: 1000,
    },
  );

  expect(
    requestedUrls.some((requestUrl) => {
      const url =
        new URL(requestUrl);

      return (
        url.searchParams.get("page") === "1" &&
        url.searchParams.get("sortBy") === "name"
      );
    }),
  ).toBe(true);
});

test("changes sort order and resets page to 1", async () => {
  const user = userEvent.setup();

  const requestedUrls: string[] = [];

  mockFetchWithHandler(async (request) => {
    requestedUrls.push(request.url);

    return Response.json(usersResponse);
  });

  const {
    findByText,
    getByRole,
    router,
  } = renderRouter({
    initialEntry:
      "/users?page=2&pageSize=20&sortBy=name&sortOrder=desc",
  });

  expect(
    await findByText("John Doe"),
  ).toBeInTheDocument();

  const sortOrderSelect =
    getByRole("combobox", {
      name: /order/i,
    });

  await user.selectOptions(
    sortOrderSelect,
    "asc",
  );

  await waitFor(
    () => {
      expect(
        router.state.location.search.page === 1,
      ).toBe(true);

      expect(
        router.state.location.search.sortOrder === "asc",
      ).toBe(true);
    },
    {
      timeout: 1000,
    },
  );

  expect(
    requestedUrls.some((requestUrl) => {
      const url =
        new URL(requestUrl);

      return (
        url.searchParams.get("page") === "1" &&
        url.searchParams.get("sortBy") === "name" &&
        url.searchParams.get("sortOrder") === "asc"
      );
    }),
  ).toBe(true);
});

test("creates a user and refreshes the user list", async () => {
  const user = userEvent.setup();

  let created = false;

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "POST" &&
      url.pathname.endsWith("/api/v1/users")
    ) {
      created = true;

      return Response.json(
        {
          data: {
            id: "user-3",
            name: "Alice Smith",
            email: "alice@example.com",
            createdAt: "2026-09-19T00:00:00.000Z",
            updatedAt: "2026-09-19T00:00:00.000Z",
          },
        },
        {
          status: 201,
        },
      );
    }

    if (
      request.method === "GET" &&
      url.pathname.endsWith("/api/v1/users")
    ) {
      return Response.json({
        data: created
          ? [
              ...usersResponse.data,
              {
                id: "user-3",
                name: "Alice Smith",
                email: "alice@example.com",
                createdAt: "2026-09-19T00:00:00.000Z",
                updatedAt: "2026-09-19T00:00:00.000Z",
              },
            ]
          : usersResponse.data,

        pagination: {
          page: 1,
          pageSize: 20,
          total: created ? 3 : 2,
          totalPages: 1,
        },
      });
    }

    return new Response(null, {
      status: 404,
    });
  });

  const {
    findByText,
    getByLabelText,
    getByRole,
  } = renderRouter({
    initialEntry:
      "/users?page=1&pageSize=20",
  });

  /*
   * Initial query selesai dulu.
   */
  expect(
    await findByText("Jane Doe"),
  ).toBeInTheDocument();

  /*
   * Isi form create.
   */
  await user.type(
    getByLabelText("Name"),
    "Alice Smith",
  );

  await user.type(
    getByLabelText("Email"),
    "alice@example.com",
  );

  /*
   * Submit.
   */
  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  /*
   * Setelah POST sukses:
   *
   * mutation onSuccess
   * → invalidate users lists
   * → GET list ulang
   * → Alice muncul.
   */
  expect(
    await findByText("Alice Smith"),
  ).toBeInTheDocument();

  expect(
    await findByText(
      "alice@example.com",
    ),
  ).toBeInTheDocument();

  /*
   * Total list ikut berubah.
   */
  expect(
    await findByText("3 users"),
  ).toBeInTheDocument();

  /*
   * UserForm di-remount melalui
   * createFormKey, sehingga input kosong.
   */
  expect(
    getByLabelText("Name"),
  ).toHaveValue("");

  expect(
    getByLabelText("Email"),
  ).toHaveValue("");
});

test("shows duplicate email error and keeps form values", async () => {
  const user = userEvent.setup();

  let getUsersCount = 0;

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname.endsWith("/api/v1/users")
    ) {
      getUsersCount += 1;

      return Response.json(usersResponse);
    }

    if (
      request.method === "POST" &&
      url.pathname.endsWith("/api/v1/users")
    ) {
      return Response.json(
        {
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email already exists",
            fields: {
              email: "Email already exists",
            },
            requestId: "request-1",
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
    findByText,
    getByLabelText,
    getByRole,
    queryByText,
  } = renderRouter({
    initialEntry:
      "/users?page=1&pageSize=20",
  });

  /*
   * Tunggu initial list selesai.
   */
  expect(
    await findByText("Jane Doe"),
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
   * Isi form create.
   */
  await user.type(
    nameInput,
    "Duplicate User",
  );

  await user.type(
    emailInput,
    "john@example.com",
  );

  /*
   * Submit create user.
   */
  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  /*
   * Backend mengembalikan 409.
   * Error harus tampil inline
   * di field email.
   */
  expect(
    await findByText(
      "Email already exists",
    ),
  ).toBeInTheDocument();

  /*
   * Mutation gagal,
   * jadi form tidak boleh reset.
   */
  expect(
    nameInput,
  ).toHaveValue(
    "Duplicate User",
  );

  expect(
    emailInput,
  ).toHaveValue(
    "john@example.com",
  );

  /*
   * List juga tidak berubah.
   */
  expect(
    await findByText("2 users"),
  ).toBeInTheDocument();

  /*
   * User memperbaiki email.
   */
  await user.clear(
    emailInput,
  );

  await user.type(
    emailInput,
    "new@example.com",
  );

  /*
   * Value baru harus tersimpan.
   */
  expect(
    emailInput,
  ).toHaveValue(
    "new@example.com",
  );

  /*
   * Server error lama harus
   * hilang setelah field diedit.
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

  /*
   * Karena mutation gagal,
   * query list tidak boleh
   * di-invalidate/refetch.
   */
  expect(
    getUsersCount,
  ).toBe(1);
});


test("shows form error when create user fails unexpectedly", async () => {
  const user = userEvent.setup();

  let getUsersCount = 0;

  mockFetchWithHandler(async (request) => {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname.endsWith("/api/v1/users")
    ) {
      getUsersCount += 1;

      return Response.json(usersResponse);
    }

    if (
      request.method === "POST" &&
      url.pathname.endsWith("/api/v1/users")
    ) {
      return Response.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
            requestId: "request-500",
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
    findByText,
    getByLabelText,
    getByRole,
  } = renderRouter({
    initialEntry:
      "/users?page=1&pageSize=20",
  });

  /*
   * Tunggu initial list.
   */
  expect(
    await findByText("Jane Doe"),
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
   * Isi form.
   */
  await user.type(
    nameInput,
    "Failed User",
  );

  await user.type(
    emailInput,
    "failed@example.com",
  );

  /*
   * Submit.
   */
  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  /*
   * Error level form harus tampil.
   */
  expect(
    await findByText(
      "Something went wrong",
    ),
  ).toBeInTheDocument();

  /*
   * Form tidak boleh reset.
   */
  expect(
    nameInput,
  ).toHaveValue(
    "Failed User",
  );

  expect(
    emailInput,
  ).toHaveValue(
    "failed@example.com",
  );

  /*
   * List tetap sama.
   */
  expect(
    await findByText("2 users"),
  ).toBeInTheDocument();

  /*
   * Karena mutation gagal,
   * list tidak di-invalidate/refetch.
   */
  expect(
    getUsersCount,
  ).toBe(1);
});
