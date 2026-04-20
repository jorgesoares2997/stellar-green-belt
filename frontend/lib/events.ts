import { server, VAULT_CONTRACT_ID } from './stellar';

export type ContractEvent = {
  id: string;
  type: string;
  user: string;
  amount: string;
  timestamp: number;
};

export async function fetchLatestEvents(): Promise<ContractEvent[]> {
  try {
    // Polling Soroban RPC for contract events
    // Filters for our specific Vault contract
    const response = await server.getEvents({
      startLedger: 0, // In production, track this ledger-by-ledger
      filters: [
        {
          type: "contract",
          contractIds: [VAULT_CONTRACT_ID],
        },
      ],
    });

    return response.events.map((e: any) => ({
      id: e.id,
      type: "Vault Action",
      user: e.contractId.slice(0, 4) + "..." + e.contractId.slice(-4),
      amount: "Parsed from XDR", 
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn("Event fetch skipped (Testnet RPC connection needed)");
    return [];
  }
}

// Simple event simulator for the demo UI
export function getMockEvents(): ContractEvent[] {
  return [
    { id: '1', type: 'Deposit', user: 'GC...3k', amount: '500 USDC', timestamp: Date.now() },
    { id: '2', type: 'Yield Harvest', user: 'Vault', amount: '12.5 USDC', timestamp: Date.now() - 5000 },
    { id: '3', type: 'Withdraw', user: 'GA...8p', amount: '200 USDC', timestamp: Date.now() - 15000 },
  ];
}
