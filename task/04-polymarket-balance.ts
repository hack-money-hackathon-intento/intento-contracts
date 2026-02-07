import { task } from 'hardhat/config'
import { ClobClient } from '@polymarket/clob-client'
import { verifyEnvVars } from '@/config/const'
import { AssetType } from '@polymarket/clob-client/dist/types'
import { deriveSafe } from '@polymarket/builder-relayer-client/dist/builder/derive'
import { getContractConfig } from '@polymarket/builder-relayer-client/dist/config'
import { createV5CompatibleSigner } from '@/helpers/ethers-v5-signer'

task('04-polymarket-balance', 'Check USDC balance and allowance on Polymarket')
	.setAction(async () => {
		const { register } = verifyEnvVars()

		let pk = (register.wallets.deployer.privateKey || '').trim()
		if (!pk) throw new Error('WALLET_DEPLOYER_PRIVATE_KEY missing in .env')
		if (!pk.startsWith('0x')) pk = '0x' + pk

		const signer = createV5CompatibleSigner(pk)
		const eoaAddress = signer.address

		// Step 1: Derive Safe address (deterministic)
		const config = getContractConfig(137) // Polygon
		const safeAddress = deriveSafe(eoaAddress, config.SafeContracts.SafeFactory)

		console.log(`\n✓ EOA: ${eoaAddress}`)
		console.log(`✓ Safe Address (derived): ${safeAddress}`)

		// Initialize client with Safe as funder
		const client = new ClobClient(
			'https://clob.polymarket.com',
			137,
			signer,
			undefined,
			2, // GNOSIS_SAFE signature type
			safeAddress
		)
		
		// Derive existing API key (not create)
		const creds = await client.deriveApiKey()

		const tradingClient = new ClobClient(
			'https://clob.polymarket.com',
			137,
			signer,
			creds,
			2,
			safeAddress
		)

		try {
			// Get balance and allowance
			const balanceInfo = await tradingClient.getBalanceAllowance({
				asset_type: AssetType.COLLATERAL
			})

			const balance = parseFloat(balanceInfo.balance || '0') / 1e6 // USDC has 6 decimals
			const allowance = parseFloat(balanceInfo.allowance || '0') / 1e6

			console.log(`\nBalance: ${balance.toFixed(2)} USDC`)
			console.log(`Allowance: ${allowance === 0 ? 'Unlimited' : allowance.toFixed(2)} USDC`)

			if (balance === 0) {
				console.log('\n⚠️  No tienes USDC en tu Safe wallet en Polygon.')
				console.log(`   Envía USDC a: ${safeAddress}`)
				console.log('   Bridge: https://wallet.polygon.technology/polygon/bridge')
			}

			if (allowance === 0 || allowance < balance) {
				console.log(
					'\n⚠️  Necesitas aprobar allowance para que Polymarket pueda usar tu USDC.'
				)
				console.log('   Ejecuta: bun run task:polymarket:approve')
			} else {
				console.log('\n✓ Todo listo para operar!')
			}

			return balanceInfo
		} catch (error: any) {
			console.error('\n❌ Error:', error.message)
			throw error
		}
	})
