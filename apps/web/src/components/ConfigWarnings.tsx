import { EmptyState } from "./EmptyState";

export const ConfigWarnings = () => {
  const programId = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID;
  const authority = process.env.NEXT_PUBLIC_DEFAULT_AUTHORITY;
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

  if (programId && rpc) {
    return null;
  }

  return (
    <EmptyState
      title="Missing configuration"
      description="Set NEXT_PUBLIC_SOLANA_PROGRAM_ID and NEXT_PUBLIC_SOLANA_RPC_URL to enable on-chain actions."
      actionLabel={authority ? "Open Profile" : undefined}
      actionHref={authority ? "/profile" : undefined}
    />
  );
};
