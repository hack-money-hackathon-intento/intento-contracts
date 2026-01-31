import axios from 'axios'
import { RawAxiosRequestHeaders } from 'axios'
import { Address } from 'viem'

import { ServiceResult } from '@/models/api.model'
import { APIError } from '@/models/api.model'
import { Balances } from '@/models/balances'
import { BalancesDto } from '@/services/utils/dtos/balances.dto'
import { mapBalancesDtoToBalances } from '@/services/utils/mappings/balances-dto-to-balances'

type BalanceService = {
	getBalances: (
		chainId: number,
		address: Address
	) => Promise<ServiceResult<Balances>>
}

export function balanceService(
	host: string,
	headers: RawAxiosRequestHeaders,
	endpoint: string
): BalanceService {
	return {
		getBalances: async (
			chainId: number,
			address: Address
		): Promise<ServiceResult<Balances>> => {
			try {
				const response = await axios.get<BalancesDto>(
					`${host}/${endpoint}/${chainId}/balances/${address}`,
					{
						headers,
						params: {
							chainId,
							address
						}
					}
				)

				return {
					success: true,
					data: mapBalancesDtoToBalances(chainId, response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
