import { Address, getAddress } from 'viem'

import { Balance, Balances } from '@/models/balances'
import { BalancesDto } from '@/services/utils/dtos/balances.dto'

export function mapBalancesDtoToBalances(
	chainId: number,
	response: BalancesDto
): Balances {
	const balances: Balance[] = Object.entries(response)
		.filter(([, balance]) => BigInt(balance) > BigInt(0))
		.map(([address, balance]) => ({
			address: getAddress(address as Address),
			balance: balance as string
		}))

	return {
		chainId,
		balances
	}
}
