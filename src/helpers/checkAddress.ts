import { type Conversation } from "@grammyjs/conversations"
import { TonClient, fromNano } from "ton"
import { Address } from "ton-core"

import config from "../types/config"
import { Context } from "../types/context"

const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: config.TONCENTER_KEY
})

export default async function checkAddress(
  conversation: Conversation<Context>,
  ctx: Context,
  reason: null | string
) {
  await ctx.reply(ctx.t(`provideAddress.${reason ?? ""}`))

  const {
    message: { text }
  } = await conversation.waitFor(":text", ctx => ctx.reply(ctx.t("onlyText")))

  let address
  let valid = true
  try {
    address = Address.parse(text)
  } catch (error) {
    console.error(error)
    valid = false
    reason = "invalid"
  }

  let balance
  try {
    if (!address) return new Error("no adress")

    balance = fromNano(await client.getBalance(address))

    if (Number(balance) > config.SUFFICIENT_BALANCE)
      return new Error("SUFFICIENT_BALANCE")
  } catch (error) {
    console.error(error)
    valid = false
    reason = "balance"
  }

  return { address: address?.toString(), valid, reason }
}
