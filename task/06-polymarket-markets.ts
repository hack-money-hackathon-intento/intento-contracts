import { task } from 'hardhat/config'
import axios from 'axios'

const GAMMA_API = 'https://gamma-api.polymarket.com'

task('06-polymarket-markets', 'Fetch active Polymarket markets')
	.addOptionalParam('limit', 'Number of markets to show (default: 10)', '10')
	.addOptionalParam('tag', 'Filter by tag (e.g., crypto, politics)', 'crypto')
	.setAction(async (taskArgs) => {
		const limit = parseInt(taskArgs.limit as string, 10)
		const tag = taskArgs.tag as string

		// Fetch markets from Gamma API with tag filter
		const { data } = await axios.get(`${GAMMA_API}/markets`, {
			params: {
				limit,
				tag,
				closed: false,
				order: 'volume24hr',
				ascending: false
			},
			timeout: 30000
		})

		const markets = data || []

		console.log(`\n✓ Active ${tag.toUpperCase()} Markets (${markets.length}):\n`)

		markets.forEach((market: any, i: number) => {
			const volume = market.volume24hr
				? `$${(market.volume24hr / 1000).toFixed(1)}k`
				: 'N/A'
			const endDate = market.endDate
				? new Date(market.endDate).toLocaleDateString()
				: 'N/A'

			// Parse outcomes (real labels like "Yes", "No", "Trump", etc.)
			const outcomesArray = market.outcomes
				? JSON.parse(market.outcomes)
				: []
			
			// Parse prices
			const outcomePrices = market.outcomePrices
				? JSON.parse(market.outcomePrices)
				: {}
			
			// Parse token IDs
			const clobTokenIds = market.clobTokenIds
				? JSON.parse(market.clobTokenIds)
				: []

			console.log(`${i + 1}. ${market.question}`)
			console.log(`   Market ID: ${market.conditionId}`)
			console.log(`   24h Volume: ${volume} | Ends: ${endDate}`)
			
			if (outcomesArray.length > 0 && clobTokenIds.length > 0) {
				console.log(`   Outcomes:`)
				outcomesArray.forEach((outcome: string, idx: number) => {
					const price = outcomePrices[outcome] || outcomePrices[idx.toString()]
					const tokenId = clobTokenIds[idx]
					const priceDisplay = price ? `${(price * 100).toFixed(1)}¢` : 'N/A'
					console.log(`     - ${outcome}: ${priceDisplay} (Token: ${tokenId})`)
				})
			} else {
				console.log(`   Outcomes: N/A`)
			}
			console.log()
		})

		return markets
	})
