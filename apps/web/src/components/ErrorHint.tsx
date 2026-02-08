import { buildExplorerUrl } from "../lib/explorer";

type ErrorHintProps = {
  error?: string | null;
};

export const ErrorHint = ({ error }: ErrorHintProps) => {
  if (!error) return null;

  const lowered = error.toLowerCase();
  let hint: string | null = null;

  if (lowered.includes("0x1")) {
    hint = "Transaction rejected. Check account funding or instruction errors.";
  } else if (lowered.includes("insufficient") || lowered.includes("funds")) {
    hint = "Insufficient SOL. Fund the wallet with devnet SOL.";
  } else if (lowered.includes("user rejected") || lowered.includes("reject")) {
    hint = "You rejected the wallet signature.";
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      {hint || "Transaction failed. Check wallet logs or explorer for details."}
    </div>
  );
};
