import { NavLink, useLocation } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { cn } from "../../utils/cn";
import { useI18n, type Language } from "../../i18n";

const navLinkClass =
  "inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";

export const AppHeader = () => {
  const toggleFiltersCollapsed = useAppStore(
    (state) => state.toggleFiltersCollapsed
  );
  const filtersCollapsed = useAppStore((state) => state.filtersCollapsed);
  const { t, language, setLanguage } = useI18n();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  const navItems = [
    { label: t.nav.dashboard, path: "/dashboard" },
    { label: t.nav.alerts, path: "/alerts" },
    { label: t.nav.explorer, path: "/explorer" },
    { label: t.nav.reports, path: "/reports" },
    { label: t.nav.settings, path: "/settings" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <span className="text-lg font-bold">N</span>
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {t.appName}
              </p>
              <p className="text-xs text-slate-500">{t.appTagline}</p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            {isDashboard && (
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                )}
                onClick={() => toggleFiltersCollapsed()}
                aria-expanded={!filtersCollapsed}
                aria-controls="global-filters"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  v
                </span>
                {filtersCollapsed ? t.filters.toggle.show : t.filters.toggle.hide}
              </button>
            )}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              {t.common.languageMenu}
              <select
                className="h-9 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as Language)
                }
              >
                <option value="en">{t.common.languageNames.en}</option>
                <option value="ar">{t.common.languageNames.ar}</option>
              </select>
            </label>
          </div>
        </div>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap gap-2 rounded-full bg-slate-100 p-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      navLinkClass,
                      isActive
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
