import { Menu, MenuFlavor } from "@grammyjs/menu"
import { i18n } from "../i18n"

import { Context } from "../types/context"

import { Operation } from "../database/operation"
import { User } from "../database/user"

export const acceptMenu = new Menu<Context>("accept")

export const accept = async (ctx: Context & MenuFlavor) => {
  ctx.menu.close()

  const operation = await Operation.findByIdAndUpdate(
    ctx.match,
    { status: "pending" },
    { new: true }
  )
  if (!operation) return

  await ctx.editMessageText(
    ctx.t("admin.approved", {
      userName: operation.userName,
      userId: operation.userId.toString(),
      address: operation.address,
      amount: operation.amount,
      comment: operation.comment ?? ""
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

export const decline = async (ctx: Context & MenuFlavor) => {
  ctx.menu.close()

  const operation = await Operation.findByIdAndUpdate(
    ctx.match,
    { status: "pending" },
    { new: true }
  )
  if (!operation) return

  await ctx.editMessageText(
    ctx.t("admin.declined", {
      userName: operation.userName,
      userId: operation.userId.toString(),
      address: operation.address,
      amount: operation.amount,
      comment: operation.comment ?? ""
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
