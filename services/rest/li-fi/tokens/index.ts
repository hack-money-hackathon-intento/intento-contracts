import axios from 'axios'

import { ServiceResult } from '@/models/api.model'
import { APIError } from '@/models/api.model'
import { TokensByChain } from '@/models/tokens.model'
import { TokensResponse } from '@/services/utils/dtos/tokens.dto'
import { mapTokensDtoToTokens } from '@/services/utils/mappings/tokens-dto-to-tokens'

type TokensService = {
	getTokens: (chainId: number) => Promise<ServiceResult<TokensByChain>>
}

export function tokensService(host: string, endpoint: string): TokensService {
	return {
		getTokens: async (
			chainId?: number
		): Promise<ServiceResult<TokensByChain>> => {
			try {
				const response = await axios.get<TokensResponse>(
					`${host}/${endpoint}`,
					{
						params: {
							chains: chainId ? chainId.toString() : '8453,10,137', // Base, Optimism, Polygon
							chainTypes: 'EVM',
							minPriceUSD: '0.1'
						}
					}
				)

				return {
					success: true,
					data: mapTokensDtoToTokens(response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
