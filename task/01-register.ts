import { task } from 'hardhat/config'
import { Address, zeroAddress } from 'viem'

import { oneInchService } from '@/services/rest/one-inch'

task('01-register', 'register account').setAction(async (_, hre) => {
	try {
		const { getBalances } = oneInchService()

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
			const response = await getBalances(chainId, deployerAddress)

			if (!response.success || !response.data) {
				throw new Error('Failed to get balances')
			}

			const balances = response.data.balances
			console.dir(balances, { depth: null })

			const balancesAddresses = balances
				.map(balance => balance.address)
				.filter(address => address !== zeroAddress)

			const txRegister = await paymentManager.write.register([
				balancesAddresses
			])

			await publicClient.waitForTransactionReceipt({ hash: txRegister })

			const isRegisteredAfter = await paymentManager.read.isRegistered([
				deployerAddress
			])

			console.log(`Is registered after: ${isRegisteredAfter}`)
		}
	} catch (error) {
		console.error('❌', error)
	}
})
