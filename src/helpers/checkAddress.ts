import { type Conversation } from '@grammyjs/conversations'
import { Address } from 'ton-core'

import { Context } from '../types/context'

export default async function checkAddress(
  conversation: Conversation<Context>,
  ctx: Context,
  error: Boolean = false
) {
  await ctx.reply(ctx.t(`provideAddress.${error ? 'error' : ''}`))

  let {
    message: { text }
  } = await conversation.waitFor(':text', ctx => ctx.reply(ctx.t('onlyText')))

  let address
  let valid = true
  try {
    address = Address.parse(text)
  } catch (error) {
    console.error(error)
    valid = false
  }

  return { address: address?.toString(), valid }
}
