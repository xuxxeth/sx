"use client";

import { ConfigWarnings } from "./ConfigWarnings";
import { SectionCard } from "./SectionCard";
import { ComposeForm } from "./ComposeForm";
import { SearchCard } from "./SearchCard";
import { TrendsPanel } from "./TrendsPanel";
import { HomeNav } from "./HomeNav";
import { HomeFeed } from "./HomeFeed";

export const HomeShell = () => {
  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-zinc-100 text-zinc-950">
      <div className="mx-auto flex h-full w-full max-w-7xl gap-6 px-6 pb-8 pt-6">
        <HomeNav />

        <main className="flex-1 overflow-y-auto pb-10">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  SX Feed
                </p>
                <h1 className="text-2xl font-semibold">Home</h1>
              </div>
              <div className="flex items-center gap-3" />
            </div>
            <div className="mt-6">
              <ComposeForm />
            </div>
            <div className="mt-6">
              <HomeFeed />
            </div>
          </section>
        </main>

        <aside className="hidden w-80 flex-col lg:flex">
          <div className="flex h-full flex-col gap-6">
            <SearchCard />
            <TrendsPanel />
            <ConfigWarnings />
          </div>
        </aside>
      </div>
    </div>
  );
};
