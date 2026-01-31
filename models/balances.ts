import { Address } from 'viem'

export interface Balance {
	address: Address
	balance: string
}

export interface Balances {
	chainId: number
	balances: Balance[]
}
