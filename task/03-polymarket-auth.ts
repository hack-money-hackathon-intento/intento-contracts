import { task } from 'hardhat/config'
import { ClobClient } from '@polymarket/clob-client'
import { Wallet } from 'ethers'
import { verifyEnvVars } from '@/config/const'

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

		const signer = new Wallet(pk)
		const client = new ClobClient('https://clob.polymarket.com', 137, signer)
		const creds = await client.deriveApiKey() // Derive existing key

		console.log(`\n✓ CLOB Credentials:\n  Key: ${creds.key}\n  Secret: ${creds.secret}\n  Passphrase: ${creds.passphrase}\n`)
		return creds
	})
