import { Schema, model, InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    id: { type: Number, required: true },
    name: String,
    username: String,
    languageCode: String,
    lang: String
  },
  {
    timestamps: true
  }
)

export type IUser = InferSchemaType<typeof userSchema>

export const User = model('User', userSchema)
