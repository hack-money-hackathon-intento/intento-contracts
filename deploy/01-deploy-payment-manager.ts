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

const deployPaymentManager: DeployFunction = async (
	hre: HardhatRuntimeEnvironment
) => {
	const { ethers, upgrades } = hre
	const { getNamedAccounts, deployments, network } = hre
	const { log, save } = deployments
	const { deployer } = await getNamedAccounts()

	log(`Network: ${network.name}`)
	log('----------------------------------------------------')
	log('Deploying PaymentManager and waiting for confirmations...')

	const args: unknown[] = []

	const PaymentManager = await ethers.getContractFactory('PaymentManager')

	const proxy = await upgrades.deployProxy(PaymentManager, args)

	const deployTx = proxy.deploymentTransaction()

	if (deployTx) {
		log(`Proxy deployment tx: ${deployTx.hash}`)
	} else {
		log('⚠️ could not read the deployment transaction')
	}

	await proxy.waitForDeployment()

	const proxyAddress = (await proxy.getAddress()) as Address
	log(`PaymentManager proxy deployed at: ${proxyAddress}`)

	await wait(5000)

	const implementationAddress = await getImplementationAddress(proxyAddress)
	log(`PaymentManager implementation deployed at: ${implementationAddress}`)

	const proxyAdmin: string = await getProxyAdmin(proxyAddress)
	log(`PaymentManager proxy admin: ${proxyAdmin}`)

	if (!developmentChains.includes(network.name)) {
		await verify(proxyAddress, [])
	}

	const artifact: ExtendedArtifact =
		await deployments.getExtendedArtifact('PaymentManager')

	await save('PaymentManager', {
		address: proxyAddress,
		implementation: implementationAddress,
		...artifact
	})
}

export default deployPaymentManager
deployPaymentManager.tags = ['deploy', 'payment-manager']
