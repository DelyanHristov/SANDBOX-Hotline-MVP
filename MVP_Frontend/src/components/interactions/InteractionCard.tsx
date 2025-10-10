import type { InteractionRecord } from "../../types";
import { mapEmotion, mapTrend } from "../../utils/mappers";
import { formatTimestamp, truncateText } from "../../utils/format";
import { cn } from "../../utils/cn";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type InteractionCardProps = {
  interaction: InteractionRecord;
  onSelect?: (interaction: InteractionRecord) => void;
};

const channelIcon = (channel: string) => {
  switch (channel) {
    case "Call":
      return "📞";
    case "Chat":
      return "💬";
    case "SMS":
      return "✉️";
    default:
      return "ℹ️";
  }
};

const urgencyStyles: Record<"P1" | "P2" | "P3", { className: string }> = {
  P1: { className: "bg-danger/10 text-danger" },
  P2: { className: "bg-amber-100 text-amber-700" },
  P3: { className: "bg-sky-100 text-sky-700" }
};

export const InteractionCard = ({
  interaction,
  onSelect
}: InteractionCardProps) => {
  const { t } = useI18n();
  const {
    formatTopic,
    formatSubtopic,
    formatRegion,
    formatDialect
  } = useDomainFormatters();
  const {
    call_id,
    topic,
    emotion,
    urgency,
    metadata,
    redacted: { turns, redaction_log }
  } = interaction;

  const snippet = truncateText((turns[0]?.text) ?? "");
  const englishEmotion = mapEmotion(emotion.emotion_now);
  const trend = mapTrend(emotion.trend);

  return (
    <button
      type="button"
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      onClick={() => onSelect?.(interaction)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full border border-slate-200 px-2 py-0.5">
              {call_id}
            </span>
            <span aria-hidden="true">{channelIcon(metadata.channel)}</span>
          </span>
          <h3 className="text-lg font-semibold text-slate-900">
            {formatTopic(topic.topic)}
          </h3>
          <p className="text-sm text-slate-500">
            {formatSubtopic(topic.subtopic)}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            urgencyStyles[urgency.urgency].className
          )}
        >
          {t.common.urgencyLabels[urgency.urgency]}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>📍 {formatRegion(metadata.region)}</span>
        <span>🕒 {formatTimestamp(metadata.timestamp)}</span>
        <span>
          {t.interactions.card.emotion}: {englishEmotion}{" "}
          <span className="text-slate-400">{trend}</span>
        </span>
        <span>
          {t.interactions.card.dialect}: {formatDialect(metadata.dialect)}
        </span>
      </div>
      <p className="text-sm text-slate-600 italic">"{snippet}"</p>
      {!!redaction_log.length && (
        <span className="inline-flex items-center gap-1 self-start rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {t.explorer.redactedTag}
        </span>
      )}
    </button>
  );
};
