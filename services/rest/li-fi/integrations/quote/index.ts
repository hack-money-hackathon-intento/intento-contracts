import axios from 'axios'
import { Address } from 'viem'

import { ServiceResult } from '@/models/api.model'
import { APIError } from '@/models/api.model'
import { LiFiRoute } from '@/models/li-fi-route.model'

import { QuoteResponse } from '../../utils/dtos/quote.dto'
import { mapQuoteResponseToRoute } from '../../utils/mappings/quote-response-to-route'

type Quote = {
	fromChain: number
	toChain: number
	fromToken: Address
	toToken: Address
	fromAmount: string
	fromAddress: Address
	toAddress: Address
	slippage: number
	order: string
}

type QuoteIntegrations = {
	getQuote: (quote: Quote) => Promise<ServiceResult<LiFiRoute>>
}

export function quoteIntegrations(
	host: string,
	endpoint: string
): QuoteIntegrations {
	return {
		getQuote: async (quote: Quote) => {
			try {
				const response = await axios.get<QuoteResponse>(`${host}/${endpoint}`, {
					params: quote
				})

				return {
					success: true,
					data: mapQuoteResponseToRoute(response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
