import { task } from 'hardhat/config'
import { ClobClient } from '@polymarket/clob-client'
import { Wallet } from 'ethers'
import { verifyEnvVars } from '@/config/const'
import { AssetType } from '@polymarket/clob-client/dist/types'
import { deriveSafe } from '@polymarket/builder-relayer-client/dist/builder/derive'
import { getContractConfig } from '@polymarket/builder-relayer-client/dist/config'

task('05-polymarket-approve', 'Approve USDC allowance for Polymarket')
	.addOptionalParam('amount', 'Amount to approve (default: unlimited)', '0')
	.setAction(async (taskArgs) => {
		const { register } = verifyEnvVars()

		let pk = (register.wallets.deployer.privateKey || '').trim()
		if (!pk) throw new Error('WALLET_DEPLOYER_PRIVATE_KEY missing in .env')
		if (!pk.startsWith('0x')) pk = '0x' + pk

		const signer = new Wallet(pk)
		const eoaAddress = signer.address

		// Derive Safe address
		const config = getContractConfig(137)
		const safeAddress = deriveSafe(eoaAddress, config.SafeContracts.SafeFactory)

		// Initialize client with Safe as funder
		const client = new ClobClient(
			'https://clob.polymarket.com',
			137,
			signer,
			undefined,
			2,
			safeAddress
		)
		
		// Derive existing API key
		const creds = await client.deriveApiKey()

		const tradingClient = new ClobClient(
			'https://clob.polymarket.com',
			137,
			signer,
			creds,
			2,
			safeAddress
		)

		console.log('\n✓ Aprobando allowance...')

		try {
			await tradingClient.updateBalanceAllowance({
				asset_type: AssetType.COLLATERAL
			})

			console.log('\n✓ Allowance aprobado exitosamente!')
			console.log('   Ahora puedes ejecutar órdenes de compra.')

			return true
		} catch (error: any) {
			console.error('\n❌ Error:', error.message)
			throw error
		}
	})
