import { task } from 'hardhat/config'
import { ClobClient } from '@polymarket/clob-client'
import { verifyEnvVars } from '@/config/const'
import { Side } from '@polymarket/clob-client/dist/types'
import { deriveSafe } from '@polymarket/builder-relayer-client/dist/builder/derive'
import { getContractConfig } from '@polymarket/builder-relayer-client/dist/config'
import { createV5CompatibleSigner } from '@/helpers/ethers-v5-signer'

task('07-polymarket-buy', 'Buy a position in a Polymarket market')
	.addParam('marketId', 'Market condition ID')
	.addParam('tokenId', 'Token ID for the outcome')
	.addParam('outcome', 'Outcome (e.g., Yes, No, 0, 1)')
	.addParam('amount', 'Amount in USDC to spend')
	.addOptionalParam('price', 'Limit price (0-1, e.g., 0.65 for 65¢)')
	.setAction(async (taskArgs) => {
		const { marketId, tokenId, outcome, amount, price } = taskArgs
		const { register } = verifyEnvVars()

		let pk = (register.wallets.deployer.privateKey || '').trim()
		if (!pk) throw new Error('WALLET_DEPLOYER_PRIVATE_KEY missing in .env')
		if (!pk.startsWith('0x')) pk = '0x' + pk

		const signer = createV5CompatibleSigner(pk)
		const eoaAddress = signer.address

		// Derive Safe address
		const config = getContractConfig(137)
		const safeAddress = deriveSafe(eoaAddress, config.SafeContracts.SafeFactory)

		// Get or derive API credentials
		const client = new ClobClient(
			'https://clob.polymarket.com',
			137,
			signer,
			undefined,
			2, // GNOSIS_SAFE signature type
			safeAddress
		)
		console.log('\n✓ Deriving API credentials...')
		const creds = await client.deriveApiKey() // Derive existing key

		// Re-initialize client with credentials for trading
		const tradingClient = new ClobClient(
			'https://clob.polymarket.com',
			137,
			signer,
			creds,
			2, // GNOSIS_SAFE signature type
			safeAddress
		)

		console.log(`\n✓ Placing BUY order:`)
		console.log(`  Market: ${marketId}`)
		console.log(`  Outcome: ${outcome} (Token: ${tokenId})`)
		console.log(`  Amount: ${amount} USDC`)
		if (price) console.log(`  Limit Price: ${price}`)

		// Create market order (or limit order if price specified)
		if (price) {
			// Limit order
			const order = await tradingClient.createAndPostOrder({
				tokenID: tokenId,
				side: Side.BUY,
				amount: parseFloat(amount),
				price: parseFloat(price)
			})
			console.log(`\n✓ Limit order placed!`)
			console.log(`  Order ID: ${order.orderID}`)
			return order
		} else {
			// Market order
			const order = await tradingClient.createAndPostMarketOrder({
				tokenID: tokenId,
				side: Side.BUY,
				amount: parseFloat(amount)
			})
			console.log(`\n✓ Market order executed!`)
			console.log(`  Order ID: ${order.orderID}`)
			return order
		}
	})
