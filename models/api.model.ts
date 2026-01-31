export interface APIError {
	message: string
	status: number
	statusText: string
	details: unknown
	url: string
	method: string
	timestamp: string
}

export interface ContractError {
	message: string
	name?: string
	reason?: string
	data?: unknown
	stack?: string
	timestamp: string
	method?: string
}

export interface ServiceResult<T> {
	success: boolean
	data?: T
	error?: APIError | ContractError
}
