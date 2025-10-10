import type { TopEmotionSummary } from "../../utils/aggregations";
import { cn } from "../../utils/cn";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type KpiTilesProps = {
  totalInteractions: number;
  urgencyPercentage: number;
  urgencyLabel: string;
  urgencyDescription: string;
  timeWindowLabel: string;
  topEmotion: TopEmotionSummary;
  topTopic: string | null;
};

const Card = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const TrendChip = ({ label }: { label: string | null }) => {
  if (!label) {
    return null;
  }

  const trendLower = label.toLowerCase();
  const colorClass =
    trendLower === "rising"
      ? "text-danger bg-danger/10"
      : trendLower === "falling"
      ? "text-emerald-600 bg-emerald-50"
      : "text-slate-600 bg-slate-100";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        colorClass
      )}
    >
      {label}
    </span>
  );
};

export const KpiTiles = ({
  totalInteractions,
  urgencyPercentage,
  urgencyLabel,
  urgencyDescription,
  timeWindowLabel,
  topEmotion,
  topTopic
}: KpiTilesProps) => {
  const { t } = useI18n();
  const { formatTopic } = useDomainFormatters();
  const trendLabel = topEmotion.trend;
  const topicLabel = topTopic ? formatTopic(topTopic) : "-";

  return (
    <section
      aria-label={t.dashboard.heading}
      className="grid gap-4 lg:grid-cols-4"
    >
      <Card>
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-slate-500 uppercase">
            {t.dashboard.totalInteractions}
          </span>
          <span className="text-4xl font-semibold text-slate-900">
            {totalInteractions}
          </span>
          <span className="text-xs text-slate-500">{timeWindowLabel}</span>
      </div>
    </Card>

    <Card className="bg-amber-50">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-amber-700 uppercase">
          {urgencyLabel}
        </span>
        <span className="text-4xl font-semibold text-amber-900">
          {urgencyPercentage}%
        </span>
        <span className="text-xs text-amber-700">{urgencyDescription}</span>
      </div>
    </Card>

    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500 uppercase">
            {t.dashboard.topEmotion}
          </span>
          <TrendChip label={trendLabel} />
        </div>
        <span className="text-3xl font-semibold text-slate-900">
          {topEmotion.emotion ?? "-"}
        </span>
      </div>
    </Card>

    <Card>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-slate-500 uppercase">
          {t.dashboard.topTopic}
        </span>
        <span className="text-3xl font-semibold text-slate-900">
          {topicLabel}
        </span>
      </div>
    </Card>
  </section>
  );
};
