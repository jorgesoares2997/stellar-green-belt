# 🛡️ StellarVault: Advanced Yield-Bearing Vault

StellarVault is a production-ready Soroban dApp built for the **Stellar Green Belt**. It demonstrates advanced smart contract mechanics, inter-contract communication, and real-time event streaming.

---

## 🎯 Project Overview
StellarVault allows users to deposit underlying assets (like USDC) into a secure "Smart Vault." The Vault then automatically interacts with a Liquidity Pool contract to deploy those assets, earning yield for the users in a completely decentralized manner.

### Key Features
- **Inter-Contract Calls**: The Vault contract dynamically interacts with the Liquidity Pool.
- **Real-Time Activity**: Live event streaming for all on-chain actions.
- **Premium UX**: Mobile-first, high-end DeFi dashboard.
- **Production DevOps**: Automated CI/CD for both contracts and frontend.

---

## 🏗️ Technical Architecture

### Smart Contracts (`/contracts`)
- **Vault (`/vault`)**: The entry point for users. Handles share accounting and inter-contract logic.
- **Liquidity Pool (`/liquidity_pool`)**: The "Yield Engine" that manages the underlying assets.
- **Inter-Contract Interface**: Uses a Trait-based client for flexible and safe calls.

### Frontend (`/frontend`)
- **Next.js 15**: Leveraging the App Router for optimal performance.
- **Tailwind CSS**: Custom "Space & Glass" theme for a premium feel.
- **Stellar Wallets Kit**: Unified interface for Freighter and other wallets.
- **Framer Motion**: Smooth micro-animations for enhanced engagement.

---

## 🔁 CI/CD Pipeline
We use **GitHub Actions** to ensure every change meets production standards:
- ✅ **Contract Check**: Cargo clippy, format, and unit tests.
- ✅ **Build Check**: WASM compilation and Next.js production build.
- ✅ **Frontend Lint**: ESLint and TypeScript type checking.

---

## 🛠️ Step-by-Step Deployment Guide

### 1. Prerequisites & Environment
Ensure you have the following installed:
- [Rust & WASM Target](https://rustup.rs/): `rustup target add wasm32-unknown-unknown`
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli): `cargo install --locked soroban-cli`
- [Node.js & pnpm](https://pnpm.io/installation): `npm install -g pnpm`

### 2. Build, Deploy, and Initialize Smart Contracts (Testnet)
First, compile the contracts to WASM:
```bash
cd contracts
stellar contract build
```

Deploy LP and Vault contracts, and save IDs in shell variables:
```bash
# 1) Deploy Liquidity Pool (Yield Source)
LP_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_vault_lp.wasm \
  --source deployer \
  --network testnet)
echo "LP_ID=$LP_ID"

# 2) Deploy Vault (User entrypoint)
VAULT_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_vault.wasm \
  --source deployer \
  --network testnet)
echo "VAULT_ID=$VAULT_ID"
```

Get a valid Soroban token contract ID for native XLM on Testnet (do not use `asset deploy` here, as native SAC already exists):
```bash
TOKEN_ID=$(stellar contract id asset \
  --asset native \
  --network testnet)
echo "TOKEN_ID=$TOKEN_ID"
```

Initialize LP first, then Vault:
```bash
# 3) Initialize LP with token
stellar contract invoke \
  --id "$LP_ID" \
  --source deployer \
  --network testnet \
  -- initialize \
  --token "$TOKEN_ID"

# 4) Initialize Vault with token + LP
stellar contract invoke \
  --id "$VAULT_ID" \
  --source deployer \
  --network testnet \
  -- initialize \
  --token "$TOKEN_ID" \
  --lp_contract "$LP_ID"
```

Optional verification:
```bash
stellar contract invoke \
  --id "$VAULT_ID" \
  --source deployer \
  --network testnet \
  -- get_lp_address
```

### 3. Configure & Launch Frontend
1. Update `frontend/.env.local` with your deployed values:
```bash
NEXT_PUBLIC_VAULT_CONTRACT_ID=<VAULT_ID>
NEXT_PUBLIC_TOKEN_CONTRACT_ID=<TOKEN_ID>
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```
2. Install dependencies and start the dev server:
```bash
cd frontend
pnpm install
pnpm run dev
```
3. Open `http://localhost:3000` and connect your Freighter wallet (ensure it's on Testnet).

---

## 📊 Deliverables Checklist
- [x] Core Contract (Vault)
- [x] Inter-Contract Call (Vault -> Pool)
- [x] Event Streaming Logic
- [x] Next.js Frontend
- [x] CI/CD Pipeline
- [x] Comprehensive Documentation

---

## 🧩 Conventional Commits Summary
- `feat: initialize soroban workspace and project structure`
- `feat: implement liquidity pool contract with yield logic`
- `feat: implement vault contract with inter-contract calls`
- `fix: resolve rust lifetimes and import warnings`
- `feat: scaffold next.js frontend with tailwind`
- `feat: build premium dashboard UI with framer-motion`
- `feat: implement event streaming and stellar-sdk utilities`
- `chore: setup github actions ci pipeline`

---

**Developed for the Stellar Green Belt Challenge.**
