import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { InteractionCard } from "../components/interactions/InteractionCard";
import { InteractionModal } from "../components/interactions/InteractionModal";
import { filterInteractions } from "../utils/filtering";
import { mapEmotion } from "../utils/mappers";
import type { InteractionRecord } from "../types";
import { getLatestTimestamp } from "../utils/aggregations";
import { useI18n } from "../i18n";
import { useDomainFormatters } from "../i18n/domain";

export const ExplorerPage = () => {
  const [params] = useSearchParams();
  const interactions = useAppStore((state) => state.interactions);
  const filters = useAppStore((state) => state.filters);
  const setFilter = useAppStore((state) => state.setFilter);
  const { t, language } = useI18n();
  const { formatSubtopic, formatTopic } = useDomainFormatters();

  const [searchTerm, setSearchTerm] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");
  const [subtopicFilter, setSubtopicFilter] = useState("All");
  const [activeInteraction, setActiveInteraction] =
    useState<InteractionRecord | null>(null);

  const requestedRegion = params.get("region");
  const requestedTopic = params.get("topic");

  useEffect(() => {
    if (requestedRegion) {
      setFilter("region", requestedRegion);
    }
    if (requestedTopic) {
      setFilter("topic", requestedTopic);
    }
  }, [requestedRegion, requestedTopic, setFilter]);

  const referenceDate = useMemo(
    () => getLatestTimestamp(interactions) ?? new Date(),
    [interactions]
  );

  const baseInteractions = useMemo(
    () => filterInteractions(interactions, filters, referenceDate),
    [interactions, filters, referenceDate]
  );

  const subtopicOptions = useMemo(() => {
    const set = new Set<string>();
    baseInteractions.forEach((interaction) =>
      set.add(interaction.topic.subtopic)
    );
    return ["All", ...Array.from(set).sort()];
  }, [baseInteractions, language]);

  const emotionOptions = useMemo(() => {
    const set = new Set<string>();
    baseInteractions.forEach((interaction) =>
      set.add(interaction.emotion.emotion_now)
    );
    return ["All", ...Array.from(set).sort()];
  }, [baseInteractions, language]);

  const agentOptions = useMemo(() => {
    const set = new Set<string>();
    baseInteractions.forEach((interaction) =>
      set.add(interaction.metadata.agent)
    );
    return ["All", ...Array.from(set).sort()];
  }, [baseInteractions]);

  const filteredList = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    return baseInteractions.filter((interaction) => {
      const topicLabel = formatTopic(interaction.topic.topic).toLowerCase();
      const subtopicLabel = formatSubtopic(
        interaction.topic.subtopic
      ).toLowerCase();
      if (
        searchLower &&
        !interaction.call_id.toLowerCase().includes(searchLower) &&
        !interaction.topic.topic.toLowerCase().includes(searchLower) &&
        !topicLabel.includes(searchLower) &&
        !interaction.topic.subtopic.toLowerCase().includes(searchLower) &&
        !subtopicLabel.includes(searchLower)
      ) {
        return false;
      }

      if (
        subtopicFilter !== "All" &&
        interaction.topic.subtopic !== subtopicFilter
      ) {
        return false;
      }

      const englishEmotion = mapEmotion(interaction.emotion.emotion_now);
      if (emotionFilter !== "All" && englishEmotion !== emotionFilter) {
        return false;
      }

      if (
        agentFilter !== "All" &&
        interaction.metadata.agent !== agentFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    baseInteractions,
    searchTerm,
    subtopicFilter,
    emotionFilter,
    agentFilter,
    language
  ]);

  const activeIndex = activeInteraction
    ? filteredList.findIndex(
        (item) => item.call_id === activeInteraction.call_id
      )
    : -1;

  const prevInteraction =
    activeIndex > 0 ? filteredList[activeIndex - 1] : undefined;
  const nextInteraction =
    activeIndex >= 0 && activeIndex < filteredList.length - 1
      ? filteredList[activeIndex + 1]
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t.explorer.heading}
        </h1>
        <p className="text-sm text-slate-500">{t.explorer.subheading}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500" htmlFor="explorer-search">
              {t.filters.searchLabel}
            </label>
            <input
              id="explorer-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t.filters.searchPlaceholder}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500" htmlFor="subtopic-filter">
              {t.filters.subtopic}
            </label>
            <select
              id="subtopic-filter"
              value={subtopicFilter}
              onChange={(event) => setSubtopicFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {subtopicOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? t.common.all : formatSubtopic(option)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500" htmlFor="emotion-filter">
              {t.filters.emotion}
            </label>
            <select
              id="emotion-filter"
              value={emotionFilter}
              onChange={(event) => setEmotionFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {emotionOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? t.common.all : mapEmotion(option)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500" htmlFor="agent-filter">
              {t.filters.agent}
            </label>
            <select
              id="agent-filter"
              value={agentFilter}
              onChange={(event) => setAgentFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {agentOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? t.common.all : option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {t.filters.resultsCount(filteredList.length)}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredList.map((interaction) => (
          <InteractionCard
            key={interaction.call_id}
            interaction={interaction}
            onSelect={(item) => setActiveInteraction(item)}
          />
        ))}
        {!filteredList.length && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            {t.explorer.noResults}
          </div>
        )}
      </div>

      <InteractionModal
        interaction={activeInteraction}
        open={!!activeInteraction}
        onClose={() => setActiveInteraction(null)}
        onPrev={prevInteraction ? () => setActiveInteraction(prevInteraction) : undefined}
        onNext={nextInteraction ? () => setActiveInteraction(nextInteraction) : undefined}
      />
    </div>
  );
};
