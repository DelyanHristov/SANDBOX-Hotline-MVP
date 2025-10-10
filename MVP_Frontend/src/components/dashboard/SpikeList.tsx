import type { SpikeAlert } from "../../types";
import { formatDelta, formatTimestamp } from "../../utils/format";
import { getSeverityLabel } from "../../utils/aggregations";
import { cn } from "../../utils/cn";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type SpikeListProps = {
  alerts: SpikeAlert[];
  onAlertSelect?: (alert: SpikeAlert) => void;
};

const severityClass = (severity: string) => {
  switch (severity) {
    case "Very high":
      return "bg-danger text-white";
    case "High":
      return "bg-amber-500 text-white";
    default:
      return "bg-sky-500 text-white";
  }
};

const statusClass = (status: SpikeAlert["status"]) => {
  switch (status) {
    case "new":
      return "bg-danger/10 text-danger";
    case "acknowledged":
      return "bg-sky-100 text-sky-800";
    case "resolved":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export const SpikeList = ({ alerts, onAlertSelect }: SpikeListProps) => {
  const { t } = useI18n();
  const { formatTopic, formatRegion } = useDomainFormatters();

  const translateSeverity = (severity: string) => {
    if (severity === "Very high") {
      return t.dashboard.spikeSeverityLevels.veryHigh;
    }
    if (severity === "High") {
      return t.dashboard.spikeSeverityLevels.high;
    }
    return t.dashboard.spikeSeverityLevels.moderate;
  };

  return (
    <section
      aria-label={t.dashboard.spikeTitle}
      className="flex h-[520px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t.dashboard.spikeTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {t.dashboard.spikeSubtitle}
          </p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
          {t.dashboard.spikeActiveCount(alerts.length)}
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const severity = getSeverityLabel(alert.delta_pct);
            const severityText = translateSeverity(severity);
            return (
              <button
                key={`${alert.region}-${alert.topic}-${alert.ts}`}
                type="button"
                className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                onClick={() => onAlertSelect?.(alert)}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-semibold",
                      severityClass(severity)
                    )}
                  >
                    {formatDelta(alert.delta_pct)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                      statusClass(alert.status)
                    )}
                  >
                    {t.alerts.table.statusLabels[alert.status]}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatTopic(alert.topic)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatRegion(alert.region)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>📍 {formatRegion(alert.region)}</span>
                  <span>⏱ {t.common.relativeWindow(alert.window_min)}</span>
                  <span>🕒 {formatTimestamp(alert.ts)}</span>
                  <span>
                    {t.dashboard.spikeSeverity}: {severityText}
                  </span>
                </div>
              </button>
            );
          })}
          {!alerts.length && (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              {t.dashboard.spikeNoAlerts}
            </div>
          )}
        </div>
        {!!alerts.length && (
          <div className="pointer-events-none mt-2 h-6 bg-gradient-to-b from-transparent to-white" />
        )}
      </div>
    </section>
  );
};
