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

## 🛠️ Setup & Local Development

### Prerequisites
- [Rust & Cargo](https://rustup.rs/)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli)
- [Node.js v18+](https://nodejs.org/)

### Quick Start
1. **Clone the repo**
2. **Build Contracts**
   ```bash
   cd contracts
   cargo build --target wasm32-unknown-unknown --release
   ```
3. **Launch Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

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
