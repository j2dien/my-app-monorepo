import {
  describe,
  expect,
  test,
} from "bun:test";

import {
  renderRouter,
} from "@/test/render-router";

describe("index route", () => {
  test("renders the home page", async () => {
    const view = renderRouter({
      initialEntry: "/"
    });

    expect(
      await view.findByRole("heading", {
        name: "Welcome"
      }),
    ).toBeInTheDocument();
  });
});
