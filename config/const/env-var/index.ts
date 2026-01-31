import dotenv from 'dotenv'

import { ensureEnvVar } from '@/helpers/ensure-env-var'

dotenv.config()

export function verifyEnvVars() {
	const {
		ETHERSCAN_API_KEY,
		RPC_HTTPS_ARBITRUM,
		RPC_HTTPS_AVALANCHE,
		RPC_HTTPS_BASE,
		RPC_HTTPS_ETHEREUM,
		RPC_HTTPS_OPTIMISM,
		RPC_HTTPS_POLYGON,
		WALLET_DEPLOYER_PRIVATE_KEY
	} = process.env

	const register = {
		etherscan: {
			apiKey: ensureEnvVar(ETHERSCAN_API_KEY, 'ETHERSCAN_API_KEY')
		},

		rpc: {
			https: {
				arbitrum: ensureEnvVar(RPC_HTTPS_ARBITRUM, 'RPC_HTTPS_ARBITRUM'),
				avalanche: ensureEnvVar(RPC_HTTPS_AVALANCHE, 'RPC_HTTPS_AVALANCHE'),
				base: ensureEnvVar(RPC_HTTPS_BASE, 'RPC_HTTPS_BASE'),
				ethereum: ensureEnvVar(RPC_HTTPS_ETHEREUM, 'RPC_HTTPS_ETHEREUM'),
				optimism: ensureEnvVar(RPC_HTTPS_OPTIMISM, 'RPC_HTTPS_OPTIMISM'),
				polygon: ensureEnvVar(RPC_HTTPS_POLYGON, 'RPC_HTTPS_POLYGON')
			},
			ws: {}
		},

		wallets: {
			deployer: {
				publicKey: '',
				privateKey: ensureEnvVar(
					WALLET_DEPLOYER_PRIVATE_KEY,
					'WALLET_DEPLOYER_PRIVATE_KEY'
				)
			}
		}
	}

	return {
		register
	}
}
