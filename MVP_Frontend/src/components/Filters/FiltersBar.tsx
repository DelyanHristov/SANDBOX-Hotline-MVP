import { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";
import {
  getUniqueChannels,
  getUniqueDialects,
  getUniqueRegions,
  getUniqueTopics
} from "../../utils/aggregations";
import type { TimeRangeKey } from "../../types";
import { cn } from "../../utils/cn";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

const TIME_RANGE_VALUES: TimeRangeKey[] = [
  "last_60",
  "today",
  "last_24h",
  "last_7d"
];

const buildOptions = (values: string[]) => ["All", ...values];

const labelClass = "text-xs font-medium text-slate-500 uppercase tracking-wide";
const selectClass =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-slate-200";

export const FiltersBar = ({ hidden }: { hidden?: boolean }) => {
  const interactions = useAppStore((state) => state.interactions);
  const filters = useAppStore((state) => state.filters);
  const setFilter = useAppStore((state) => state.setFilter);
  const resetFilters = useAppStore((state) => state.resetFilters);
  const { t } = useI18n();
  const {
    formatRegion,
    formatChannel,
    formatTopic,
    formatDialect
  } = useDomainFormatters();

  const regionOptions = useMemo(
    () => buildOptions(getUniqueRegions(interactions)),
    [interactions]
  );
  const channelOptions = useMemo(
    () => buildOptions(getUniqueChannels(interactions)),
    [interactions]
  );
  const topicOptions = useMemo(
    () => buildOptions(getUniqueTopics(interactions)),
    [interactions]
  );
  const dialectOptions = useMemo(
    () => buildOptions(getUniqueDialects(interactions)),
    [interactions]
  );

  if (hidden) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all"
      )}
      role="region"
      aria-label="Global filters"
    >
      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="filter-time-range">
          {t.filters.timeRange}
        </label>
        <select
          id="filter-time-range"
          className={selectClass}
          value={filters.timeRange}
          onChange={(event) =>
            setFilter("timeRange", event.target.value as TimeRangeKey)
          }
        >
          {TIME_RANGE_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.timeRanges[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="filter-region">
          {t.filters.region}
        </label>
        <select
          id="filter-region"
          className={selectClass}
          value={filters.region}
          onChange={(event) => setFilter("region", event.target.value)}
        >
          {regionOptions.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? t.common.all : formatRegion(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="filter-channel">
          {t.filters.channel}
        </label>
        <select
          id="filter-channel"
          className={selectClass}
          value={filters.channel}
          onChange={(event) => setFilter("channel", event.target.value)}
        >
          {channelOptions.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? t.common.all : formatChannel(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="filter-topic">
          {t.filters.topic}
        </label>
        <select
          id="filter-topic"
          className={selectClass}
          value={filters.topic}
          onChange={(event) => setFilter("topic", event.target.value)}
        >
          {topicOptions.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? t.common.all : formatTopic(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="filter-urgency">
          {t.filters.urgency}
        </label>
        <select
          id="filter-urgency"
          className={selectClass}
          value={filters.urgency}
          onChange={(event) => setFilter("urgency", event.target.value as typeof filters.urgency)}
        >
          {(["All", "P1", "P2", "P3"] as const).map((option) => (
            <option key={option} value={option}>
              {option === "All"
                ? t.common.all
                : `${option} | ${t.dashboard.urgencyLevels[option]}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="filter-dialect">
          {t.filters.dialect}
        </label>
        <select
          id="filter-dialect"
          className={selectClass}
          value={filters.dialect}
          onChange={(event) => setFilter("dialect", event.target.value)}
        >
          {dialectOptions.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? t.common.all : formatDialect(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="h-9 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => resetFilters()}
        >
          {t.filters.reset}
        </button>
      </div>
    </div>
  );
};
