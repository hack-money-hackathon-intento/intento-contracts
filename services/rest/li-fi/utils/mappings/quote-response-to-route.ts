import { getAddress, type Hex, hexToBigInt } from 'viem'

import { LiFiRoute } from '@/models/li-fi-route.model'

import { QuoteResponse } from '../dtos/quote.dto'

export function mapQuoteResponseToRoute(quote: QuoteResponse): LiFiRoute {
	if (!quote.transactionRequest) {
		throw new Error('Missing transactionRequest')
	}

	return {
		to: getAddress(quote.transactionRequest.to as string),
		approval: getAddress(quote.estimate.approvalAddress as string),
		value: hexToBigInt(quote.transactionRequest.value as Hex),
		data: quote.transactionRequest.data as Hex
	}
}
