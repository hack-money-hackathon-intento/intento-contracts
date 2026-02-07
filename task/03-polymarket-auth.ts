import { task } from 'hardhat/config'
import { ClobClient } from '@polymarket/clob-client'
import { verifyEnvVars } from '@/config/const'
import { createV5CompatibleSigner } from '@/helpers/ethers-v5-signer'

task(
	'03-polymarket-auth',
	'Derive Polymarket CLOB API credentials'
)
	.addOptionalParam('nonce', 'Nonce (default: 0)', '0', undefined)
	.setAction(async (taskArgs) => {
		const nonce = parseInt(taskArgs.nonce as string, 10)
		const { register } = verifyEnvVars()

		let pk = (register.wallets.deployer.privateKey || '').trim()
		if (!pk) throw new Error('WALLET_DEPLOYER_PRIVATE_KEY missing in .env')
		if (!pk.startsWith('0x')) pk = '0x' + pk

		const signer = createV5CompatibleSigner(pk)
		const client = new ClobClient('https://clob.polymarket.com', 137, signer)
		const creds = await client.deriveApiKey() // Derive existing key

		console.log(`\n✓ CLOB Credentials:\n  Key: ${creds.key}\n  Secret: ${creds.secret}\n  Passphrase: ${creds.passphrase}\n`)
		return creds
	})
