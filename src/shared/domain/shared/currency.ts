import { z } from 'zod'

export enum Currency {
  CNY = 'CNY',
}

export const CURRENCY_VALUES = Object.values(Currency)

export const CurrencySchema = z.enum(Currency).default(Currency.CNY)
