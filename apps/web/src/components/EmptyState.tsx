import Link from "next/link";
import { RetryButton } from "./RetryButton";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  showRetry?: boolean;
};

export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionHref,
  showRetry,
}: EmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
      <p className="text-sm font-semibold text-zinc-700">{title}</p>
      <p className="mt-2 text-xs text-zinc-500">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700"
          >
            {actionLabel}
          </Link>
        ) : null}
        {showRetry ? <RetryButton label="Retry" /> : null}
      </div>
    </div>
  );
};
