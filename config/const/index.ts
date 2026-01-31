export { verifyEnvVars } from './env-var'
import {
	arbitrum,
	arbitrumSepolia,
	avalanche,
	avalancheFuji,
	base,
	baseSepolia,
	localhost,
	mainnet,
	optimism,
	optimismSepolia,
	polygon,
	polygonAmoy,
	sepolia
} from 'viem/chains'

import { NetworkConfigInfo } from '@/models'

export const developmentChains = [localhost.name, 'hardhat']

export const networkConfig: NetworkConfigInfo = {
	[arbitrum.name]: {
		blockConfirmations: 3
	},
	[arbitrumSepolia.name]: {
		blockConfirmations: 3
	},
	[avalanche.name]: {
		blockConfirmations: 3
	},
	[avalancheFuji.name]: {
		blockConfirmations: 3
	},
	[base.name]: {
		blockConfirmations: 3
	},
	[baseSepolia.name]: {
		blockConfirmations: 3
	},
	[mainnet.name]: {
		blockConfirmations: 3
	},
	[sepolia.name]: {
		blockConfirmations: 3
	},
	[optimism.name]: {
		blockConfirmations: 3
	},
	[optimismSepolia.name]: {
		blockConfirmations: 3
	},
	[polygon.name]: {
		blockConfirmations: 3
	},
	[polygonAmoy.name]: {
		blockConfirmations: 3
	}
}
