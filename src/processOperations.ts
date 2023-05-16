import { Operation } from "./database/operation"
import config from "./types/config"

import { TonClient, WalletContractV4, internal } from "ton"
import { mnemonicToPrivateKey } from "ton-crypto"

const sleep = (millis: number) =>
  new Promise(resolve => setTimeout(resolve, millis))

const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: config.TONCENTER_KEY
})
const keyPair = await mnemonicToPrivateKey(config.MNEMONIC)
const wallet = WalletContractV4.create({
  workchain: 0,
  publicKey: keyPair.publicKey
})
const contract = client.open(wallet)

export default async function processOperations() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const operation = await Operation.findOne({ status: "pending" })
    if (!operation) return

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
        ]
      })

      let currentSeqno = seqno
      while (currentSeqno === seqno) {
        await sleep(1500)

        currentSeqno = await contract.getSeqno()
      }

      await Operation.updateOne({ _id: operation._id }, { status: "done" })
    } catch (error) {
      console.error(error)
    }

    await sleep(3000)
  }
}
