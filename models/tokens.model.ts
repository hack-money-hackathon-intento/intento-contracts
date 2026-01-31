import { Address } from 'viem'

export type TokensByChain = Record<string, Token[]>

export interface Token {
	chainId: number
	address: Address
	symbol: string
	name: string
	decimals: number
	priceUSD: string
	coinKey?: string
	logoURI?: string
}

export interface Tokens {
	chainId: number
	tokens: Token[]
}
