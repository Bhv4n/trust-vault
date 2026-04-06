// In-memory mock vault for hackathon demo (no blockchain needed for UI demo)
export interface VaultRecord {
  hash: string;
  cid: string;
  owner: string;
  timestamp: number;
  fileName: string;
}

const records = new Map<string, VaultRecord>();

export function storeRecord(record: VaultRecord) {
  records.set(record.hash, record);
}

export function verifyRecord(hash: string): { exists: boolean; record?: VaultRecord } {
  const record = records.get(hash);
  return record ? { exists: true, record } : { exists: false };
}

export function getAllRecords(): VaultRecord[] {
  return Array.from(records.values());
}

// Seed a demo record
storeRecord({
  hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  cid: "QmExampleCID123456789abcdef",
  owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
  timestamp: 1712400000000,
  fileName: "sample-deed.pdf",
});
