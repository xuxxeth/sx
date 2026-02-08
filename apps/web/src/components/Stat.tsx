type StatProps = {
  label: string;
  value: number | string;
};

export const Stat = ({ label, value }: StatProps) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
};
