export const NetworkBadge = () => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "";
  const isDevnet = endpoint.includes("devnet");
  const label = isDevnet ? "Devnet" : "Custom";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        isDevnet
          ? "border-amber-300 bg-amber-50 text-amber-700"
          : "border-zinc-300 text-zinc-600"
      }`}
    >
      {label}
    </span>
  );
};
