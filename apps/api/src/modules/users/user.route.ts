import { Hono } from "hono";

import { validator } from "../../lib/validator";
import { createUserSchema, userIdParamSchema } from "./user.schema";

import { userService } from "./user.service";

export const userRoute = new Hono()
  .get("/", async (c) => {
    const users = await userService.getUsers();

    return c.json({
      data: users,
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
  );
