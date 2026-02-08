import Link from "next/link";
import { Shell } from "../../components/Shell";
import { SectionCard } from "../../components/SectionCard";
import { ComposeForm } from "../../components/ComposeForm";

export default function ComposePage() {
  return (
    <Shell
      title="Compose a Signal"
      subtitle="Draft a new post and submit the on-chain index transaction."
      actions={
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold"
        >
          Back to Feed
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Draft">
          <ComposeForm />
        </SectionCard>

        <SectionCard
          title="Checklist"
          description="Make sure these are ready before you push to chain."
        >
          <ul className="space-y-3 text-sm text-zinc-600">
            <li>Wallet connected (Phantom / Backpack)</li>
            <li>Program ID set in backend</li>
            <li>Indexer running to reflect new post</li>
          </ul>
        </SectionCard>
      </div>
    </Shell>
  );
}
