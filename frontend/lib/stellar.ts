import { rpc, Networks as StellarNetworks, TransactionBuilder, Address, xdr } from '@stellar/stellar-sdk';

// Environment Variables with fallbacks
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || StellarNetworks.TESTNET;

export const VAULT_CONTRACT_ID = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVault"; 
export const TOKEN_CONTRACT_ID = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID || "CDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAToken"; 

export const server = new rpc.Server(RPC_URL);

/**
 * Lazily loads the Stellar Wallets Kit and all supported modules
 */
export async function getStellarKit() {
  if (typeof window === 'undefined') return null;
  
  const { StellarWalletsKit, Networks: WalletNetwork } = await import('@creit.tech/stellar-wallets-kit');
  const { FreighterModule } = await import('@creit.tech/stellar-wallets-kit/modules/freighter');
  const { AlbedoModule } = await import('@creit.tech/stellar-wallets-kit/modules/albedo');
  const xBull: any = await import('@creit.tech/stellar-wallets-kit/modules/xbull');
  const XBullModule = xBull.XBullModule || xBull.default || xBull;
  
  StellarWalletsKit.init({
    network: WalletNetwork.TESTNET,
    modules: [
      new FreighterModule(),
      new AlbedoModule(),
      new XBullModule(),
    ],
  });
  
  return StellarWalletsKit;
}

export async function connectToWallet(walletId: string) {
  const kit = await getStellarKit();
  if (!kit) return null;
  
  try {
    kit.setWallet(walletId);
    const { address } = await kit.fetchAddress();
    return address;
  } catch (e) {
    console.error("Connection failed", e);
    return null;
  }
}

/**
 * Builds and signs a deposit transaction
 */
export async function deposit(userAddress: string, amount: number) {
  const kit = await getStellarKit();
  if (!kit) throw new Error("Wallet not connected");

  const account = await server.getAccount(userAddress);
  
  const tx = new TransactionBuilder(account, {
    fee: "1000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
  .addOperation(
    xdr.Operation.invokeHostFunction({
      function: xdr.HostFunction.invokeContract({
        contractId: Address.fromString(VAULT_CONTRACT_ID).toBuffer(),
        functionName: "deposit",
        args: [
          Address.fromString(userAddress).toScVal(),
          xdr.ScVal.scvI128(xdr.Int128Parts.fromBigInt(BigInt(amount * 10000000))), 
        ],
      }),
      auth: [],
    })
  )
  .setTimeout(30)
  .build();

  const { signedTxXdr } = await kit.signTransaction(tx.toXDR());
  const result = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE));
  return result;
}

export async function getVaultStats() {
  return {
    tvl: "1,240,500 USDC",
    sharePrice: "1.052 USDC",
    apy: "12.5%",
  };
}
