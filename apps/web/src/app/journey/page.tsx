import Link from "next/link";
import { Shell } from "../../components/Shell";
import { SectionCard } from "../../components/SectionCard";

export default function JourneyPage() {
  return (
    <Shell
      title="Minimal User Journey"
      subtitle="A fast path for validating the end-to-end flow."
      actions={
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold"
        >
          Back Home
        </Link>
      }
    >
      <div className="grid gap-6">
        <SectionCard title="1. Configure">
          <ol className="space-y-3 text-sm text-zinc-600">
            <li>Set `SOLANA_PROGRAM_ID` in backend .env</li>
            <li>Set `NEXT_PUBLIC_SOLANA_PROGRAM_ID` in frontend .env.local</li>
            <li>Start backend and frontend</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/status"
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold"
            >
              Open Status
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="2. Create Profile">
          <ol className="space-y-3 text-sm text-zinc-600">
            <li>Connect wallet</li>
            <li>Open `/profile`</li>
            <li>Fill in profile and submit</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold"
            >
              Open Profile
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="3. Create Post">
          <ol className="space-y-3 text-sm text-zinc-600">
            <li>Open `/compose`</li>
            <li>Generate CID (mock) or paste real IPFS CID</li>
            <li>Submit on-chain index</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/compose"
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold"
            >
              Open Compose
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="4. Verify">
          <ol className="space-y-3 text-sm text-zinc-600">
            <li>Check `/status` for indexer state</li>
            <li>Check `/` feed for new post</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold"
            >
              Open Feed
            </Link>
          </div>
        </SectionCard>
      </div>
    </Shell>
  );
}
