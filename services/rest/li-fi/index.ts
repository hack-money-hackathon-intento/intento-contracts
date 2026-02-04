import { walletsIntegrations } from './integrations/balances'
import { quoteIntegrations } from './integrations/quote'

function getHost(): string {
	return 'https://li.quest/v1'
}

export function liFiService() {
	const host = getHost()

	const { getBalances } = walletsIntegrations(host, 'wallets')
	const { getQuote } = quoteIntegrations(host, 'quote')

	return {
		getBalances,
		getQuote
	}
}
