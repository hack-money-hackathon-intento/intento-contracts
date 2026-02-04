import { Address, Hex } from 'viem'

export type StepType = 'swap' | 'cross' | '' | 'protocol'

export interface ToolDetails {
	key: string
	name: string
	logoURI?: string
}

export interface Token {
	address: Address
	chainId: number
	symbol: string
	decimals: number
	name: string
	logoURI?: string
	priceUSD?: string
	coinKey?: string
	tags?: string[]
}

export interface FeeSplit {
	integratorFee?: string
	Fee?: string
	// other fee split keys can exist
	[k: string]: unknown
}

export interface FeeCost {
	name: string
	description?: string
	token: Token
	amount?: string
	amountUSD: string
	percentage: string
	included: boolean
	feeSplit?: FeeSplit
}

export interface GasCost {
	type: 'SUM' | 'APPROVE' | 'SEND' | string
	price?: string
	estimate?: string
	limit?: string
	amount: string
	amountUSD?: string
	token?: Token
}

export interface Action {
	fromToken: Token
	toToken: Token

	fromAmount: string
	fromChainId: number
	toChainId: number

	slippage?: number
	fromAddress?: Address
	toAddress?: Address

	// present on included steps in your response
	jitoBundle?: boolean
	destinationGasConsumption?: string

	// allow future additions without breaking
	[k: string]: unknown
}

export interface Estimate {
	tool: string
	approvalAddress: Address

	fromAmount: string
	toAmount: string
	toAmountMin: string

	executionDuration: number

	fromAmountUSD?: string
	toAmountUSD?: string

	feeCosts: FeeCost[]
	gasCosts: GasCost[]

	// sometimes exists depending on tool
	data?: Record<string, unknown>

	[k: string]: unknown
}

export interface IncludedStep {
	id: string
	type: StepType
	tool: string
	toolDetails: ToolDetails
	action: Action
	estimate: Estimate
}

export interface TransactionRequest {
	from: Address
	to: Address
	data: Hex
	value: Hex

	chainId: number

	gasPrice?: Hex
	gasLimit?: Hex

	// sometimes providers include nonce, maxFeePerGas, maxPriorityFeePerGas, etc.
	[k: string]: unknown
}

/**
 * This is the response you got from /v1/quote
 * (It’s a “Step” object + transactionRequest)
 */
export interface QuoteResponse {
	type: StepType
	id: string

	tool: string
	toolDetails: ToolDetails

	action: Action
	estimate: Estimate

	includedSteps?: IncludedStep[]

	integrator?: string

	transactionRequest?: TransactionRequest
	transactionId?: Hex

	[k: string]: unknown
}
