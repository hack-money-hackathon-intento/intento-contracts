import { Address } from 'viem'

export interface TokenDto {
	address: Address
	symbol: string
	decimals: number
	name: string
	logoURI: string
	eip2612: boolean
	tags: string[]
}

export interface TokensResponse {
	tokens: {
		[key: Address]: TokenDto
	}
}
