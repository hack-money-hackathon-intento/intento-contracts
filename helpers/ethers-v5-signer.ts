import { Wallet } from 'ethers'

/**
 * Creates an ethers v5-compatible signer for Polymarket CLOB client
 * This is needed because @polymarket/clob-client expects ethers v5 API
 */
export function createV5CompatibleSigner(privateKey: string) {
	const wallet = new Wallet(privateKey)

	// Add v5 compatibility for _signTypedData
	if (!(wallet as any)._signTypedData && (wallet as any).signTypedData) {
		;(wallet as any)._signTypedData = async function (
			domain: any,
			types: any,
			value: any
		) {
			return this.signTypedData(domain, types, value)
		}
	}

	return wallet
}
