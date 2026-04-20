#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, token};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Token,
    TotalAssets,
    LPSupply,
}

#[contract]
pub struct LiquidityPool;

#[contractimpl]
impl LiquidityPool {
    /// Initialize the pool with the underlying token address
    pub fn initialize(e: Env, token: Address) {
        if e.storage().instance().has(&DataKey::Token) {
            panic!("already initialized");
        }
        e.storage().instance().set(&DataKey::Token, &token);
        e.storage().instance().set(&DataKey::TotalAssets, &0i128);
        e.storage().instance().set(&DataKey::LPSupply, &0i128);
    }

    /// Deposits assets and returns LP shares
    /// For simplicity, 1:1 ratio if pool is empty
    pub fn deposit(e: Env, user: Address, amount: i128) -> i128 {
        user.require_auth();
        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&e, &token_addr);
        
        client.transfer(&user, &e.current_contract_address(), &amount);

        let total_assets: i128 = e.storage().instance().get(&DataKey::TotalAssets).unwrap_or(0);
        let lp_supply: i128 = e.storage().instance().get(&DataKey::LPSupply).unwrap_or(0);

        let shares = if lp_supply == 0 {
            amount
        } else {
            (amount * lp_supply) / total_assets
        };

        e.storage().instance().set(&DataKey::TotalAssets, &(total_assets + amount));
        e.storage().instance().set(&DataKey::LPSupply, &(lp_supply + shares));

        e.events().publish((symbol_short!("lp_dep"), user), shares);
        shares
    }

    /// Withdraws assets by burning LP shares
    pub fn withdraw(e: Env, user: Address, shares: i128) -> i128 {
        user.require_auth();
        let total_assets: i128 = e.storage().instance().get(&DataKey::TotalAssets).unwrap();
        let lp_supply: i128 = e.storage().instance().get(&DataKey::LPSupply).unwrap();

        let amount = (shares * total_assets) / lp_supply;

        e.storage().instance().set(&DataKey::TotalAssets, &(total_assets - amount));
        e.storage().instance().set(&DataKey::LPSupply, &(lp_supply - shares));

        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&e, &token_addr);
        client.transfer(&e.current_contract_address(), &user, &amount);

        e.events().publish((symbol_short!("lp_with"), user), amount);
        amount
    }

    /// Simulates yield by increasing total assets without changing LP supply
    pub fn generate_yield(e: Env, amount: i128) {
        let total_assets: i128 = e.storage().instance().get(&DataKey::TotalAssets).unwrap();
        e.storage().instance().set(&DataKey::TotalAssets, &(total_assets + amount));
    }

    pub fn get_total_assets(e: Env) -> i128 {
        e.storage().instance().get(&DataKey::TotalAssets).unwrap_or(0)
    }
}
