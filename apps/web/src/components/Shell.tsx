type ShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export const Shell = ({ title, subtitle, actions, children }: ShellProps) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-zinc-100 to-white text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                SX Social Layer
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex items-center gap-3">{actions}</div>
            ) : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};
