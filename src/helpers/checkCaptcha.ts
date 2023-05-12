import { InlineKeyboard } from 'grammy'
import { type Conversation } from '@grammyjs/conversations'

import { Context } from '../types/context'

const colors = ['🟥', '🟩', '🟦'] as const

export default async function captcha(
  conversation: Conversation<Context>,
  ctx: Context,
  error: Boolean = false
) {
  conversation.session.randomEmoji =
    colors[Math.floor((await conversation.random()) * 3)]

  await ctx.reply(
    ctx.t(`captcha.${error ? 'error' : ''}`, {
      color: conversation.session.randomEmoji ?? ''
    }),
    {
      reply_markup: new InlineKeyboard()
        .text(colors[0], `captcha_${colors[0]}`)
        .text(colors[1], `captcha_${colors[1]}`)
        .text(colors[2], `captcha_${colors[2]}`)
    }
  )

  const { callbackQuery } = await conversation.waitForCallbackQuery(
    new RegExp(`captcha`, ''),
    {
      otherwise: ctx =>
        ctx.callbackQuery?.editText &&
        ctx.callbackQuery.editText(
          ctx.t(`captcha.error`, {
            color: conversation.session.randomEmoji ?? ''
          })
        )
    }
  )

  const passed =
    callbackQuery.data.split('_')[1] === conversation.session.randomEmoji

  await ctx.api.answerCallbackQuery(callbackQuery.id)

  if (callbackQuery.message)
    await ctx.api.deleteMessage(
      callbackQuery.from.id,
      callbackQuery.message.message_id
    )

  return passed
}
