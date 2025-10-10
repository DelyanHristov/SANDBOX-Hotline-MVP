import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore, buildAlertKey } from "../store/useAppStore";
import { FiltersBar } from "../components/Filters/FiltersBar";
import { KpiTiles } from "../components/dashboard/KpiTiles";
import { Heatmap } from "../components/dashboard/Heatmap";
import { SpikeList } from "../components/dashboard/SpikeList";
import { UrgencyColumns } from "../components/dashboard/UrgencyColumns";
import { InteractionModal } from "../components/interactions/InteractionModal";
import { filterInteractions } from "../utils/filtering";
import {
  getTopEmotion,
  getTopTopic,
  getTotalInteractions,
  groupByUrgency,
  getLatestTimestamp,
  getUrgencyPercentage
} from "../utils/aggregations";
import type { InteractionRecord } from "../types";
import { useI18n } from "../i18n";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const interactions = useAppStore((state) => state.interactions);
  const alerts = useAppStore((state) => state.alerts);
  const heatmap = useAppStore((state) => state.heatmap);
  const filters = useAppStore((state) => state.filters);
  const filtersCollapsed = useAppStore((state) => state.filtersCollapsed);
  const setSelectedAlertKey = useAppStore(
    (state) => state.setSelectedAlertKey
  );

  const [activeInteraction, setActiveInteraction] =
    useState<InteractionRecord | null>(null);
  const { t } = useI18n();

  const referenceDate = useMemo(
    () => getLatestTimestamp(interactions) ?? new Date(),
    [interactions]
  );

  const filteredInteractions = useMemo(
    () => filterInteractions(interactions, filters, referenceDate),
    [interactions, filters, referenceDate]
  );

  const interactionsWithoutUrgencyFilter = useMemo(
    () =>
      filterInteractions(
        interactions,
        { ...filters, urgency: "All" },
        referenceDate
      ),
    [interactions, filters, referenceDate]
  );

  const filteredAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => filters.region === "All" || alert.region === filters.region
      ),
    [alerts, filters.region]
  );

  const totalInteractions = getTotalInteractions(filteredInteractions);
  const topEmotion = getTopEmotion(filteredInteractions);
  const topTopic = getTopTopic(filteredInteractions);
  const urgencyGroups = groupByUrgency(filteredInteractions);
  const activeUrgency =
    filters.urgency === "All" ? "P1" : filters.urgency;
  const urgencyPercentage = getUrgencyPercentage(
    interactionsWithoutUrgencyFilter,
    activeUrgency
  );
  const urgencyLabel =
    filters.urgency === "All"
      ? t.dashboard.urgencyCard.defaultLabel
      : t.dashboard.urgencyCard.filteredLabel(filters.urgency);
  const urgencyDescription =
    filters.urgency === "All"
      ? t.dashboard.urgencyCard.defaultDescription
      : t.dashboard.urgencyCard.filteredDescription(filters.urgency);
  const timeWindowLabel = t.timeRanges[filters.timeRange];

  const handleCellClick = (region: string, topic: string) => {
    const params = new URLSearchParams();
    params.set("region", region);
    params.set("topic", topic);
    navigate({ pathname: "/explorer", search: params.toString() });
  };

  const handleAlertSelect = (alert: (typeof alerts)[number]) => {
    const params = new URLSearchParams();
    params.set("region", alert.region);
    params.set("topic", alert.topic);
    navigate({ pathname: "/alerts", search: params.toString() });
    setSelectedAlertKey(buildAlertKey(alert));
  };

  const handleOpenInteraction = (interaction: InteractionRecord) => {
    setActiveInteraction(interaction);
  };

  const interactionIndex = activeInteraction
    ? filteredInteractions.findIndex(
        (item) => item.call_id === activeInteraction.call_id
      )
    : -1;

  const handlePrev = interactionIndex > 0
    ? () => setActiveInteraction(filteredInteractions[interactionIndex - 1])
    : undefined;

  const handleNext =
    interactionIndex >= 0 && interactionIndex < filteredInteractions.length - 1
      ? () => setActiveInteraction(filteredInteractions[interactionIndex + 1])
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div id="global-filters">
        <FiltersBar hidden={filtersCollapsed} />
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t.dashboard.heading}
        </h1>
        <p className="text-sm text-slate-500">{t.dashboard.subheading}</p>
      </section>

      <KpiTiles
        totalInteractions={totalInteractions}
        urgencyPercentage={urgencyPercentage}
        urgencyLabel={urgencyLabel}
        urgencyDescription={urgencyDescription}
        timeWindowLabel={timeWindowLabel}
        topEmotion={topEmotion}
        topTopic={topTopic}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-start">
        {heatmap ? (
          <Heatmap
            regions={heatmap.regions}
            topics={heatmap.topics}
            counts={heatmap.counts}
            onCellClick={handleCellClick}
          />
        ) : (
          <section className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t.dashboard.heatmapTitle}
            </h2>
            <p>{t.dashboard.heatmapSubtitle}</p>
            <p>No heatmap data available yet.</p>
          </section>
        )}
        <SpikeList alerts={filteredAlerts} onAlertSelect={handleAlertSelect} />
      </div>

      <UrgencyColumns
        groups={urgencyGroups}
        onOpenInteraction={handleOpenInteraction}
      />

      <InteractionModal
        interaction={activeInteraction}
        open={!!activeInteraction}
        onClose={() => setActiveInteraction(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
};
