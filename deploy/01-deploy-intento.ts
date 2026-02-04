import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction, ExtendedArtifact } from 'hardhat-deploy/types'
import { Address } from 'viem'

import { developmentChains } from '@/config/const'
import {
	getImplementationAddress,
	getProxyAdmin
} from '@/helpers/upgrades/get-implementation-address'
import { verify } from '@/helpers/verify'
import { wait } from '@/helpers/wait.util'

const deployIntento: DeployFunction = async (
	hre: HardhatRuntimeEnvironment
) => {
	const { ethers, upgrades } = hre
	const { getNamedAccounts, deployments, network } = hre
	const { log, save } = deployments
	const { deployer } = await getNamedAccounts()

	log(`Network: ${network.name}`)
	log('----------------------------------------------------')
	log('Deploying Intento and waiting for confirmations...')

	const args: unknown[] = [deployer]

	const Intento = await ethers.getContractFactory('Intento')

	const proxy = await upgrades.deployProxy(Intento, args)

	const deployTx = proxy.deploymentTransaction()

	if (deployTx) {
		log(`Proxy deployment tx: ${deployTx.hash}`)
	} else {
		log('⚠️ could not read the deployment transaction')
	}

	await proxy.waitForDeployment()

	const proxyAddress = (await proxy.getAddress()) as Address
	log(`Intento proxy deployed at: ${proxyAddress}`)

	await wait(5000)

	const implementationAddress = await getImplementationAddress(proxyAddress)
	log(`Intento implementation deployed at: ${implementationAddress}`)

	const proxyAdmin: string = await getProxyAdmin(proxyAddress)
	log(`Intento proxy admin: ${proxyAdmin}`)

	if (!developmentChains.includes(network.name)) {
		await verify(proxyAddress, [])
	}

	const artifact: ExtendedArtifact =
		await deployments.getExtendedArtifact('Intento')

	await save('Intento', {
		address: proxyAddress,
		implementation: implementationAddress,
		...artifact
	})
}

export default deployIntento
deployIntento.tags = ['deploy', 'intento']
