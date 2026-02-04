import { encodeAbiParameters, Hex } from 'viem'

import { LiFiRoute } from '@/models/li-fi-route.model'

export function routeToBytes(route: LiFiRoute): Hex {
	return encodeAbiParameters(
		[
			{ name: 'to', type: 'address' },
			{ name: 'approval', type: 'address' },
			{ name: 'value', type: 'uint256' },
			{ name: 'data', type: 'bytes' }
		],
		[route.to, route.approval, route.value, route.data]
	)
}
