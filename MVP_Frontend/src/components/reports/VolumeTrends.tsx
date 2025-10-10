import type { CSSProperties } from "react";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type TrendSeries = {
  labels: string[];
  series: Array<{
    name: string;
    color: string;
    values: number[];
  }>;
  p1Rates: number[];
};

const padding = { top: 24, right: 20, bottom: 36, left: 44 } as const;
const chartWidth = 520;
const chartHeight = 220;

const buildPath = (values: number[], maxValue: number): string => {
  if (!values.length) {
    return "";
  }
  return values
    .map((value, index) => {
      const x =
        padding.left +
        ((chartWidth - padding.left - padding.right) /
          Math.max(values.length - 1, 1)) *
          index;
      const y =
        chartHeight -
        padding.bottom -
        (value / Math.max(maxValue, 1)) *
          (chartHeight - padding.top - padding.bottom);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

const buildRateArea = (values: number[]): string => {
  if (!values.length) {
    return "";
  }
  const maxRate = Math.max(...values, 0.01);
  const coords = values.map((value, index) => {
    const x =
      padding.left +
      ((chartWidth - padding.left - padding.right) /
        Math.max(values.length - 1, 1)) *
        index;
    const y =
      chartHeight -
      padding.bottom -
      (value / maxRate) * (chartHeight - padding.top - padding.bottom);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lastX =
    padding.left +
    ((chartWidth - padding.left - padding.right) /
      Math.max(values.length - 1, 1)) *
      (values.length - 1);
  const baseY = chartHeight - padding.bottom;
  return `M${padding.left},${baseY.toFixed(
    1
  )} L${coords.join(" L")} L${lastX.toFixed(1)},${baseY.toFixed(
    1
  )} Z`;
};

const captionStyles: CSSProperties = {
  fontSize: "12px",
  fill: "#6b7280"
};

export const VolumeTrends = ({ data }: { data: TrendSeries }) => {
  const values = data.series.flatMap((serie) => serie.values);
  const maxValue = Math.max(...values, 1);
  const gridLines = 4;
  const { t } = useI18n();
  const { formatSeriesLabel } = useDomainFormatters();
  const localizedSeries = data.series.map((serie) => ({
    ...serie,
    name: formatSeriesLabel(serie.name)
  }));

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t.reports.trendsTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {t.reports.trendsSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          {localizedSeries.map((serie) => (
            <span key={serie.name} className="inline-flex items-center gap-2">
              <span
                className="h-2 w-4 rounded-sm"
                style={{ backgroundColor: serie.color }}
              />
              {serie.name}
            </span>
          ))}
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-4 rounded-sm bg-rose-200" />
            {t.reports.chart.legendP1}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-64 w-full"
          role="img"
          aria-label="Line chart of topic volume trends and P1 rate"
        >
          <defs>
            <linearGradient id="p1Fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.5)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0.05)" />
            </linearGradient>
          </defs>
          {[...new Array(gridLines)].map((_, index) => {
            const y =
              padding.top +
              ((chartHeight - padding.top - padding.bottom) / gridLines) *
                index;
            const value = Math.round(
              maxValue -
                (maxValue / gridLines) * index
            ).toString();
            return (
              <g key={`grid-${index}`}>
                <line
                  x1={padding.left}
                  x2={chartWidth - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 6"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  style={captionStyles}
                >
                  {value}
                </text>
              </g>
            );
          })}

          <path d={buildRateArea(data.p1Rates)} fill="url(#p1Fill)" />

          {localizedSeries.map((serie) => (
            <path
              key={serie.name}
              d={buildPath(serie.values, maxValue)}
              fill="none"
              stroke={serie.color}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ))}

          {data.labels.map((label, index) => {
            const x =
              padding.left +
              ((chartWidth - padding.left - padding.right) /
                Math.max(data.labels.length - 1, 1)) *
                index;
            return (
              <text
                key={label}
                x={x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                style={captionStyles}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
};
