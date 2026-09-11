// Batch-page content only. This data never grants enrollment or changes checkout policy.
export const overviewIcons = ['clock', 'book', 'star', 'sparkles', 'award', 'shield'] as const;
export type OverviewIcon = typeof overviewIcons[number];
export type OverviewStat = { label: string; value: string; icon: OverviewIcon };
export type OverviewFeature = { text: string; icon: OverviewIcon };
export type OverviewSection = { title: string; body: string; items: string[] };
export type BatchOverview = {
  pageTitle: string; overviewTitle: string; featuresTitle: string;
  priceLabel: string; startLabel: string; freeLabel: string;
  stats: OverviewStat[]; features: OverviewFeature[]; sections: OverviewSection[];
};
const text = (value: unknown, fallback: string, max = 200) =>
  typeof value === 'string' ? value.slice(0, max) : fallback;
const icon = (value: unknown): OverviewIcon =>
  overviewIcons.includes(value as OverviewIcon) ? value as OverviewIcon : 'book';
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
export function batchOverview(raw: unknown, legacy: { duration?: string; total_lectures?: number; rating?: number } = {}): BatchOverview {
  const data = record(raw);
  return {
    pageTitle: text(data.pageTitle, 'Batch Overview'),
    overviewTitle: text(data.overviewTitle, 'Course Syllabus & Overview'),
    featuresTitle: text(data.featuresTitle, 'Key Course Features'),
    priceLabel: text(data.priceLabel, 'Total Investment'),
    startLabel: text(data.startLabel, 'Start Learning') || 'Start Learning',
    freeLabel: text(data.freeLabel, 'Enroll for Free') || 'Enroll for Free',
    stats: Array.isArray(data.stats) ? data.stats.slice(0, 12).map(record).map(s => ({
      label: text(s.label, ''), value: text(s.value, ''), icon: icon(s.icon),
    })) : [
      { label: 'Duration', value: legacy.duration || 'Not specified', icon: 'clock' },
      { label: 'Lectures', value: String(legacy.total_lectures ?? 0), icon: 'book' },
      { label: 'Rating', value: legacy.rating == null ? 'Not rated' : String(legacy.rating), icon: 'star' },
    ],
    features: Array.isArray(data.features) ? data.features.slice(0, 50).map(record).map(f => ({
      text: text(f.text, '', 2000), icon: icon(f.icon),
    })) : [],
    sections: Array.isArray(data.sections) ? data.sections.slice(0, 30).map(record).map(s => ({
      title: text(s.title, ''), body: text(s.body, '', 10000),
      items: Array.isArray(s.items) ? s.items.slice(0, 50).map(i => text(i, '', 2000)) : [],
    })) : [],
  };
}
