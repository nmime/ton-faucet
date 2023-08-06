import config from "./types/config"

import { connect } from "mongoose"
connect(config.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error(err))

import { conversations, createConversation } from "@grammyjs/conversations"
import { hydrate } from "@grammyjs/hydrate"
import { hydrateReply, parseMode } from "@grammyjs/parse-mode"
import { run, sequentialize } from "@grammyjs/runner"
import { Bot, session } from "grammy"
import { generateUpdateMiddleware } from "telegraf-middleware-console-time"

import { Context, SessionData } from "./types/context"

const bot = new Bot<Context>(config.BOT_TOKEN)

bot.catch(err => console.error(err))

import { i18n } from "./i18n"
bot.use(i18n)

if (config.NODE_ENV === "development") bot.use(generateUpdateMiddleware())
bot.use(hydrateReply)
bot.use(hydrate())
bot.api.config.use(parseMode("HTML"))
bot.use(sequentialize((ctx: Context) => ctx.chat?.id.toString()))
bot.use(session({ initial: (): SessionData => ({}) }))
bot.use(conversations())

import { accept, decline } from "./actions/accept"
bot.callbackQuery(/accept_(\w+)/, accept)
bot.callbackQuery(/decline_(\w+)/, decline)

const privateBot = bot.chatType("private")

import setUser from "./middlewares/setUser"
privateBot.use(setUser())

import setLang from "./middlewares/setLang"
privateBot.use(setLang())

import start from "./actions/start"
privateBot.command("start", start)

import language from "./actions/language"
privateBot.use(language)
privateBot.command(["language", "lang"], ctx =>
  ctx.reply(ctx.t("language"), { reply_markup: language })
)

import cancel from "./actions/cancel"
privateBot.command("cancel", cancel)
privateBot.callbackQuery("cancel", cancel)

import operation from "./actions/operation"
privateBot.use(createConversation(operation))

privateBot.command("get", ctx => ctx.conversation.enter("operation"))
privateBot.callbackQuery("get", ctx => ctx.conversation.enter("operation"))

privateBot.on("message", start)

run(bot, {
  runner: { fetch: { allowed_updates: config.BOT_ALLOWED_UPDATES } }
})

import processOperations from "./processOperations"

void (async () => {
  await bot.init()
  console.log(bot.botInfo, "successful started")

  await processOperations(bot)
})()
