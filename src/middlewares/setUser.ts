import { Middleware } from 'grammy'

import { Context } from '../types/context'
import { User } from '../database/user'
import { convertChars } from '../helpers/convertChars'

export const setUser = (): Middleware<Context> => async (ctx, next) => {
  let user = await User.findOne({ id: ctx.from.id })

  if (!user) user = new User({ id: ctx.from.id })

  user = Object.assign(user, {
    name: `${convertChars(ctx.from.first_name)} ${convertChars(
      ctx.from.last_name ?? ''
    )}`,
    username: ctx.from.username,
    languageCode: ctx.from.language_code
  })

  ctx.user = user

  await next()

  return user.save()
}
