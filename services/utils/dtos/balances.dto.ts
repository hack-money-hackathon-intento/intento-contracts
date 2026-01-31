import { Address } from 'viem'

export interface BalancesDto {
	[key: Address]: string
}
