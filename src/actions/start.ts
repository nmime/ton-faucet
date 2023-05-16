import { InlineKeyboard } from "grammy"
import { Context } from "~/types/context"

export default function start(ctx: Context) {
  return ctx.reply(ctx.t("start"), {
    reply_markup: new InlineKeyboard().text(ctx.t("start.key"), "get")
  })
}
