import { Address } from 'viem'

export interface TokenDto {
	address: Address
	symbol: string
	decimals: number
	amount: string
	name: string
	chainId: number
	priceUSD?: string
	marketCapUSD?: number
	volumeUSD24H?: number
	fdvUSD?: number
	logoURI?: string
}

export type BalancesDto = Record<string, TokenDto[]>

export interface BalancesResponse {
	walletAddress: Address
	balances: BalancesDto
	limit: number
}
