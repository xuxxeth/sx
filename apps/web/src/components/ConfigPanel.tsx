import { SectionCard } from "./SectionCard";
import { ConfigCopy } from "./ConfigCopy";

export const ConfigPanel = () => {
  return (
    <SectionCard
      title="Runtime Config"
      description="Read-only view of client configuration values."
    >
      <div className="space-y-3 text-xs text-zinc-600">
        <ConfigCopy
          label="API Base"
          value={process.env.NEXT_PUBLIC_API_BASE_URL}
        />
        <ConfigCopy
          label="RPC Endpoint"
          value={process.env.NEXT_PUBLIC_SOLANA_RPC_URL}
        />
        <ConfigCopy
          label="Program ID"
          value={process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID}
        />
        <ConfigCopy
          label="Default Authority"
          value={process.env.NEXT_PUBLIC_DEFAULT_AUTHORITY}
        />
      </div>
    </SectionCard>
  );
};
