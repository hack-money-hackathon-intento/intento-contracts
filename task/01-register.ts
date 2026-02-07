import { task } from 'hardhat/config'
import { Address, encodeFunctionData } from 'viem'

import { routeToBytes } from '@/helpers/route-to-bytes'
import { liFiService } from '@/services/rest/li-fi'
import { oneInchService } from '@/services/rest/one-inch'

task('01-register', 'register account').setAction(async (_, hre) => {
	try {
		const { getBalances } = oneInchService()
		const { getBalances: getBalancesLiFi, getQuote } = liFiService()

		const { deployments, network, viem, getNamedAccounts } = hre
		const { deployer } = await getNamedAccounts()
		const deployerAddress = deployer as Address

		const publicClient = await viem.getPublicClient()

		const intentoDeployment = await deployments.get('Intento')
		const intentoAddress = intentoDeployment.address as Address

		const intento = await viem.getContractAt('Intento', intentoAddress)

		const chainId = network.config.chainId

		if (!chainId) {
			throw new Error('Chain ID is not set')
		}

		const resultBalances = await getBalancesLiFi(deployerAddress)

		if (!resultBalances.success || !resultBalances.data) {
			throw new Error('Failed to get balances')
		}

		const balances = resultBalances.data

		// for (const balance of balances) {
		const fromChain = 8453 // Base
		const toChain = 137 // Polygon

		// for (const token of balance.tokens) {
		const fromToken = '0x6B2504A03ca4D43d0D73776F6aD46dAb2F2a4cFD' as Address // USDC
		const toToken = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as Address
		const fromAmount = '70821914991126524257'
		const fromAddress = '0xD2Ed7b56fF997DA6f5b7b72Cc7676Bc9BA9B9240' as Address
		const toAddress = deployerAddress
		const slippage = 0.005
		const order = 'FASTEST'

		const resultQuote = await getQuote({
			fromChain,
			toChain,
			fromToken,
			toToken,
			fromAmount,
			fromAddress,
			toAddress,
			slippage,
			order
		})

		if (!resultQuote.success || !resultQuote.data) {
			throw new Error('Failed to get quote')
		}

		const quote = resultQuote.data

		const orderId = '0x1234567890'
		const from = deployerAddress
		const tokens = [fromToken]
		const amounts = [BigInt(fromAmount)]
		const routes = [routeToBytes(quote)]
		const hasEns = false // TODO: Check if user has ENS
		const polymarketMarketId = '0x25aa90b3cd98305e849189b4e8b770fc77fe89bccb7cf9656468414e01145d38' // TODO: Add actual market ID
		const polymarketTokenId = 111080671036126109659854287535401661966194360665829017654832975124868412594547n // TODO: Add actual token ID

		const calldata = encodeFunctionData({
			abi: intento.abi,
			functionName: 'executePayment',
			args: [orderId, from, tokens, amounts, routes, hasEns, polymarketMarketId, polymarketTokenId]
		})

		const txExecutePayment = await intento.write.executePayment([
			orderId,
			from,
			tokens,
			amounts,
			routes,
			hasEns,
			polymarketMarketId,
			polymarketTokenId
		])

		// await publicClient.waitForTransactionReceipt({ hash: txExecutePayment })

		console.log(txExecutePayment)

		// }
		// }

		// check if the account is registered
		// const isRegistered = await paymentManager.read.isRegistered([
		// 	deployerAddress
		// ])
	} catch (error) {
		console.error('❌', error)
	}
})
