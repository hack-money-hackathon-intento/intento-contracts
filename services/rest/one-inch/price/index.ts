import axios from 'axios'
import { RawAxiosRequestHeaders } from 'axios'
import { Address } from 'viem'

import { ServiceResult } from '@/models/api.model'
import { APIError } from '@/models/api.model'
import { Prices } from '@/models/prices'
import { PricesDto } from '@/services/utils/dtos/prices.dto'
import { mapPricesDtoToPrices } from '@/services/utils/mappings/prices-dto-to-prices'

type PriceService = {
	getPrices: (
		chainId: number,
		tokenAddresses: Address[]
	) => Promise<ServiceResult<Prices>>
}

export function priceService(
	host: string,
	headers: RawAxiosRequestHeaders,
	endpoint: string
): PriceService {
	return {
		getPrices: async (
			chainId: number,
			tokenAddresses: Address[]
		): Promise<ServiceResult<Prices>> => {
			try {
				const response = await axios.get<PricesDto>(
					`${host}/${endpoint}/${chainId}/${tokenAddresses.join(',')}`,
					{
						headers,
						params: {
							currency: 'USD'
						}
					}
				)

				return {
					success: true,
					data: mapPricesDtoToPrices(chainId, 'USD', response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
