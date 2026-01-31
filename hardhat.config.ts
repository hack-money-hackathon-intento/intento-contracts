import '@nomicfoundation/hardhat-toolbox-viem'

import type { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
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
	}
}

export default config
