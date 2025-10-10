import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { useI18n } from "../i18n";
import { useDomainFormatters } from "../i18n/domain";

const Toggle = (
  {
    label,
    description,
    checked,
    disabled = false,
    lockedLabel
  }: {
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    lockedLabel: string;
  }
) => (
  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <span className="mt-1 inline-flex h-5 w-10 items-center rounded-full bg-slate-200">
      <span
        className={`ml-0.5 inline-block h-4 w-4 rounded-full transition ${
          checked ? "translate-x-[18px] bg-primary" : "bg-white"
        }`}
      />
    </span>
    <span className="flex flex-col">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <span className="text-xs text-slate-500">{description}</span>
      {disabled && (
        <span className="mt-1 inline-flex w-max items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {lockedLabel}
        </span>
      )}
    </span>
  </label>
);

export const SettingsPage = () => {
  const interactions = useAppStore((state) => state.interactions);
  const { t } = useI18n();
  const { formatTopic, formatSubtopic } = useDomainFormatters();

  const taxonomy = useMemo(() => {
    const topics = new Map<string, Set<string>>();
    interactions.forEach((interaction) => {
      const { topic, subtopic } = interaction.topic;
      const set = topics.get(topic) ?? new Set<string>();
      set.add(subtopic);
      topics.set(topic, set);
    });
    return Array.from(topics.entries()).map(([topic, subtopics]) => ({
      topic,
      subtopics: Array.from(subtopics).sort()
    }));
  }, [interactions]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t.settings.heading}
        </h1>
        <p className="text-sm text-slate-500">{t.settings.subheading}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.settings.rolesTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {t.settings.rolesSubtitle}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {([
              t.settings.roles.viewer,
              t.settings.roles.analyst,
              t.settings.roles.supervisor,
              t.settings.roles.admin
            ] as const).map((role) => (
              <li
                key={role.name}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="font-semibold text-slate-900">{role.name}</p>
                <p className="text-xs text-slate-500">{role.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <Toggle
            label={t.settings.privacyDefaults.label}
            description={t.settings.privacyDefaults.description}
            checked
            disabled
            lockedLabel={t.settings.privacyDefaults.locked}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t.settings.thresholds.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">
                  {t.settings.thresholds.spike.label}
                </p>
                <p className="text-xs text-slate-500">
                  {t.settings.thresholds.spike.description}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {t.settings.thresholds.p1Rules.label}
                </p>
                <p className="text-xs text-slate-500">
                  {t.settings.thresholds.p1Rules.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t.settings.taxonomy.title}
            </h2>
            <p className="text-sm text-slate-500">
              {t.settings.taxonomy.subtitle}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500"
            disabled
          >
            {t.settings.taxonomy.addStub}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {taxonomy.map((item) => (
            <div
              key={item.topic}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {formatTopic(item.topic)}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                {item.subtopics.map((subtopic) => (
                  <li
                    key={subtopic}
                    className="rounded-full bg-white px-3 py-1 shadow-sm"
                  >
                    {formatSubtopic(subtopic)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
