import { Schema, model, InferSchemaType } from 'mongoose'

const operationSchema = new Schema(
  {
    userId: {
      type: Number,
      index: true,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export type IOperation = InferSchemaType<typeof operationSchema>

export const Operation = model('Operation', operationSchema)
