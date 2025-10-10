import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore, buildAlertKey } from "../store/useAppStore";
import { AlertsTable } from "../components/alerts/AlertsTable";
import { AlertDetail } from "../components/alerts/AlertDetail";
import { filterInteractions } from "../utils/filtering";
import { getLatestTimestamp } from "../utils/aggregations";
import { useI18n } from "../i18n";

export const AlertsPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const alerts = useAppStore((state) => state.alerts);
  const filters = useAppStore((state) => state.filters);
  const interactions = useAppStore((state) => state.interactions);
  const selectedAlertKey = useAppStore((state) => state.selectedAlertKey);
  const setSelectedAlertKey = useAppStore((state) => state.setSelectedAlertKey);
  const updateAlertStatus = useAppStore((state) => state.updateAlertStatus);
  const alertSeriesLookup = useAppStore((state) => state.alertSeries);
  const { t } = useI18n();

  const requestedRegion = params.get("region");
  const requestedTopic = params.get("topic");

  useEffect(() => {
    if (requestedRegion && requestedTopic) {
      const match = alerts.find(
        (alert) =>
          alert.region === requestedRegion && alert.topic === requestedTopic
      );
      if (match) {
        setSelectedAlertKey(buildAlertKey(match));
      }
    }
  }, [alerts, requestedRegion, requestedTopic, setSelectedAlertKey]);

  const selectedAlert = alerts.find(
    (alert) => buildAlertKey(alert) === selectedAlertKey
  );

  const sparklineKey = selectedAlert
    ? `${selectedAlert.region}|${selectedAlert.topic}`
    : "";

  const sparklineData = sparklineKey
    ? alertSeriesLookup[sparklineKey] ?? []
    : [];

  const referenceDate = useMemo(
    () => getLatestTimestamp(interactions) ?? new Date(),
    [interactions]
  );

  const relatedInteractions = useMemo(() => {
    const withinFilters = filterInteractions(
      interactions,
      filters,
      referenceDate
    );
    if (!selectedAlert) {
      return withinFilters;
    }
    return withinFilters.filter(
      (interaction) =>
        interaction.metadata.region === selectedAlert.region &&
        interaction.topic.topic === selectedAlert.topic
    );
  }, [interactions, filters, selectedAlert, referenceDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            {t.alerts.heading}
          </h1>
          <p className="text-sm text-slate-500">
            {t.alerts.subheading}
          </p>
        </div>
        <div className="overflow-x-auto">
          <AlertsTable
            alerts={alerts}
            selectedKey={selectedAlertKey}
            buildKey={buildAlertKey}
            onSelect={(alert) => setSelectedAlertKey(buildAlertKey(alert))}
            onStatusChange={(alert, status) =>
              updateAlertStatus(buildAlertKey(alert), status)
            }
          />
        </div>
      </section>
      <AlertDetail
        alert={selectedAlert ?? null}
        sparkline={sparklineData}
        relatedInteractions={relatedInteractions}
        onOpenExplorer={(alert) => {
          const search = new URLSearchParams();
          search.set("region", alert.region);
          search.set("topic", alert.topic);
          navigate({ pathname: "/explorer", search: search.toString() });
        }}
      />
    </div>
  );
};
