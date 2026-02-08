type ErrorBannerProps = {
  message?: string | null;
};

export const ErrorBanner = ({ message }: ErrorBannerProps) => {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      {message}
    </div>
  );
};
