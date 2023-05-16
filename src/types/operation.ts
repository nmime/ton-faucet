export interface captcha {
  result: boolean
  attempts: number
}

export interface address {
  address: string | undefined
  valid: boolean
  attempts: number
  reason: null | string
}

export interface amount {
  amount: number
  valid: boolean
  attempts: number
  reason: null | string
  default: boolean
}
