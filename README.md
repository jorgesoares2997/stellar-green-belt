# StellarVault

[![StellarVault CI](https://github.com/jorgesoares2997/stellar-green-belt/actions/workflows/ci.yml/badge.svg)](https://github.com/jorgesoares2997/stellar-green-belt/actions/workflows/ci.yml)

StellarVault is a Soroban-based DeFi vault demo for Stellar Green Belt. Users deposit tokens into a Vault contract, the Vault performs an inter-contract call into a Liquidity Pool contract, and the frontend provides wallet-driven interactions with live activity updates from RPC events.

## Live Demo

- Frontend: [https://stellar-green-belt-frontend.vercel.app/](https://stellar-green-belt-frontend.vercel.app/)

## Mobile Responsive Screenshot

![Mobile responsive preview](docs/images/mobile-responsive.png)

## Why This Project Exists

- Demonstrate Soroban inter-contract architecture in a realistic dApp flow.
- Show end-to-end execution from wallet signature to on-chain event display.
- Provide a submission-ready reference for Green Belt requirements.

## Tech Stack

- Smart contracts: Rust + Soroban SDK
- Blockchain tooling: Stellar CLI (`stellar contract ...`)
- Frontend: Next.js (App Router) + React + TypeScript
- UI: Tailwind CSS + Framer Motion + Lucide Icons
- Wallet integration: `@creit.tech/stellar-wallets-kit` (Freighter, Albedo, xBull optional)
- RPC + contract interaction: `@stellar/stellar-sdk`
- CI/CD: GitHub Actions
- Hosting: Vercel

## Repository Structure

```text
contracts/
  vault/
  liquidity_pool/
frontend/
docs/images/
.github/workflows/
```

## Contract and Network Information (Testnet)

- Vault contract address: `CAJENIP3WDODNG2I2WA2FIRYLJK3HNSX4PVW2OTAERGTKKEUEZKSCXB7`
- Liquidity Pool contract address: `CDZTASXSOXDR4ULNTFL6P74DMPZOYHFKSRRYROXZTT7WD2BJS6RWXEI2`
- Token contract address (native SAC): `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

### Related Transaction Hashes

- LP deploy tx: `0a053785a5db658a8da24065bc024cac1fac048098dc35b52597d86883ebd9ed`
- Vault deploy tx: `ea54f6b40e91dbaa390367c05ec08532c0031135157955e2f90c165e395adb57`
- Inter-contract call tx sample (vault -> liquidity pool deposit): `93cd8bb1f5173d2011148aa958ea98d0b4510c39804c44598e617013b34f2b0b`

## Local Setup

### Prerequisites

- Rust + wasm target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- Stellar CLI
- Node.js 20+ and pnpm

### 1) Build Contracts

```bash
cd contracts
stellar contract build
```

### 2) Deploy and Initialize on Testnet

```bash
cd contracts

LP_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_vault_lp.wasm \
  --source deployer \
  --network testnet)
echo "LP_ID=$LP_ID"

VAULT_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_vault.wasm \
  --source deployer \
  --network testnet)
echo "VAULT_ID=$VAULT_ID"
```

Get native SAC token contract id:

```bash
TOKEN_ID=$(stellar contract id asset \
  --asset native \
  --network testnet)
echo "TOKEN_ID=$TOKEN_ID"
```

Initialize LP then Vault:

```bash
stellar contract invoke \
  --id "$LP_ID" \
  --source deployer \
  --network testnet \
  -- initialize \
  --token "$TOKEN_ID"

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

### 3) Configure Frontend

Create/update `frontend/.env.local`:

```bash
NEXT_PUBLIC_VAULT_CONTRACT_ID=<VAULT_ID>
NEXT_PUBLIC_TOKEN_CONTRACT_ID=<TOKEN_ID>
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

### 4) Run Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

## Vercel Deployment (CLI)

```bash
cd frontend
vercel login
vercel link
```

Set env vars in Vercel:

```bash
vercel env add NEXT_PUBLIC_VAULT_CONTRACT_ID production
vercel env add NEXT_PUBLIC_TOKEN_CONTRACT_ID production
vercel env add NEXT_PUBLIC_RPC_URL production
vercel env add NEXT_PUBLIC_NETWORK_PASSPHRASE production
```

Deploy:

```bash
vercel --prod
```

Important Vercel settings:

- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Build Command: `pnpm build`
- Output Directory: default (empty), or `.next`

## CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

- Contracts job:
  - `cargo clippy`
  - `cargo test`
  - WASM build
- Frontend job:
  - install deps
  - lint
  - production build

## Production-Readiness Notes

- Use `.env`-driven contract IDs and network values only (avoid hardcoded fallbacks in real deployments).
- Keep wallet module loading resilient (xBull optional; Freighter/Albedo should still work).
- Ensure all contract init addresses are aligned (`token`, `lp_contract`) before frontend testing.
- Deposit path validated with successful on-chain transaction hash (listed above).

## Commit History Quality Check

- Current history contains 8+ commits and mostly follows conventional prefixes (`feat`, `fix`, `chore`, `update`).
- Recommended improvements (for future commits):
  - Prefer `docs:` over `update:` for documentation changes.
  - Keep each commit scoped, e.g.:
    - `docs: add Green Belt deployment verification section`
    - `fix(frontend): prepare soroban tx before wallet signing`
    - `chore(ci): align frontend build cache with package manager`

## Green Belt Checklist Mapping

- [x] Project overview
- [x] Tech stack
- [x] Local setup instructions
- [x] Live demo link
- [x] Mobile responsive screenshot
- [x] CI/CD badge
- [x] Contract addresses (vault + LP)
- [x] Token/liquidity address section
- [x] Final successful inter-contract transaction hash

---

Built for Stellar Green Belt submission.
