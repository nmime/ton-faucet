import { type Conversation } from '@grammyjs/conversations'

import config from '../types/config'

import { Context } from '../types/context'
import checkCaptcha from '../helpers/checkCaptcha'
import checkAddress from '../helpers/checkAddress'
import checkAmount from '../helpers/checkAmount'

import { captcha, address, amount } from '../types/operation'

import { Operation } from '../database/operation'

export default async function operation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const lastOperations = await Operation.find({
    userId: ctx.from.id,
    createdAt: { $gte: Date.now() - 86400000 }
  }).sort({
    _id: -1
  })
  const amountLastOperations = lastOperations.reduce(
    (sum, b) => sum + b.amount,
    0
  )

  if (amountLastOperations > config.DAY_LIMIT + config.OPERATION_LIMIT)
    return ctx.reply(ctx.t('dailyLimit'))

  let captcha: captcha = {
    result: false,
    attempts: 0
  }
  do {
    captcha.result = await checkCaptcha(conversation, ctx, captcha.attempts > 0)
    captcha.attempts += 1
  } while (!captcha.result)

  conversation.session.address = {
    address: undefined,
    valid: false,
    attempts: 0
  }
  do {
    conversation.session.address = Object.assign(
      conversation.session.address,
      await checkAddress(
        conversation,
        ctx,
        conversation.session.address.attempts > 0
      )
    )
    conversation.session.address.attempts += 1
  } while (!conversation.session.address.valid)

  conversation.session.amount = {
    amount: 1,
    valid: false,
    attempts: 0,
    reason: null
  }
  do {
    conversation.session.amount = Object.assign(
      conversation.session.amount,
      await checkAmount(conversation, ctx, conversation.session.amount.reason)
    )
    conversation.session.amount.attempts += 1
  } while (!conversation.session.amount.valid)

  const operation = new Operation({
    userId: ctx.from.id,
    address: conversation.session.address,
    amount: conversation.session.amount
  })

  await ctx.reply(ctx.t('operation.queue'))
}
