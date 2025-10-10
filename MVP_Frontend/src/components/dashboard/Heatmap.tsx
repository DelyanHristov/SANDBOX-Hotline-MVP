import type { HeatmapData } from "../../types";
import { cn } from "../../utils/cn";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type HeatmapProps = HeatmapData & {
  onCellClick?: (region: string, topic: string, value: number) => void;
};

export const Heatmap = ({
  regions,
  topics,
  counts,
  onCellClick
}: HeatmapProps) => {
  const { t } = useI18n();
  const { formatRegion, formatTopic } = useDomainFormatters();
  const flatValues = counts.flat();
  const max = Math.max(...flatValues);
  const min = Math.min(...flatValues);
  const spread = max - min || 1;

  const calculateBackground = (value: number) => {
    const ratio = (value - min) / spread;
    const alpha = 0.15 + ratio * 0.55;
    return `rgba(76, 58, 254, ${alpha.toFixed(2)})`;
  };

  return (
    <section
      aria-label={t.dashboard.heatmapTitle}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t.dashboard.heatmapTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {t.dashboard.heatmapSubtitle}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="w-32 rounded-l-xl bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">
                {t.filters.region}
              </th>
              {topics.map((topic) => (
                <th
                  key={topic}
                  className="min-w-32 bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500"
                  scope="col"
                >
                  {formatTopic(topic)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region, regionIndex) => (
              <tr key={region}>
                <th
                  scope="row"
                  className="rounded-l-xl bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-600"
                >
                  {formatRegion(region)}
                </th>
                {topics.map((topic, topicIndex) => {
                  const value = counts[regionIndex][topicIndex];
                  return (
                    <td key={`${region}-${topic}`} className="px-1 py-1">
                      <button
                        type="button"
                        className={cn(
                          "flex h-16 w-full items-center justify-center rounded-xl border border-transparent text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 hover:-translate-y-0.5"
                        )}
                        style={{
                          backgroundColor: calculateBackground(value)
                        }}
                        onClick={() =>
                          onCellClick?.(region, topic, value)
                        }
                        aria-label={`${formatRegion(region)} ${formatTopic(topic)} ${value}`}
                      >
                        {value}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
