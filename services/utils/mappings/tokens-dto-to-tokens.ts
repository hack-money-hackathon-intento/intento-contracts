import { Address, getAddress } from 'viem'

import { Token, Tokens } from '@/models/tokens.model'
import { TokensResponse } from '@/services/utils/dtos/tokens.dto'

export function mapTokensDtoToTokens(
	chainId: number,
	response: TokensResponse
): Tokens {
	const tokens: Token[] = Object.entries(response.tokens).map(
		([address, token]) => ({
			address: getAddress(address as Address),
			symbol: token.symbol,
			decimals: token.decimals,
			name: token.name,
			logoURI: token.logoURI,
			eip2612: token.eip2612,
			tags: token.tags
		})
	)

	return {
		chainId,
		tokens
	}
}
