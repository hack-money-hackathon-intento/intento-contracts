import 'tsconfig-paths/register'
import '@nomicfoundation/hardhat-toolbox-viem'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-deploy'

import type { HardhatUserConfig } from 'hardhat/config'
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

import { verifyEnvVars } from '@/config/const'

// Environment variables
const { register } = verifyEnvVars()

// Accounts
const accounts: string[] = [register.wallets.deployer.privateKey]

const config: HardhatUserConfig = {
	defaultNetwork: 'hardhat',

	networks: {
		hardhat: {
			allowUnlimitedContractSize: true,
			chainId: 1337
		},
		localhost: {
			url: 'http://127.0.0.1:8545',
			chainId: localhost.id
		},
		[arbitrum.name]: {
			url: register.rpc.https.arbitrum,
			accounts,
			chainId: arbitrum.id
		},
		[arbitrumSepolia.name]: {
			url: arbitrumSepolia.rpcUrls.default.http[0],
			accounts,
			chainId: arbitrumSepolia.id
		},
		[avalanche.name]: {
			url: register.rpc.https.avalanche,
			accounts,
			chainId: avalanche.id
		},
		[avalancheFuji.name]: {
			url: avalancheFuji.rpcUrls.default.http[0],
			accounts,
			chainId: avalancheFuji.id
		},
		[base.name]: {
			url: register.rpc.https.base,
			accounts,
			chainId: base.id
		},
		[baseSepolia.name]: {
			url: baseSepolia.rpcUrls.default.http[0],
			accounts,
			chainId: baseSepolia.id
		},
		[mainnet.name]: {
			url: register.rpc.https.ethereum,
			accounts,
			chainId: mainnet.id
		},
		[sepolia.name]: {
			url: sepolia.rpcUrls.default.http[0],
			accounts,
			chainId: sepolia.id
		},
		[optimism.name]: {
			url: register.rpc.https.optimism,
			accounts,
			chainId: optimism.id
		},
		[optimismSepolia.name]: {
			url: optimismSepolia.rpcUrls.default.http[0],
			accounts,
			chainId: optimismSepolia.id
		},
		[polygon.name]: {
			url: register.rpc.https.polygon,
			accounts,
			chainId: polygon.id
		},
		[polygonAmoy.name]: {
			url: polygonAmoy.rpcUrls.default.http[0],
			accounts,
			chainId: polygonAmoy.id
		}
	},

	namedAccounts: {
		deployer: { default: 0 }
	},

	sourcify: { enabled: true },

	solidity: {
		compilers: [
			{
				version: '0.8.30',
				settings: {
					optimizer: { enabled: true, runs: 200 },
					evmVersion: 'osaka',
					viaIR: false
				}
			}
		]
	},

	etherscan: {
		apiKey: register.etherscan.apiKey,
		customChains: [
			{
				network: 'optimisticSepolia',
				chainId: optimismSepolia.id,
				urls: {
					apiURL: 'https://api-sepolia-optimistic.etherscan.io/api',
					browserURL: 'https://sepolia-optimism.etherscan.io'
				}
			}
		]
	},

	mocha: { timeout: 200000 }
}

export default config
