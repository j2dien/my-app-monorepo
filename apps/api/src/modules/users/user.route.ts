import { Hono } from "hono";

import type { UserService } from "./user.service";

import { validator } from "../../lib/validator";
import {
  createUserSchema,
  userIdParamSchema,
  updateUserSchema,
  usersQuerySchema,
} from "./user.schema";


export function createUserRoute(
  userService: UserService
) {
  return new Hono()
    .get("/", validator("query", usersQuerySchema), async (c) => {
      const query = c.req.valid("query");

      const result = await userService.getUsers(query);

      return c.json({
        data: result.items,
        pagination: result.pagination,
      });
    })

    .get(
      "/:id",

      validator("param", userIdParamSchema),

      async (c) => {
        const { id } = c.req.valid("param");

        const user = await userService.getUser(id);

        return c.json({
          data: user,
        });
      },
    )

    .post(
      "/",

      validator("json", createUserSchema),

      async (c) => {
        const input = c.req.valid("json");

        const user = await userService.createUser(input);

        return c.json(
          {
            data: user,
          },
          201,
        );
      },
    )
    .patch(
      "/:id",

      validator("param", userIdParamSchema),

      validator("json", updateUserSchema),

      async (c) => {
        const { id } = c.req.valid("param");

        const input = c.req.valid("json");

        const user = await userService.updateUser(id, input);

        return c.json({
          data: user,
        });
      },
    )

    .delete(
      "/:id",

      validator("param", userIdParamSchema),

      async (c) => {
        const { id } = c.req.valid("param");

        await userService.deleteUser(id);

        return c.body(null, 204);
      },
    )
};
