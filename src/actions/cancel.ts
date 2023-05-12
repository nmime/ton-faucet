import { Context } from '../types/context'

export default async function cancel(ctx: Context) {
  const conversations = await ctx.conversation.active()
  if (!conversations?.operation) return ctx.reply(ctx.t('leave.error'))

  await ctx.conversation.exit()

  return ctx.reply(ctx.t('leave'))
}
