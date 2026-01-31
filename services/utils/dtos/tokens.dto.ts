import { Address } from 'viem'

export type TokensDtoByChain = Record<string, TokenDto[]>

export interface TokenDto {
	chainId: number
	address: Address
	symbol: string
	name: string
	decimals: number
	priceUSD: string
	coinKey: string
	logoURI?: string
}

export interface TokensResponse {
	tokens: TokensDtoByChain
	extended: boolean
}
