import { I18n } from "@grammyjs/i18n"
import { Context } from "./types/context"

export const i18n = new I18n<Context>({
  defaultLocale: "en",
  directory: "locales"
})
