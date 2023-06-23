import { InlineKeyboard } from "grammy"

import { Operation } from "../database/operation"
import { Context } from "../types/context"

export default async function start(ctx: Context) {
  await ctx.conversation.exit()

  const operation = await Operation.findOne({
    userId: ctx.from.id,
    status: "done"
  })

  return ctx.reply(ctx.t(`start.${operation ? "notFirstTime" : ""}`), {
    reply_markup: new InlineKeyboard().text(ctx.t("start.key"), "get"),
    disable_web_page_preview: true
  })
}
