import { Address, getAddress } from 'viem'

import { Price, Prices } from '@/models/prices'
import { PricesDto } from '@/services/utils/dtos/prices.dto'

export function mapPricesDtoToPrices(
	chainId: number,
	currencies: string,
	response: PricesDto
): Prices {
	const prices: Price[] = Object.entries(response).map(([address, price]) => ({
		address: getAddress(address as Address),
		price: Number(price)
	}))

	return {
		chainId,
		prices,
		currencies
	}
}
