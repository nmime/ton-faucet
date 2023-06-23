import { TonClient, WalletContractV4, fromNano, internal } from "ton"
import { SendMode } from "ton-core"

import { mnemonicToPrivateKey } from "ton-crypto"

import { Api, Bot, RawApi } from "grammy"
import { Operation } from "./database/operation"
import { User } from "./database/user"
import { i18n } from "./i18n"
import config from "./types/config"
import { Context } from "./types/context"

const sleep = (millis: number) =>
  new Promise(resolve => setTimeout(resolve, millis))

const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: config.TONCENTER_KEY
})

export default async function processOperations(
  bot: Bot<Context, Api<RawApi>>
) {
  const keyPair = await mnemonicToPrivateKey(config.MNEMONIC)
  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey
  })
  const contract = client.open(wallet)

  const checkBalance = async (): Promise<number> => {
    try {
      return Number(fromNano(await contract.getBalance()))
    } catch (error) {
      return 0
    }
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const operation = await Operation.findOne({ status: "pending" })

    let balance = await checkBalance()
    if (operation && operation.amount < balance) {
      try {
        const seqno: number = await contract.getSeqno()
        await contract.sendTransfer({
          seqno,
          secretKey: keyPair.secretKey,
          messages: [
            internal({
              value: operation.amount.toString(),
              to: operation.address
            })
          ],
          sendMode: SendMode.IGNORE_ERRORS
        })

        let currentSeqno = seqno
        while (currentSeqno === seqno) {
          await sleep(1500)

          currentSeqno = await contract.getSeqno()
        }

        await Operation.updateOne({ _id: operation._id }, { status: "done" })

        const user = await User.findOne({ id: operation.userId })
        await bot.api.sendMessage(
          operation.userId,
          i18n.t(
            user?.lang || user?.languageCode || "en",
            "operation.executed",
            {
              amount: operation.amount
            }
          )
        )
      } catch (error) {
        if (config.NODE_ENV === "development") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          console.error(`TRANSACTION ERROR`, error.response?.data, operation)
        }

        await sleep(10000)
      }

      await sleep(3000)
      balance = await checkBalance()
      if (balance < config.SUFFICIENT_BALANCE && balance !== 0)
        await bot.api.sendMessage(
          config.ADMIN_CHAT,
          i18n.t("en", "admin.littleBalance", {
            amount: balance.toFixed(1)
          })
        )
    }
    await sleep(5000)
  }
}
