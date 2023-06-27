import { type Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"

import config from "../types/config"
import { Context } from "../types/context"

export default async function checkAddress(
  conversation: Conversation<Context>,
  ctx: Context,
  reason: null | string
) {
  const messsge = await ctx.reply(
    ctx.t(
      `provideAmount.${
        reason
          ? reason
          : conversation.session.amount?.default
          ? "enterAmount"
          : ""
      }`,
      { amount: config.DEFAULT_AMOUNT }
    ),
    {
      reply_markup:
        !conversation.session.amount?.default && !reason
          ? new InlineKeyboard()
              .text(
                ctx.t("provideAmount.keyDefault", {
                  amount: config.DEFAULT_AMOUNT
                }),
                "provideAmount_default"
              )
              .row()
              .text(ctx.t("provideAmount.keyEnter"), "provideAmount_enter")
          : undefined
    }
  )

  let update = await conversation.wait()

  if (update.callbackQuery?.data === "provideAmount_enter") {
    await ctx.api.editMessageText(
      ctx.from.id,
      messsge.message_id,
      ctx.t("provideAmount.enterAmount")
    )
    update = await conversation.waitFor(":text")
  }

  const amount = Number(
    update.callbackQuery?.data === "provideAmount_default"
      ? config.DEFAULT_AMOUNT
      : update.message?.text
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
    default: isDefaultAmount,
    reason: valid
      ? null
      : isNaN(amount) || amount < 0.1
      ? "invalid"
      : amount > config.OPERATION_LIMIT && isDefaultAmount
      ? "operationLimit"
      : null,
    valid
  }
}
