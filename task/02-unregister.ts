import { task } from 'hardhat/config'
import { Address } from 'viem'

import { wait } from '@/helpers/wait.util'

task('02-unregister', 'unregister account').setAction(async (_, hre) => {
	try {
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

		if (!isRegistered) {
			console.log('Account is not registered')
			return
		} else {
			const txUnregister = await paymentManager.write.unregister()

			await publicClient.waitForTransactionReceipt({ hash: txUnregister })
			await wait(10000)

			const isRegisteredAfter = await paymentManager.read.isRegistered([
				deployerAddress
			])

			console.log(`Is registered after: ${isRegisteredAfter}`)
		}
	} catch (error) {
		console.error('❌', error)
	}
})
