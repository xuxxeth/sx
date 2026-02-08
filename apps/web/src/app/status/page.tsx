import { fetchJson } from "../../lib/api";
import { Shell } from "../../components/Shell";
import { SectionCard } from "../../components/SectionCard";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Stat } from "../../components/Stat";
import { ConfigPanel } from "../../components/ConfigPanel";
import { RetryButton } from "../../components/RetryButton";
import { WalletStatus } from "../../components/WalletStatus";
import { ConfigCopy } from "../../components/ConfigCopy";
import { NetworkBadge } from "../../components/NetworkBadge";


type IndexState = {
  lastSlot?: number;
  lastSignature?: string;
  updatedAt?: string;
};

type HealthDetails = {
  mongoStatus?: string;
  mongoState?: number;
  indexerEnabled?: boolean;
  rpcUrl?: string;
  programId?: string;
};

type HealthSummary = {
  mongoStatus?: string;
  indexerEnabled?: boolean;
  rpcConfigured?: boolean;
  programConfigured?: boolean;
};

export default async function StatusPage() {
  const [stateRes, healthRes, summaryRes] = await Promise.all([
    fetchJson<IndexState>("/index/state"),
    fetchJson<HealthDetails>("/health/details"),
    fetchJson<HealthSummary>("/health/summary"),
  ]);

  return (
    <Shell
      title="Indexer Status"
      subtitle="Operational view of your Solana indexer pipeline."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <SectionCard title="Overview">
          <ErrorBanner message={!summaryRes.ok ? summaryRes.error : null} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat
              label="Mongo"
              value={summaryRes.data?.mongoStatus ?? "-"}
            />
            <Stat
              label="Indexer"
              value={summaryRes.data?.indexerEnabled ? "Enabled" : "Disabled"}
            />
            <Stat
              label="RPC"
              value={summaryRes.data?.rpcConfigured ? "Configured" : "Missing"}
            />
            <Stat
              label="Program"
              value={summaryRes.data?.programConfigured ? "Configured" : "Missing"}
            />
          </div>
        </SectionCard>

        <SectionCard title="Indexer State">
          <ErrorBanner message={!stateRes.ok ? stateRes.error : null} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat label="Last Slot" value={stateRes.data?.lastSlot ?? 0} />
            <Stat label="Updated" value={stateRes.data?.updatedAt ?? "-"} />
          </div>
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Last Signature
            </p>
            <p className="mt-2 break-all font-mono text-xs text-zinc-600">
              {stateRes.data?.lastSignature ?? "-"}
            </p>
          </div>
          <div className="mt-4">
            <RetryButton />
          </div>
        </SectionCard>

        <SectionCard title="Runtime Health">
          <ErrorBanner message={!healthRes.ok ? healthRes.error : null} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat label="Mongo" value={healthRes.data?.mongoStatus ?? "-"} />
            <Stat
              label="Indexer"
              value={healthRes.data?.indexerEnabled ? "Enabled" : "Disabled"}
            />
          </div>
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              RPC URL
            </p>
            <p className="mt-2 break-all font-mono text-xs text-zinc-600">
              {healthRes.data?.rpcUrl ?? "-"}
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Program ID
            </p>
            <p className="mt-2 break-all font-mono text-xs text-zinc-600">
              {healthRes.data?.programId ?? "-"}
            </p>
          </div>
        </SectionCard>

        <ConfigPanel />

        <SectionCard title="Wallet" description="Your connected wallet.">
          <div className="mb-3">
            <NetworkBadge />
          </div>
          <WalletStatus />
        </SectionCard>

        <SectionCard title="Quick Copy" description="Share core config.">
          <div className="space-y-3">
            <ConfigCopy
              label="Program ID"
              value={process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID}
            />
            <ConfigCopy
              label="RPC Endpoint"
              value={process.env.NEXT_PUBLIC_SOLANA_RPC_URL}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Checklist"
          description="If the indexer is stuck, verify the following."
        >
          <ul className="space-y-3 text-sm text-zinc-600">
            <li>Backend running with INDEXER_WORKER=true</li>
            <li>SOLANA_PROGRAM_ID set correctly</li>
            <li>Helius RPC reachable</li>
            <li>IDL generated at contracts/solana/target/idl/solana.json</li>
          </ul>
        </SectionCard>
      </div>
    </Shell>
  );
}
