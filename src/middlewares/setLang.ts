import { Middleware } from "grammy"

import language from "../actions/language"
import { Context } from "../types/context"

export default (): Middleware<Context> => async (ctx, next) => {
  if (!ctx.session.user?.lang)
    return ctx.reply(ctx.t("language"), { reply_markup: language })

  await next()
}
