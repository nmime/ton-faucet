import 'dotenv/config'
import z from 'zod'

const updates = ['message', 'my_chat_member', 'callback_query'] as const

const configSchema = z.object({
  MONGO_URI: z.string(),
  BOT_TOKEN: z.string(),
  BOT_ALLOWED_UPDATES: z.preprocess((v: unknown) => {
    try {
      return JSON.parse(String(v))
    } catch (e) {
      return null
    }
  }, z.array(z.enum(updates))),
  ADMIN_CHAT: z.coerce.number(),
  DAY_LIMIT: z.coerce.number(),
  OPERATION_LIMIT: z.coerce.number()
})

export default configSchema.parse(process.env as NodeJS.ProcessEnv)
