import { Address } from 'viem'

export interface Token {
	address: Address
	symbol: string
	decimals: number
	amount: string
	name: string
	chainId: number
	priceUSD?: string
	logoURI?: string
	marketCapUSD?: number
	volumeUSD24H?: number
	fdvUSD?: number
	enabled?: boolean
}

export interface LiFiBalances {
	chainId: number
	tokens: Token[]
}
