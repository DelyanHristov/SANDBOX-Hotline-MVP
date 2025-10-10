import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { useAppStore } from "../../store/useAppStore";
import { useI18n } from "../../i18n";

export const AppLayout = () => {
  const loadData = useAppStore((state) => state.loadData);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const { direction } = useI18n();

  useEffect(() => {
    if (!hasHydrated) {
      void loadData();
    }
  }, [hasHydrated, loadData]);

  return (
    <div
      className="min-h-screen bg-background text-slate-900"
      dir={direction}
    >
      <AppHeader />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 lg:px-8">
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Loading latest data…
          </div>
        )}
        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <span>{error}</span>
            <button
              type="button"
              className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              onClick={() => {
                void loadData();
              }}
              disabled={isLoading}
            >
              Retry
            </button>
          </div>
        )}
        <main className="flex flex-1 flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
