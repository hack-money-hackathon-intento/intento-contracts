import axios from 'axios'
import { Address } from 'viem'

import { ServiceResult } from '@/models/api.model'
import { APIError } from '@/models/api.model'
import { LiFiBalances } from '@/models/li-fi-balances.model'

import { BalancesResponse } from '../../utils/dtos/balances.dto'
import { mapBalancesResponseToBalances } from '../../utils/mappings/balances-dto-to-balances'

type WalletsIntegrations = {
	getBalances: (address: Address) => Promise<ServiceResult<LiFiBalances[]>>
}

export function walletsIntegrations(
	host: string,
	endpoint: string
): WalletsIntegrations {
	return {
		getBalances: async (address: Address) => {
			try {
				const response = await axios.get<BalancesResponse>(
					`${host}/${endpoint}/${address}/balances`,
					{
						params: {
							extended: 'true'
						}
					}
				)

				return {
					success: true,
					data: mapBalancesResponseToBalances(response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
