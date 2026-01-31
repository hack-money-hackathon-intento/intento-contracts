import { Address } from 'viem'

export interface TokensByChain {
	[chainId: number]: Tokens
}

export interface Tokens {
	chainId: number
	tokens: Token[]
}

export interface Token {
	address: Address
	symbol: string
	decimals: number
	name: string
	logoURI: string
	eip2612: boolean
	tags: string[]
}
