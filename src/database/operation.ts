import { Schema, model, InferSchemaType } from 'mongoose'

const operationSchema = new Schema(
  {
    userId: {
      type: Number,
      index: true,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['needApprove', 'canceled', 'pending', 'done']
    },
    comment: String
  },
  {
    timestamps: true
  }
)

export type IOperation = InferSchemaType<typeof operationSchema>

export const Operation = model('Operation', operationSchema)
