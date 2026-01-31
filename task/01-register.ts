import { task } from 'hardhat/config'
import { Address, zeroAddress } from 'viem'

import { wait } from '@/helpers/wait.util'
import { liFiService } from '@/services/rest/li-fi'
import { oneInchService } from '@/services/rest/one-inch'

task('01-register', 'register account').setAction(async (_, hre) => {
	try {
		const { getBalances } = oneInchService()
		const { getTokens } = liFiService()

		const { deployments, network, viem, getNamedAccounts } = hre
		const { deployer } = await getNamedAccounts()
		const deployerAddress = deployer as Address

		const publicClient = await viem.getPublicClient()

		const paymentManagerDeployment = await deployments.get('PaymentManager')
		const paymentManagerAddress = paymentManagerDeployment.address as Address

		const paymentManager = await viem.getContractAt(
			'PaymentManager',
			paymentManagerAddress
		)

		const chainId = network.config.chainId

		if (!chainId) {
			throw new Error('Chain ID is not set')
		}

		// check if the account is registered

		const isRegistered = await paymentManager.read.isRegistered([
			deployerAddress
		])

		if (isRegistered) {
			console.log('Account is already registered')
			return
		} else {
			// get balances
			const response = await getBalances(chainId, deployerAddress)

			if (!response.success || !response.data) {
				throw new Error('Failed to get balances')
			}

			const balances = response.data.balances

			// get tokens
			const tokens = await getTokens(chainId)

			if (!tokens.success || !tokens.data) {
				throw new Error('Failed to get tokens')
			}

			const balancesAddresses = balances
				.map(balance => balance.address)
				.filter(address => address !== zeroAddress)

			const tokensData = tokens.data

			const filteredTokens = tokensData[chainId].filter(token =>
				balancesAddresses.includes(token.address)
			)

			const filteredTokensAddresses = filteredTokens.map(token => token.address)

			// are tokens enabled
			const areTokensEnabled = await paymentManager.read.areTokensEnabled([
				deployerAddress,
				filteredTokensAddresses
			])

			const tokensNotEnabled = filteredTokensAddresses.filter(
				(_token, index) => !areTokensEnabled[index]
			)

			console.dir(tokensNotEnabled, { depth: null })

			const txRegister = await paymentManager.write.register([
				tokensNotEnabled.length > 0 ? tokensNotEnabled : [zeroAddress]
			])

			await publicClient.waitForTransactionReceipt({ hash: txRegister })
			await wait(1000)

			const isRegisteredAfter = await paymentManager.read.isRegistered([
				deployerAddress
			])

			console.log(`Is registered after: ${isRegisteredAfter}`)
		}
	} catch (error) {
		console.error('❌', error)
	}
})
