import { type Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"

import { Color, Context } from "../types/context"

const shuffleArray = (array: Array<string>) => {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[randomIndex]] = [array[randomIndex], array[i]]
  }
  return array
}

const colors: Record<Color, string> = { blue: "🟦", green: "🟩", red: "🟥" }

export default async function captcha(
  conversation: Conversation<Context>,
  ctx: Context,
  error = false
) {
  conversation.session.randomEmoji = Object.keys(colors)[
    Math.floor((await conversation.random()) * 3)
  ] as Color

  const colorSquares = shuffleArray(Object.values(colors))

  await ctx.reply(
    ctx.t(`captcha.${error ? "error" : ""}`, {
      color: ctx.t(`captcha.${conversation.session.randomEmoji}`)
    }),
    {
      reply_markup: new InlineKeyboard()
        .text(colorSquares[0], `captcha_${colorSquares[0]}`)
        .text(colorSquares[1], `captcha_${colorSquares[1]}`)
        .text(colorSquares[2], `captcha_${colorSquares[2]}`)
    }
  )

  const { callbackQuery } = await conversation.waitForCallbackQuery(
    new RegExp(`captcha`, ""),
    {
      otherwise: ctx =>
        ctx.callbackQuery?.editText &&
        ctx.callbackQuery.editText(
          ctx.t(`captcha.error`, {
            color: conversation.session.randomEmoji ?? ""
          })
        )
    }
  )

  const passed =
    callbackQuery.data.split("_")[1] ===
    colors[conversation.session.randomEmoji]

  await ctx.api.answerCallbackQuery(callbackQuery.id)

  if (callbackQuery.message)
    await ctx.api.deleteMessage(
      callbackQuery.from.id,
      callbackQuery.message.message_id
    )

  return passed
}
