import { InlineKeyboard } from "grammy"

import { Operation } from "../database/operation"
import { Context } from "../types/context"

export default async function start(ctx: Context) {
  await ctx.conversation.exit()

  const operation = await Operation.findOne({
    status: "done",
    userId: ctx.from.id
  })

  return ctx.reply(ctx.t(`start.${operation ? "notFirstTime" : ""}`), {
    disable_web_page_preview: true,
    reply_markup: new InlineKeyboard().text(ctx.t("start.key"), "get")
  })
}
