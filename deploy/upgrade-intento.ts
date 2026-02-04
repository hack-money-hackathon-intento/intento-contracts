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

const upgradeIntento: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment
) {
	const { deployments, network } = hre
	const { log, get, save } = deployments

	const intentoDeployment: Deployment = await get('Intento')
	const proxyAddress: string = intentoDeployment.address

	log('-----------------------------------')
	log('Upgrading Intento...')

	const intento: ContractFactory = await ethers.getContractFactory('Intento')

	const upgradedProxy = await upgrades.upgradeProxy(proxyAddress, intento)

	await wait(3000)

	const upgradedProxyAddress = await upgradedProxy.getAddress()

	const newImplementationAddress = await getImplementationAddress(
		upgradedProxyAddress as Address
	)

	log(`New Intento implementation deployed at: ${newImplementationAddress}`)

	await wait(5000)

	if (!developmentChains.includes(network.name)) {
		await verify(newImplementationAddress, [])
	}

	const artifact: ExtendedArtifact =
		await deployments.getExtendedArtifact('Intento')

	await save('Intento', {
		address: proxyAddress,
		implementation: newImplementationAddress,
		...artifact
	})

	log('-----------------------------------')
	log(`Intento upgraded successfully!`)
	log(`Proxy address: ${proxyAddress}`)
	log(`New implementation: ${newImplementationAddress}`)
}

upgradeIntento.tags = ['upgrade']

export default upgradeIntento
