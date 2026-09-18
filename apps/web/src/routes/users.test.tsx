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
   * Clear search.
   */
  await user.click(
    getByRole("button", {
      name: "Clear",
    }),
  );

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
