import { useI18n } from "../../i18n";

type SummaryBulletsProps = {
  bullets: string[];
};

export const SummaryBullets = ({ bullets }: SummaryBulletsProps) => {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t.reports.leadershipTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {t.reports.leadershipSubtitle}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {t.reports.aiGenerated}
        </span>
      </div>
      <ol className="mt-4 space-y-3 text-sm text-slate-700">
        {bullets.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3"
          >
            <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </span>
            <p>{item}</p>
          </li>
        ))}
        {!bullets.length && (
          <li className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-500">
            {t.reports.noSummaries}
          </li>
        )}
      </ol>
    </section>
  );
};
