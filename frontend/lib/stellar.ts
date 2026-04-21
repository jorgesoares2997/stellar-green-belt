import { rpc, Networks as StellarNetworks, TransactionBuilder, Address, Operation, nativeToScVal } from '@stellar/stellar-sdk';

// Environment Variables with fallbacks
// NOTE: These fallback contract IDs are for local/dev safety only.
// Production deployments should always provide explicit NEXT_PUBLIC_* values.
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || StellarNetworks.TESTNET;

export const VAULT_CONTRACT_ID = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVault"; 
export const TOKEN_CONTRACT_ID = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID || "CDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAToken"; 

export const server = new rpc.Server(RPC_URL);
const STROOPS_PER_UNIT = BigInt(10_000_000);

/**
 * Lazily loads the Stellar Wallets Kit and all supported modules
 */
export async function getStellarKit() {
  if (typeof window === 'undefined') return null;
  
  const { StellarWalletsKit, Networks: WalletNetwork } = await import('@creit.tech/stellar-wallets-kit');
  const { FreighterModule } = await import('@creit.tech/stellar-wallets-kit/modules/freighter');
  const { AlbedoModule } = await import('@creit.tech/stellar-wallets-kit/modules/albedo');
  type WalletModuleCtor = new () => InstanceType<typeof FreighterModule>;
  type XBullExports = { XBullModule?: WalletModuleCtor; default?: WalletModuleCtor };

  let xBullModule: WalletModuleCtor | null = null;
  try {
    const xBull = (await import('@creit.tech/stellar-wallets-kit/modules/xbull')) as XBullExports;
    xBullModule = xBull.XBullModule ?? xBull.default ?? null;
  } catch (error) {
    console.warn('xBull module unavailable, continuing with other wallets', error);
  }

  const modules = [new FreighterModule(), new AlbedoModule()];
  if (xBullModule) {
    modules.push(new xBullModule());
  }
  
  StellarWalletsKit.init({
    network: WalletNetwork.TESTNET,
    modules,
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
  return invokeVaultMethod(userAddress, "deposit", amount);
}

/**
 * Builds and signs a withdraw transaction
 */
export async function withdraw(userAddress: string, amount: number) {
  return invokeVaultMethod(userAddress, "withdraw", amount);
}

async function invokeVaultMethod(userAddress: string, fn: "deposit" | "withdraw", amount: number) {
  const kit = await getStellarKit();
  if (!kit) throw new Error("Wallet not connected");

  const account = await server.getAccount(userAddress);

  const tx = new TransactionBuilder(account, {
    fee: "1000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: VAULT_CONTRACT_ID,
        function: fn,
        args: [
          Address.fromString(userAddress).toScVal(),
          nativeToScVal(toStroops(amount), { type: 'i128' }),
        ],
        auth: [],
      })
    )
    .setTimeout(30)
    .build();

  // Soroban transactions must be prepared with simulation data first.
  const prepared = await server.prepareTransaction(tx);

  const { signedTxXdr } = await kit.signTransaction(prepared.toXDR());
  const sendResult = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE));

  // Return final status when RPC already knows the tx hash.
  if (sendResult.hash) {
    const finalResult = await server.pollTransaction(sendResult.hash, { attempts: 10 });
    return { sendResult, finalResult };
  }

  return { sendResult };
}

function toStroops(amount: number): bigint {
  return BigInt(Math.round(amount * Number(STROOPS_PER_UNIT)));
}

export async function getVaultStats() {
  return {
    tvl: "1,240,500 USDC",
    sharePrice: "1.052 USDC",
    apy: "12.5%",
  };
}
