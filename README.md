# Intento Contracts

Hardhat project with Polymarket trading integration.

## Polymarket Scripts

Complete trading workflow:

```bash
# 1. Authenticate (derive API credentials)
bun run task:polymarket:auth

# 2. Check balance and allowance
bun run task:polymarket:balance

# 3. Approve balance allowance (off-chain signature)
bun run task:polymarket:approve

# 4. Browse markets
bun run task:polymarket:markets --tag crypto

# 5. Buy position
bun run task:polymarket:buy \
  --market-id "0x..." \
  --token-id "123..." \
  --outcome "Yes" \
  --amount "10"
```

## Setup

```bash
bun install
cp .env.example .env
# Add WALLET_DEPLOYER_PRIVATE_KEY to .env
```
