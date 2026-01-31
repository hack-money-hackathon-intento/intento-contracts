import { ContractFactory } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import {
	DeployFunction,
	Deployment,
	ExtendedArtifact
} from 'hardhat-deploy/dist/types'
import { Address } from 'viem'

import { developmentChains } from '@/config/const'
import { getImplementationAddress } from '@/helpers/upgrades/get-implementation-address'
import { verify } from '@/helpers/verify'
import { wait } from '@/helpers/wait.util'

const upgradePaymentManager: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment
) {
	const { deployments, network } = hre
	const { log, get, save } = deployments

	const inhabitDeployment: Deployment = await get('PaymentManager')
	const proxyAddress: string = inhabitDeployment.address

	log('-----------------------------------')
	log('Upgrading PaymentManager...')

	const paymentManager: ContractFactory =
		await ethers.getContractFactory('PaymentManager')

	const upgradedProxy = await upgrades.upgradeProxy(
		proxyAddress,
		paymentManager
	)

	await wait(3000)

	const upgradedProxyAddress = await upgradedProxy.getAddress()

	const newImplementationAddress = await getImplementationAddress(
		upgradedProxyAddress as Address
	)

	log(
		`New PaymentManager implementation deployed at: ${newImplementationAddress}`
	)

	await wait(5000)

	if (!developmentChains.includes(network.name)) {
		await verify(newImplementationAddress, [])
	}

	const artifact: ExtendedArtifact =
		await deployments.getExtendedArtifact('PaymentManager')

	await save('PaymentManager', {
		address: proxyAddress,
		implementation: newImplementationAddress,
		...artifact
	})

	log('-----------------------------------')
	log(`PaymentManager upgraded successfully!`)
	log(`Proxy address: ${proxyAddress}`)
	log(`New implementation: ${newImplementationAddress}`)
}

upgradePaymentManager.tags = ['upgrade']

export default upgradePaymentManager
