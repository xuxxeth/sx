type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const SectionCard = ({
  title,
  description,
  children,
  footer,
}: SectionCardProps) => {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_25px_80px_-60px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col gap-2 border-b border-dashed border-zinc-200 pb-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-zinc-500">{description}</p>
        ) : null}
      </div>
      <div className="pt-4">{children}</div>
      {footer ? <div className="pt-4">{footer}</div> : null}
    </section>
  );
};
