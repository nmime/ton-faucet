import { InferSchemaType, Schema, model } from "mongoose"

const operationSchema = new Schema(
  {
    address: {
      required: true,
      type: String
    },
    amount: {
      required: true,
      type: Number
    },
    comment: String,
    status: {
      enum: ["needApprove", "canceled", "pending", "done"],
      type: String
    },
    userId: {
      index: true,
      required: true,
      type: Number
    },
    userName: {
      required: true,
      type: String
    }
  },
  {
    timestamps: true
  }
)

export type IOperation = InferSchemaType<typeof operationSchema>

export const Operation = model("Operation", operationSchema)
