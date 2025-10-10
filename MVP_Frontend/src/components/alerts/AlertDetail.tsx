import type { InteractionRecord, SpikeAlert } from "../../types";
import { mapEmotion } from "../../utils/mappers";
import { formatTimestamp } from "../../utils/format";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type AlertDetailProps = {
  alert: SpikeAlert | null;
  sparkline: { ts: string; volume: number }[];
  relatedInteractions: InteractionRecord[];
  onOpenExplorer?: (alert: SpikeAlert) => void;
};

const chartWidth = 260;
const chartHeight = 120;
const chartPadding = { top: 16, right: 12, bottom: 32, left: 40 } as const;

const buildSparklinePath = (data: { volume: number }[]) => {
  if (!data.length) {
    return "";
  }
  const maxVolume = Math.max(...data.map((point) => point.volume), 1);
  const usableWidth = chartWidth - chartPadding.left - chartPadding.right;
  const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  return data
    .map((point, index) => {
      const x =
        chartPadding.left +
        usableWidth * (index / Math.max(data.length - 1, 1));
      const y =
        chartPadding.top +
        usableHeight * (1 - point.volume / Math.max(maxVolume, 1));
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

const buildArea = (data: { volume: number }[]) => {
  if (!data.length) {
    return "";
  }
  const maxVolume = Math.max(...data.map((point) => point.volume), 1);
  const usableWidth = chartWidth - chartPadding.left - chartPadding.right;
  const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const points = data.map((point, index) => {
    const x =
      chartPadding.left +
      usableWidth * (index / Math.max(data.length - 1, 1));
    const y =
      chartPadding.top +
      usableHeight * (1 - point.volume / Math.max(maxVolume, 1));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const baselineY = chartHeight - chartPadding.bottom;
  const endX =
    chartPadding.left +
    usableWidth * ((data.length - 1) / Math.max(data.length - 1, 1));
  return `M${chartPadding.left},${baselineY} L${points.join(" L")} L${endX.toFixed(
    1
  )},${baselineY} Z`;
};

const formatTick = (value: number) => `${value}`;
export const AlertDetail = ({
  alert,
  sparkline,
  relatedInteractions,
  onOpenExplorer
}: AlertDetailProps) => {
  const { t, language } = useI18n();
  const timeFormatter = new Intl.DateTimeFormat(
    language === "ar" ? "ar-SA" : "en-US",
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );
  const { formatSubtopic, formatRegion, formatTopic } = useDomainFormatters();
  if (!alert) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        {t.alerts.detail.noAlert}
      </div>
    );
  }

  const topEmotions = relatedInteractions
    .reduce<Record<string, number>>((acc, interaction) => {
      acc[interaction.emotion.emotion_now] =
        (acc[interaction.emotion.emotion_now] ?? 0) + 1;
      return acc;
    }, {});

  const topEmotionEntries = Object.entries(topEmotions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topSubtopics = relatedInteractions
    .reduce<Record<string, number>>((acc, interaction) => {
      acc[interaction.topic.subtopic] =
        (acc[interaction.topic.subtopic] ?? 0) + 1;
      return acc;
    }, {});

  const topSubtopicEntries = Object.entries(topSubtopics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxVolume = Math.max(...sparkline.map((point) => point.volume), 1);
  const baselinePoints =
    sparkline.length > 1 ? sparkline.slice(0, sparkline.length - 1) : sparkline;
  const baselineAvg =
    baselinePoints.reduce((acc, point) => acc + point.volume, 0) /
    Math.max(baselinePoints.length, 1);
  const currentVolume = sparkline.at(-1)?.volume ?? baselineAvg;
  const delta =
    currentVolume - baselineAvg;
  const deltaPct =
    baselineAvg > 0 ? Math.round((delta / baselineAvg) * 100) : 0;
  const baselineY =
    chartPadding.top +
    (chartHeight - chartPadding.top - chartPadding.bottom) *
      (1 - baselineAvg / Math.max(maxVolume, 1));
  const sparklinePath = buildSparklinePath(sparkline);
  const areaPath = buildArea(sparkline);
  const yTicks = [0, Math.round(maxVolume / 2), maxVolume];
  const xPoints = sparkline.map((point, index) => {
    const usableWidth = chartWidth - chartPadding.left - chartPadding.right;
    const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    return {
      x:
        chartPadding.left +
        usableWidth * (index / Math.max(sparkline.length - 1, 1)),
      y:
        chartPadding.top +
        usableHeight * (1 - point.volume / Math.max(maxVolume, 1)),
      label: timeFormatter.format(new Date(point.ts)),
      value: point.volume
    };
  });

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {t.alerts.detail.spikeHeading(formatTopic(alert.topic))}
        </h3>
        <p className="text-sm text-slate-500">
          {`${formatRegion(alert.region)} | ${t.common.relativeWindow(alert.window_min)} | ${formatTimestamp(alert.ts)}`}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <span className="text-xs font-semibold uppercase text-slate-500">
          {t.alerts.detail.volumeTitle}
        </span>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-32 w-full"
          role="img"
          aria-label={t.alerts.detail.volumeTitle}
        >
          <defs>
            <linearGradient id="alertArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(76,58,254,0.25)" />
              <stop offset="100%" stopColor="rgba(76,58,254,0.02)" />
            </linearGradient>
          </defs>

          <rect
            x={chartPadding.left}
            y={chartPadding.top}
            width={chartWidth - chartPadding.left - chartPadding.right}
            height={chartHeight - chartPadding.top - chartPadding.bottom}
            fill="#F8FAFF"
            rx={12}
          />

          {yTicks.map((tick) => {
            const y =
              chartPadding.top +
              (chartHeight - chartPadding.top - chartPadding.bottom) *
                (1 - tick / Math.max(maxVolume, 1));
            return (
              <g key={`tick-${tick}`}>
                <line
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={y}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 6"
                />
                <text
                  x={chartPadding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px]"
                >
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={chartPadding.left}
            x2={chartWidth - chartPadding.right}
            y1={baselineY}
            y2={baselineY}
            stroke="#94A3B8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />

          <path
            d={areaPath}
            fill="url(#alertArea)"
            className="transition-all duration-500 ease-out"
          />

          <path
            d={sparklinePath}
            fill="none"
            stroke="rgb(76, 58, 254)"
            strokeWidth={2.5}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />

          {xPoints.map((point, index) => (
            <g key={`point-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={3.5}
                fill="#4C3AFE"
                stroke="white"
                strokeWidth={1.5}
              />
              <text
                x={point.x}
                y={chartHeight - chartPadding.bottom + 18}
                textAnchor="middle"
                className="fill-slate-400 text-[10px]"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-3 rounded bg-[#4C3AFE]" />
            {t.alerts.detail.legendActual}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-3 rounded border border-dashed border-[#94A3B8]" />
            {t.alerts.detail.legendBaseline}
          </span>
          <span className="ml-auto text-sm font-semibold text-slate-600">
            {t.alerts.detail.delta(Math.round(delta), deltaPct)}
          </span>
        </div>
        <div className="grid gap-2 rounded-xl bg-white p-3 text-xs text-slate-500 md:grid-cols-3">
          <div>
            <p className="uppercase tracking-wide">
              {t.alerts.detail.baseline}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {Math.round(baselineAvg)}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide">
              {t.alerts.detail.current}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {Math.round(currentVolume)}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide">
              {t.alerts.detail.spike}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {deltaPct >= 0 ? "+" : ""}
              {deltaPct}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            {t.alerts.detail.topEmotions}
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {topEmotionEntries.map(([emotion, count]) => (
              <li
                key={emotion}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span>{mapEmotion(emotion)}</span>
                <span className="text-xs text-slate-500">{count}</span>
              </li>
            ))}
            {!topEmotionEntries.length && (
              <li className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
                {t.alerts.detail.notEnough}
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            {t.alerts.detail.topSubtopics}
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {topSubtopicEntries.map(([subtopic, count]) => (
              <li
                key={subtopic}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span>{formatSubtopic(subtopic)}</span>
                <span className="text-xs text-slate-500">{count}</span>
              </li>
            ))}
            {!topSubtopicEntries.length && (
              <li className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
                {t.alerts.detail.noSubtopic}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          onClick={() => onOpenExplorer?.(alert)}
        >
          {t.alerts.detail.openExplorer}
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {t.alerts.detail.assignOwner}
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {t.alerts.detail.resolve}
        </button>
      </div>
    </div>
  );
};
