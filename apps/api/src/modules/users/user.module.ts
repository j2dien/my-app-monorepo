import {
  userRepository,
} from './user.repository'

import {
  createUserService,
} from './user.service'

export const userService =
  createUserService(userRepository)