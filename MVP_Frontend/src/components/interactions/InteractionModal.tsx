import { useEffect } from "react";
import type { InteractionRecord } from "../../types";
import { mapEmotion, mapTrend } from "../../utils/mappers";
import { formatConfidence, formatTimestamp } from "../../utils/format";
import { cn } from "../../utils/cn";
import { useI18n } from "../../i18n";
import { useDomainFormatters } from "../../i18n/domain";

type InteractionModalProps = {
  interaction: InteractionRecord | null;
  open: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

const urgencyColors: Record<"P1" | "P2" | "P3", string> = {
  P1: "bg-danger/10 text-danger border-danger/40",
  P2: "bg-amber-100 text-amber-700 border-amber-200",
  P3: "bg-sky-100 text-sky-700 border-sky-200"
};

const downloadJson = (interaction: InteractionRecord) => {
  const sanitized = {
    call_id: interaction.call_id,
    redacted: interaction.redacted,
    topic: interaction.topic,
    emotion: interaction.emotion,
    urgency: interaction.urgency,
    metadata: interaction.metadata
  };

  const blob = new Blob([JSON.stringify(sanitized, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${interaction.call_id}_redacted.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const InteractionModal = ({
  interaction,
  open,
  onClose,
  onPrev,
  onNext
}: InteractionModalProps) => {
  const { t } = useI18n();
  const {
    formatTopic,
    formatSubtopic,
    formatRegion,
    formatDialect,
    formatChannel,
    formatUrgencyReason,
    formatSpeaker
  } = useDomainFormatters();
  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!interaction || !open) {
    return null;
  }

  const englishEmotion = mapEmotion(interaction.emotion.emotion_now);
  const trend = mapTrend(interaction.emotion.trend);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="interaction-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8"
    >
      <div className="relative flex w-full max-w-5xl flex-col gap-4 rounded-3xl bg-white p-6 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {interaction.call_id} | {formatChannel(interaction.metadata.channel)} |{" "}
              {formatRegion(interaction.metadata.region)}
            </p>
            <h2
              id="interaction-modal-title"
              className="text-2xl font-semibold text-slate-900"
            >
              {formatTopic(interaction.topic.topic)} - {formatSubtopic(interaction.topic.subtopic)}
            </h2>
            <p className="text-sm text-slate-500">
              {formatTimestamp(interaction.metadata.timestamp)} |{" "}
              {englishEmotion} ({trend})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-semibold",
                urgencyColors[interaction.urgency.urgency]
              )}
            >
              {interaction.urgency.urgency}
            </span>
            <button
              type="button"
              className="h-9 rounded-full border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              onClick={() => downloadJson(interaction)}
            >
              {t.interactions.modal.downloadJson}
            </button>
            <button
              type="button"
              className="h-9 rounded-full border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              onClick={onClose}
            >
              {t.interactions.modal.close}
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase text-slate-500">
              {t.interactions.modal.redactedTranscript}
            </h3>
            <ol className="flex flex-col gap-3">
              {interaction.redacted.turns.map((turn, index) => (
                <li
                  key={`${turn.spk}-${turn.t0}-${index}`}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3"
                >
                  <div className="w-24 shrink-0">
                    <span className="inline-flex w-full justify-center rounded-full bg-white px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                      {formatSpeaker(turn.spk)}
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500">
                      [{turn.t0}s - {turn.t1}s]
                    </p>
                  </div>
                  <p className="text-sm text-slate-700">{turn.text}</p>
                </li>
              ))}
            </ol>
            {interaction.redacted.redaction_log.length > 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
                <span className="mr-1 font-semibold uppercase tracking-wide">
                  {t.interactions.modal.piiRemoved}
                </span>
                {interaction.redacted.redaction_log.join(", ")}
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-500">
                {t.interactions.modal.urgencyReason}
              </h3>
              <p className="mt-2 text-sm text-slate-700">
                {formatUrgencyReason(interaction.urgency.reason)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-500">
                {t.interactions.modal.topicConfidence}
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {formatConfidence(interaction.topic.confidence)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-500">
                {t.interactions.card.dialect}
              </h3>
              <p className="mt-2 text-sm text-slate-700">
                {formatDialect(interaction.metadata.dialect)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-500">
                {t.filters.agent}
              </h3>
              <p className="mt-2 text-sm text-slate-700">
                {interaction.metadata.agent}
              </p>
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="h-9 rounded-full border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onPrev?.()}
            disabled={!onPrev}
          >
            {t.interactions.modal.prev}
          </button>
          <button
            type="button"
            className="h-9 rounded-full border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onNext?.()}
            disabled={!onNext}
          >
            {t.interactions.modal.next}
          </button>
        </footer>
      </div>
    </div>
  );
};
