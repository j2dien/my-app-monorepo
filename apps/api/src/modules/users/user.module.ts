import {
  userRepository,
} from './user.repository'

import {
  createUserRoutes,
} from './user.route'

import {
  createUserService,
} from './user.service'

export const userService =
  createUserService(userRepository)

export const userRoutes = createUserRoutes(userService)
