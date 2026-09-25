import {
  userRepository,
} from './user.repository'

import {
  createUserRoute,
} from './user.route'

import {
  createUserService,
} from './user.service'

export const userService =
  createUserService(userRepository)

export const userRoute = createUserRoute(userService)
