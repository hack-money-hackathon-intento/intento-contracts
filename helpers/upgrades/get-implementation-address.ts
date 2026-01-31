import { upgrades } from 'hardhat'
import { Address } from 'viem'

export async function getImplementationAddress(
	proxyAddress: Address
): Promise<Address> {
	const implementationAddress =
		await upgrades.erc1967.getImplementationAddress(proxyAddress)

	return implementationAddress as Address
}

export async function getProxyAdmin(proxyAddress: Address): Promise<Address> {
	const proxyAdmin = await upgrades.erc1967.getAdminAddress(proxyAddress)

	return proxyAdmin as Address
}
