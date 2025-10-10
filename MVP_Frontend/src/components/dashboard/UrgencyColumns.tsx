import type { InteractionRecord } from "../../types";
import { mapEmotion, mapTrend } from "../../utils/mappers";
import { cn } from "../../utils/cn";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type UrgencyColumnsProps = {
  groups: Record<"P1" | "P2" | "P3", InteractionRecord[]>;
  onOpenInteraction?: (interaction: InteractionRecord) => void;
};

const URGENCY_COLORS: Record<"P1" | "P2" | "P3", string> = {
  P1: "bg-danger text-white",
  P2: "bg-amber-500 text-white",
  P3: "bg-sky-500 text-white"
};

const TrendGlyph = ({ trend }: { trend: string | null | undefined }) => {
  if (!trend) {
    return null;
  }
  const lower = trend.toLowerCase();
  if (lower === "rising") {
    return <span aria-hidden="true">↑</span>;
  }
  if (lower === "falling") {
    return <span aria-hidden="true">↓</span>;
  }
  return <span aria-hidden="true">→</span>;
};

export const UrgencyColumns = ({ groups, onOpenInteraction }: UrgencyColumnsProps) => {
  const { t } = useI18n();
  const { formatTopic, formatSubtopic, formatUrgencyReason } =
    useDomainFormatters();

  const levels: Array<"P1" | "P2" | "P3"> = ["P1", "P2", "P3"];

  return (
    <section
      aria-label={t.dashboard.urgencyQueueTitle}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        {t.dashboard.urgencyQueueTitle}
      </h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {levels.map((level) => {
          const interactions = groups[level];
          const color = URGENCY_COLORS[level];
          return (
            <div
              key={level}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {level} | {t.dashboard.urgencyLevels[level]}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                      color
                    )}
                  >
                    {interactions.length}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {interactions.map((interaction) => {
                  const emotion = mapEmotion(interaction.emotion.emotion_now);
                  const trend = mapTrend(interaction.emotion.trend);
                  return (
                    <article
                      key={interaction.call_id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatTopic(interaction.topic.topic)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatSubtopic(interaction.topic.subtopic)}
                          </p>
                        </div>
                        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {interaction.call_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{emotion}</span>
                        <TrendGlyph trend={trend} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {formatUrgencyReason(interaction.urgency.reason)}
                      </p>
                      <button
                        type="button"
                        className="mt-1 inline-flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        onClick={() => onOpenInteraction?.(interaction)}
                      >
                        {t.dashboard.openInteraction}
                        <span aria-hidden="true">→</span>
                      </button>
                    </article>
                  );
                })}
                {!interactions.length && (
                  <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                    {t.dashboard.urgencyEmpty}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
