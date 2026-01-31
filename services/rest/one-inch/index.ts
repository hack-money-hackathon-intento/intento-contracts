import { RawAxiosRequestHeaders } from 'axios'
import { verifyEnvVars } from 'config/const'

import { balanceService } from './balance'
import { priceService } from './price'
import { swapService } from './swap'

function getApiKey(): string {
	const {
		register: { oneInch }
	} = verifyEnvVars()
	return oneInch.apiKey
}

function getHeaders(): RawAxiosRequestHeaders {
	const apiKey = getApiKey()

	return {
		authorization: `Bearer ${apiKey}`
	}
}

function getHost(): string {
	const host: string = 'https://api.1inch.com'

	return host
}

export function oneInchService() {
	const host = getHost()
	const headers = getHeaders()

	const { getBalances } = balanceService(host, headers, 'balance/v1.2')
	const { getPrices } = priceService(host, headers, 'price/v1.1')
	const { getTokens } = swapService(host, headers, 'swap/v6.1')

	return { getBalances, getPrices, getTokens }
}
