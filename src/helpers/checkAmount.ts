import { type Conversation } from '@grammyjs/conversations'

import { Context } from '../types/context'
import config from '../types/config'

export default async function checkAddress(
  conversation: Conversation<Context>,
  ctx: Context,
  reason: null | string
) {
  await ctx.reply(ctx.t(`provideAmount.${reason ?? ''}`))

  let {
    message: { text }
  } = await conversation.waitFor(':text', ctx => ctx.reply(ctx.t('onlyText')))

  const amount = Number(text)
  let valid = true
  if (isNaN(amount) || amount < 0.1 || amount > config.OPERATION_LIMIT)
    valid = false

  return {
    amount,
    valid,
    reason: valid
      ? null
      : isNaN(amount) || amount < 0.1
      ? 'invalid'
      : amount > config.OPERATION_LIMIT
      ? 'operationLimit'
      : 'else'
  }
}
