import { Operation } from "../database/operation"

export default async function getLatestOperations(id: number) {
  const lastOperations = await Operation.find({
    createdAt: { $gte: Date.now() - 86400000 },
    userId: id
  }).sort({ _id: -1 })
  const amountLastOperations = lastOperations.reduce(
    (sum, b) => sum + b.amount,
    0
  )

  return { operations: lastOperations, sum: amountLastOperations }
}
