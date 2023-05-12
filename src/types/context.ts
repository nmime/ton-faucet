import { ChatTypeContext, Context as Default, SessionFlavor } from 'grammy'
import { I18nFlavor } from '@grammyjs/i18n'
import type { ParseModeFlavor } from '@grammyjs/parse-mode'
import { HydrateFlavor } from '@grammyjs/hydrate'
import { type ConversationFlavor } from '@grammyjs/conversations'

import { IUser } from '../database/user'

import { address, amount } from '../types/operation'

export interface SessionData {
  randomEmoji?: string
  address?: address
  amount?: amount
}

type CustomContext = Default & I18nFlavor

export type Context = ParseModeFlavor<
  HydrateFlavor<
    CustomContext &
      ChatTypeContext<CustomContext, 'private'> & {
        user: IUser
      } & SessionFlavor<SessionData> &
      ConversationFlavor
  >
>
