import { type Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"

import config from "..//types/config"
import { Context } from "..//types/context"

export default async function checkAddress(
  conversation: Conversation<Context>,
  ctx: Context,
  reason: null | string
) {
  const messsge = await ctx.reply(ctx.t(`provideAmount.${reason ?? ""}`), {
    reply_markup: new InlineKeyboard().text(
      ctx.t("provideAmount.key", { amount: config.DEFAULT_AMOUNT }),
      "provideAmount"
    )
  })

  const update = await conversation.wait()

  const amount = Number(
    update.callbackQuery ? config.DEFAULT_AMOUNT : update.message?.text
  )
  const isDefaultAmount = amount <= config.DEFAULT_AMOUNT

  let valid = true
  if (
    isNaN(amount) ||
    amount < 0.1 ||
    (amount > config.OPERATION_LIMIT && isDefaultAmount)
  )
    valid = false

  await ctx.api.deleteMessage(ctx.from.id, messsge.message_id)

  return {
    amount,
    valid,
    reason: valid
      ? null
      : isNaN(amount) || amount < 0.1
      ? "invalid"
      : amount > config.OPERATION_LIMIT && isDefaultAmount
      ? "operationLimit"
      : null,
    default: isDefaultAmount
  }
}
