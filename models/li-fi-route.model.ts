import { Address, Hex } from 'viem'

export interface LiFiRoute {
	to: Address
	approval: Address
	value: bigint
	data: Hex
}
