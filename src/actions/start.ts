import { Context } from '../types/context'

export default function start(ctx: Context) {
  return ctx.reply(ctx.t('start'))
}
