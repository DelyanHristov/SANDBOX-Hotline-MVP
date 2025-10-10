import type { SpikeAlert } from "../../types";
import { getSeverityLabel } from "../../utils/aggregations";
import { formatDelta, formatTimestamp } from "../../utils/format";
import { cn } from "../../utils/cn";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type AlertsTableProps = {
  alerts: SpikeAlert[];
  selectedKey: string | null;
  buildKey: (alert: SpikeAlert) => string;
  onSelect: (alert: SpikeAlert) => void;
  onStatusChange: (alert: SpikeAlert, status: SpikeAlert["status"]) => void;
};

export const AlertsTable = ({
  alerts,
  selectedKey,
  buildKey,
  onSelect,
  onStatusChange
}: AlertsTableProps) => {
  const { t } = useI18n();
  const { formatTopic, formatRegion } = useDomainFormatters();

  return (
    <div className="max-h-[440px] overflow-y-auto rounded-xl border border-slate-200">
      <table className="w-full divide-y divide-slate-200 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              {t.alerts.table.time}
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              {t.alerts.table.region}
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              {t.alerts.table.topic}
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              {t.alerts.table.delta}
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              {t.alerts.table.window}
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              {t.alerts.table.status}
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              {t.alerts.table.actions}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {alerts.map((alert) => {
            const key = buildKey(alert);
            const severity = getSeverityLabel(alert.delta_pct);
            const severityText =
              severity === "Very high"
                ? t.dashboard.spikeSeverityLevels.veryHigh
                : severity === "High"
                ? t.dashboard.spikeSeverityLevels.high
                : t.dashboard.spikeSeverityLevels.moderate;
            return (
              <tr
              key={key}
              onClick={() => onSelect(alert)}
              className={cn(
                "cursor-pointer transition hover:bg-slate-50 focus-within:bg-slate-50",
                selectedKey === key ? "bg-slate-50" : undefined
              )}
            >
              <td className="px-4 py-4 text-slate-600">
                {formatTimestamp(alert.ts)}
              </td>
              <td className="px-4 py-4 text-slate-600">
                {formatRegion(alert.region)}
              </td>
              <td className="px-4 py-4 font-semibold text-slate-900">
                {formatTopic(alert.topic)}
                <div className="text-xs text-slate-500">{severityText}</div>
              </td>
              <td className="px-4 py-4 text-slate-600">
                {formatDelta(alert.delta_pct)}
              </td>
              <td className="px-4 py-4 text-slate-600">
                {t.common.relativeWindow(alert.window_min)}
              </td>
              <td className="px-4 py-4 text-slate-600">
                {t.alerts.table.statusLabels[alert.status]}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    onClick={(event) => {
                      event.stopPropagation();
                      onStatusChange(alert, "acknowledged");
                    }}
                  >
                    {t.alerts.table.acknowledge}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    onClick={(event) => {
                      event.stopPropagation();
                      onStatusChange(alert, "resolved");
                    }}
                  >
                    {t.alerts.table.resolve}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        {!alerts.length && (
          <tr>
            <td
              colSpan={7}
              className="px-4 py-6 text-center text-sm text-slate-500"
            >
              {t.alerts.table.none}
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  );
};
