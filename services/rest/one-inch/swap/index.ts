import axios from 'axios'
import { RawAxiosRequestHeaders } from 'axios'

import { ServiceResult } from '@/models/api.model'
import { APIError } from '@/models/api.model'
import { Tokens } from '@/models/tokens.model'
import { TokensResponse } from '@/services/utils/dtos/tokens.dto'
import { mapTokensDtoToTokens } from '@/services/utils/mappings/tokens-dto-to-tokens'

type SwapService = {
	getTokens: (chainId: number) => Promise<ServiceResult<Tokens>>
}

export function swapService(
	host: string,
	headers: RawAxiosRequestHeaders,
	endpoint: string
): SwapService {
	return {
		getTokens: async (chainId: number): Promise<ServiceResult<Tokens>> => {
			try {
				const response = await axios.get<TokensResponse>(
					`${host}/${endpoint}/${chainId}/tokens`,
					{
						headers,
						params: {
							chainId
						}
					}
				)

				return {
					success: true,
					data: mapTokensDtoToTokens(chainId, response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
