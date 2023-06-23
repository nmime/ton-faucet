import { Middleware } from "grammy"

import { User } from "../database/user"
import { convertChars } from "../helpers/convertChars"
import { Context } from "../types/context"

export const setUser = (): Middleware<Context> => async (ctx, next) => {
  let user = await User.findOne({ id: ctx.from.id })

  if (!user) user = new User({ id: ctx.from.id })

  user = Object.assign(user, {
    name: `${convertChars(ctx.from.first_name)} ${convertChars(
      ctx.from.last_name ?? ""
    )}`,
    username: ctx.from.username,
    languageCode: ctx.from.language_code
  })

  ctx.session.user = user

  ctx.i18n.useLocale(
    ctx.session.user.lang || ctx.session.user.languageCode || "en"
  )

  await next()

  return user.save()
}
