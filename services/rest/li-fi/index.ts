import { tokensService } from './tokens'

function getHost(): string {
	const host: string = 'https://li.quest/v1'

	return host
}

export function liFiService() {
	const host = getHost()

	const { getTokens } = tokensService(host, 'tokens')

	return { getTokens }
}
