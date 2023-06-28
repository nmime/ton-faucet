import { InlineKeyboard } from "grammy"

import { i18n } from "../i18n"

import { Context } from "../types/context"

import { Operation } from "../database/operation"
import { User } from "../database/user"

export const acceptMenu = (id: string, ctx: Context) =>
  new InlineKeyboard()
    .text(ctx.t("admin.keyYes"), `accept_${id}`)
    .text(ctx.t("admin.keyNo"), `decline_${id}`)

export const accept = async (ctx: Context) => {
  const operation =
    ctx.match && ctx.match[1]
      ? await Operation.findByIdAndUpdate(
          ctx.match[1],
          { status: "pending" },
          { new: true }
        )
      : undefined
  if (!operation) return

  await ctx.editMessageText(
    ctx.t("admin.approved", {
      address: operation.address,
      amount: operation.amount,
      comment: operation.comment ?? "",
      userId: operation.userId.toString(),
      userLink: `<a href='tg://user?id=${operation.userId}'>${operation.userName}</a>`
    })
  )

  const user = await User.findOne({ id: operation.userId })
  return ctx.api.sendMessage(
    operation.userId,
    i18n.t(user?.lang || user?.languageCode || "en", "operation.accepted", {
      amount: operation.amount
    })
  )
}

export const decline = async (ctx: Context) => {
  const operation =
    ctx.match && ctx.match[1]
      ? await Operation.findByIdAndUpdate(
          ctx.match[1],
          { status: "pending" },
          { new: true }
        )
      : undefined
  if (!operation) return

  await ctx.editMessageText(
    ctx.t("admin.declined", {
      address: operation.address,
      amount: operation.amount,
      comment: operation.comment ?? "",
      userId: operation.userId.toString(),
      userLink: `<a href='tg://user?id=${operation.userId}'>${operation.userName}</a>`
    })
  )

  const user = await User.findOne({ id: operation.userId })
  return ctx.api.sendMessage(
    operation.userId,
    i18n.t(user?.lang || user?.languageCode || "en", "operation.declined", {
      amount: operation.amount
    })
  )
}
