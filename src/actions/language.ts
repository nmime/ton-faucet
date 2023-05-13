import { Context } from '../types/context'
import { i18n } from '../i18n'
import start from './start'

import { Menu } from '@grammyjs/menu'

export default new Menu<Context>('language').dynamic((ctx, range) => {
  i18n.locales.map(localeCode => {
    range
      .text(i18n.t(localeCode, 'name'), ctx => {
        if (ctx.session.user) ctx.session.user.lang = localeCode
        ctx.i18n.useLocale(localeCode)

        ctx.menu.close()
        ctx.editMessageText(ctx.t('language.changed'))

        return start(ctx)
      })
      .row()
  })

  return range
})
