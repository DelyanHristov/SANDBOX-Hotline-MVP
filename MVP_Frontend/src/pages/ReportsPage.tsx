import { SummaryBullets } from "../components/reports/SummaryBullets";
import { VolumeTrends } from "../components/reports/VolumeTrends";
import { useI18n } from "../i18n";
import { useDomainFormatters } from "../i18n/domain";
import { useAppStore } from "../store/useAppStore";

export const ReportsPage = () => {
  const { t } = useI18n();
  const { formatSummary } = useDomainFormatters();
  const leadershipSummary = useAppStore((state) => state.leadershipSummary);
  const volumeTrendSeries = useAppStore((state) => state.volumeTrendSeries);
  const summaries = leadershipSummary.map((item) => formatSummary(item));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t.reports.heading}
        </h1>
        <p className="text-sm text-slate-500">{t.reports.subheading}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SummaryBullets bullets={summaries} />
        {volumeTrendSeries ? (
          <VolumeTrends data={volumeTrendSeries} />
        ) : (
          <section className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t.reports.trendsTitle}
            </h2>
            <p>{t.reports.trendsSubtitle}</p>
            <p>No trend data available yet.</p>
          </section>
        )}
      </div>
    </div>
  );
};
