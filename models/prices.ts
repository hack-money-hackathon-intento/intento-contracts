import { Address } from 'viem'

export interface Price {
	address: Address
	price: number
}

export interface Prices {
	chainId: number
	prices: Price[]
	currencies: string
}
