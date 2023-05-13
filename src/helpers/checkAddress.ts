import { type Conversation } from '@grammyjs/conversations'
import { Address } from 'ton-core'

import { Context } from '../types/context'

export default async function checkAddress(
  conversation: Conversation<Context>,
  ctx: Context,
  reason: null | string
) {
  await ctx.reply(ctx.t(`provideAddress.${reason ?? ''}`))

  let {
    message: { text }
  } = await conversation.waitFor(':text', ctx => ctx.reply(ctx.t('onlyText')))

  let address
  let valid = true
  try {
    address = Address.parse(text).toString()
  } catch (error) {
    console.error(error)
    valid = false
    reason = 'invalid'
  }

  return { address: address?.toString(), valid, reason }
}
