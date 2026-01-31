import { getAddress } from 'viem'

import { TokensByChain } from '@/models/tokens.model'

import { TokensResponse } from '../dtos/tokens.dto'

export function mapTokensDtoToTokens(response: TokensResponse): TokensByChain {
	return Object.entries(response.tokens).reduce((acc, [chainId, tokenDtos]) => {
		acc[chainId] = tokenDtos.map(token => ({
			chainId: Number(chainId),
			address: getAddress(token.address),
			symbol: token.symbol,
			decimals: token.decimals,
			name: token.name,
			priceUSD: token.priceUSD,
			coinKey: token.coinKey,
			logoURI: token.logoURI
		}))
		return acc
	}, {} as TokensByChain)
}
