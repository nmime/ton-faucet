import "dotenv/config"
import z from "zod"

const updates = ["message", "my_chat_member", "callback_query"] as const

const configSchema = z.object({
  ADMIN_CHAT: z.coerce.number(),
  BOT_ALLOWED_UPDATES: z.preprocess((v: unknown) => {
    try {
      return JSON.parse(String(v))
    } catch (e) {
      return null
    }
  }, z.array(z.enum(updates))),
  BOT_TOKEN: z.string(),
  DAY_LIMIT: z.coerce.number(),
  DEFAULT_AMOUNT: z.coerce.number(),
  MNEMONIC: z.preprocess((v: unknown) => {
    return JSON.parse(String(v))
  }, z.string().array()),
  MONGO_URI: z.string(),
  NODE_ENV: z.enum(["development", "production"]),
  OPERATION_LIMIT: z.coerce.number(),
  SUFFICIENT_BALANCE: z.coerce.number(),
  TONCENTER_KEY: z.string()
})

export default configSchema.parse(process.env)
