#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, token, IntoVal};

// Define the interface for the Liquidity Pool contract
// This allows us to call the LP contract without having its WASM at compile time
pub trait LiquidityPoolInterface {
    fn deposit(e: Env, user: Address, amount: i128) -> i128;
    fn withdraw(e: Env, user: Address, shares: i128) -> i128;
    fn get_total_assets(e: Env) -> i128;
}

// Create a client for the Liquidity Pool
// This is used for inter-contract calls
pub struct LpClient {
    env: Env,
    address: Address,
}

impl LpClient {
    pub fn new(env: &Env, address: &Address) -> Self {
        Self {
            env: env.clone(),
            address: address.clone(),
        }
    }

    pub fn deposit(&self, user: &Address, amount: &i128) -> i128 {
        self.env.invoke_contract(&self.address, &Symbol::new(&self.env, "deposit"), soroban_sdk::vec![&self.env, user.into_val(&self.env), amount.into_val(&self.env)])
    }
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Token,
    LPContract,
    TotalShares,
}

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    pub fn initialize(e: Env, token: Address, lp_contract: Address) {
        if e.storage().instance().has(&DataKey::Token) {
            panic!("already initialized");
        }
        e.storage().instance().set(&DataKey::Token, &token);
        e.storage().instance().set(&DataKey::LPContract, &lp_contract);
        e.storage().instance().set(&DataKey::TotalShares, &0i128);
    }

    /// Deposits underlying tokens into the Vault, which then deposits into the LP
    pub fn deposit(e: Env, user: Address, amount: i128) -> i128 {
        user.require_auth();
        
        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let lp_addr: Address = e.storage().instance().get(&DataKey::LPContract).unwrap();
        
        // 1. Transfer from user to Vault
        let token_client = token::Client::new(&e, &token_addr);
        token_client.transfer(&user, &e.current_contract_address(), &amount);

        // 2. Inter-contract call to LP
        let lp_client = LpClient::new(&e, &lp_addr);
        let lp_shares = lp_client.deposit(&e.current_contract_address(), &amount);

        // 3. Update Vault shares
        let total_shares: i128 = e.storage().instance().get(&DataKey::TotalShares).unwrap_or(0);
        e.storage().instance().set(&DataKey::TotalShares, &(total_shares + lp_shares));

        // Emit a structured event for real-time tracking
        e.events().publish((symbol_short!("v_dep"), user), lp_shares);
        lp_shares
    }

    pub fn get_lp_address(e: Env) -> Address {
        e.storage().instance().get(&DataKey::LPContract).unwrap()
    }
}
