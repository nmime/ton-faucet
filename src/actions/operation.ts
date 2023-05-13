import { InlineKeyboard } from 'grammy'
import { type Conversation } from '@grammyjs/conversations'

import config from '../types/config'
import { Context } from '../types/context'
import { captcha } from '../types/operation'

import checkCaptcha from '../helpers/checkCaptcha'
import checkAddress from '../helpers/checkAddress'
import checkAmount from '../helpers/checkAmount'
import getLatestOperations from '../helpers/getLatestOperations'

import { Operation } from '../database/operation'

export default async function operation(
  conversation: Conversation<Context>,
  ctx: Context
) {
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
    attempts: 0,
    reason: null
  }
  do {
    const check = await checkAddress(
      conversation,
      ctx,
      conversation.session.address.reason
    )
    conversation.session.address = Object.assign(
      conversation.session.address,
      check
    )

    conversation.session.address.attempts += 1
  } while (!conversation.session.address.valid)

  conversation.session.amount = {
    amount: 1,
    valid: false,
    attempts: 0,
    reason: null,
    default: false
  }
  do {
    const check = await checkAmount(
      conversation,
      ctx,
      conversation.session.amount.reason
    )
    conversation.session.amount = Object.assign(
      conversation.session.amount,
      check
    )

    conversation.session.amount.attempts += 1
  } while (!conversation.session.amount.valid)

  let comment
  if (!conversation.session.amount.default)
    comment = await conversation.waitFor(':text', ctx =>
      ctx.reply(ctx.t('onlyText'))
    )

  const lastOperations = await getLatestOperations(ctx.from.id)
  if (
    conversation.session.amount.default &&
    lastOperations.sum > config.DAY_LIMIT + config.OPERATION_LIMIT
  )
    return ctx.reply(ctx.t('dailyLimit'))

  const operation = new Operation({
    userId: ctx.from.id,
    address: conversation.session.address.address,
    amount: conversation.session.amount.amount,
    userName: conversation.session.user?.name ?? '',
    comment: comment?.message.text,
    status: 'pending'
  })

  await ctx.reply(ctx.t('operation.queue'))

  await ctx.api.sendMessage(
    config.ADMIN_CHAT,
    ctx.t(
      conversation.session.amount.default ? 'admin.notify' : 'admin.approve',
      {
        userName: operation.userName,
        userId: operation.userId,
        address: operation.address,
        amount: operation.amount,
        comment: comment?.message.text ?? ''
      }
    ),
    !conversation.session.amount.default
      ? {
          reply_markup: new InlineKeyboard()
            .text(ctx.t('admin.keyYes'), `accept_${operation._id}_yes`)
            .text(ctx.t('admin.keyNo'), `accept_${operation._id}_no`)
        }
      : {}
  )

  await operation.save()
}
