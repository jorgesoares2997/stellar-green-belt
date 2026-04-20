import { server, VAULT_CONTRACT_ID } from './stellar';
import { Address, xdr, scValToNative } from '@stellar/stellar-sdk';

export type ContractEvent = {
  id: string;
  type: string;
  user: string;
  amount: string;
  timestamp: number;
};

type SorobanEvent = {
  id?: string;
  pagingToken?: string;
  ledger?: number;
  ledgerClosedAt?: string;
  contractId?: string;
  topic?: unknown[];
  value?: unknown;
};

export async function fetchLatestEvents(): Promise<ContractEvent[]> {
  try {
    const latestLedger = await server.getLatestLedger();
    const startLedger = Math.max(1, (latestLedger.sequence ?? 1) - 1000);

    const response = await server.getEvents({
      startLedger,
      limit: 25,
      filters: [
        {
          type: "contract",
          contractIds: [VAULT_CONTRACT_ID],
        },
      ],
    });

    return (response.events as SorobanEvent[])
      .map((event) => toContractEvent(event))
      .filter((event): event is ContractEvent => event !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.warn("Failed to fetch Soroban contract events", error);
    return [];
  }
}

function toContractEvent(event: SorobanEvent): ContractEvent | null {
  const topic = Array.isArray(event.topic) ? event.topic : [];
  const action = parseSymbol(topic[0]) ?? "Vault Action";
  const rawUser = parseAddress(topic[1]);
  const amount = parseI128(event.value);
  const timestamp = event.ledgerClosedAt ? Date.parse(event.ledgerClosedAt) : Date.now();

  return {
    id: event.id ?? `${event.ledger ?? 0}-${event.pagingToken ?? Math.random().toString(36)}`,
    type: normalizeAction(action),
    user: truncateAddress(rawUser ?? event.contractId ?? "unknown"),
    amount: amount === null ? "Unknown amount" : `${formatTokenAmount(amount)} USDC`,
    timestamp: Number.isNaN(timestamp) ? Date.now() : timestamp,
  };
}

function parseSymbol(value: unknown): string | null {
  const scVal = asScVal(value);
  if (!scVal || scVal.switch().name !== "scvSymbol") return null;
  return scVal.sym().toString();
}

function parseAddress(value: unknown): string | null {
  const scVal = asScVal(value);
  if (!scVal) return null;

  try {
    if (scVal.switch().name === "scvAddress") {
      return Address.fromScVal(scVal).toString();
    }
  } catch {
    return null;
  }

  return null;
}

function parseI128(value: unknown): bigint | null {
  const scVal = asScVal(value);
  if (!scVal || scVal.switch().name !== "scvI128") return null;
  const native = scValToNative(scVal);
  return typeof native === "bigint" ? native : null;
}

function asScVal(value: unknown): xdr.ScVal | null {
  if (!value) return null;

  if (value instanceof xdr.ScVal) {
    return value;
  }

  if (typeof value === "string") {
    try {
      return xdr.ScVal.fromXDR(value, "base64");
    } catch {
      return null;
    }
  }

  return null;
}

function normalizeAction(action: string): string {
  if (action === "deposit") return "Deposit";
  if (action === "withdraw") return "Withdraw";
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function formatTokenAmount(amount: bigint): string {
  const stroopsPerUnit = BigInt(10_000_000);
  const whole = amount / stroopsPerUnit;
  const fraction = amount % stroopsPerUnit;
  const fractionStr = fraction.toString().padStart(7, "0").replace(/0+$/, "");
  return fractionStr ? `${whole.toString()}.${fractionStr}` : whole.toString();
}

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
