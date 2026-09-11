import { BatchOverview, OverviewIcon, overviewIcons } from '../lib/batchOverview';

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white p-2 text-sm';
function Field({ label, value, onChange, multiline = false, maxLength = 200 }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; maxLength?: number }) {
  return <label className="block space-y-1 text-xs font-semibold text-gray-700"><span>{label}</span>{multiline
    ? <textarea className={inputClass} rows={3} maxLength={maxLength} value={value} onChange={e => onChange(e.target.value)} />
    : <input className={inputClass} maxLength={maxLength} value={value} onChange={e => onChange(e.target.value)} />}</label>;
}
function IconSelect({ value, onChange }: { value: OverviewIcon; onChange: (v: OverviewIcon) => void }) {
  return <label className="text-xs">Icon<select className={inputClass} value={value} onChange={e => onChange(e.target.value as OverviewIcon)}>{overviewIcons.map(i => <option key={i}>{i}</option>)}</select></label>;
}
function Controls({ index, count, move, remove }: { index: number; count: number; move: (delta: number) => void; remove: () => void }) {
  return <div className="flex gap-3 text-xs"><button type="button" disabled={index === 0} onClick={() => move(-1)} className="disabled:opacity-30">Move up</button><button type="button" disabled={index === count - 1} onClick={() => move(1)} className="disabled:opacity-30">Move down</button><button type="button" onClick={remove} className="text-red-600">Remove</button></div>;
}
export default function BatchOverviewEditor({ value, onChange }: { value: BatchOverview; onChange: (v: BatchOverview) => void }) {
  const set = <K extends keyof BatchOverview>(key: K, next: BatchOverview[K]) => onChange({ ...value, [key]: next });
  const move = <T,>(items: T[], index: number, delta: number): T[] => {
    const next = [...items]; const target = index + delta;
    if (target >= 0 && target < next.length) [next[index], next[target]] = [next[target], next[index]];
    return next;
  };
  return <fieldset className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
    <legend className="font-bold">Android Batch Overview</legend>
    <p className="text-xs text-gray-600">Content only: prices above and verified enrollment still control purchases/access. Empty lists hide their sections. Statistics are display text, not actual lecture counts or student reviews. Only publish accurate claims. Extra sections support plain text and bullets, not HTML, scripts or checkout links.</p>
    {(['pageTitle', 'overviewTitle', 'featuresTitle', 'priceLabel', 'startLabel', 'freeLabel'] as const).map((key, index) => <Field key={key} label={['Page header', 'Description heading', 'Features heading', 'Price caption (direct APK only)', 'Enrolled button label', 'Free enrollment button label'][index]} value={value[key]} onChange={v => set(key, v)} />)}
    <h3 className="font-semibold">Statistics</h3>
    {value.stats.map((s, i) => <div key={i} className="space-y-2 rounded-lg border p-3">
      <Field label="Label" value={s.label} onChange={v => set('stats', value.stats.map((x, n) => n === i ? { ...x, label: v } : x))} />
      <Field label="Value (for example 6 Months or 60+)" value={s.value} onChange={v => set('stats', value.stats.map((x, n) => n === i ? { ...x, value: v } : x))} />
      <IconSelect value={s.icon} onChange={v => set('stats', value.stats.map((x, n) => n === i ? { ...x, icon: v } : x))} />
      <Controls index={i} count={value.stats.length} move={d => set('stats', move(value.stats, i, d))} remove={() => set('stats', value.stats.filter((_, n) => n !== i))} />
    </div>)}
    <button type="button" disabled={value.stats.length >= 12} onClick={() => set('stats', [...value.stats, { label: '', value: '', icon: 'book' }])}>+ Add statistic</button>
    <h3 className="font-semibold">Features</h3>
    {value.features.map((f, i) => <div key={i} className="space-y-2 rounded-lg border p-3">
      <Field label="Feature text" value={f.text} maxLength={2000} multiline onChange={v => set('features', value.features.map((x, n) => n === i ? { ...x, text: v } : x))} />
      <IconSelect value={f.icon} onChange={v => set('features', value.features.map((x, n) => n === i ? { ...x, icon: v } : x))} />
      <Controls index={i} count={value.features.length} move={d => set('features', move(value.features, i, d))} remove={() => set('features', value.features.filter((_, n) => n !== i))} />
    </div>)}
    <button type="button" disabled={value.features.length >= 50} onClick={() => set('features', [...value.features, { text: '', icon: 'sparkles' }])}>+ Add feature</button>
    <h3 className="font-semibold">Additional sections</h3>
    {value.sections.map((s, i) => <div key={i} className="space-y-2 rounded-lg border p-3">
      <Field label="Section heading" value={s.title} onChange={v => set('sections', value.sections.map((x, n) => n === i ? { ...x, title: v } : x))} />
      <Field label="Paragraph" multiline maxLength={10000} value={s.body} onChange={v => set('sections', value.sections.map((x, n) => n === i ? { ...x, body: v } : x))} />
      {s.items.map((item, j) => <div key={j} className="space-y-2 border-l-2 pl-3">
        <Field label="Bullet text" multiline maxLength={2000} value={item} onChange={v => set('sections', value.sections.map((x, n) => n === i ? { ...x, items: x.items.map((t, k) => k === j ? v : t) } : x))} />
        <Controls index={j} count={s.items.length} move={d => set('sections', value.sections.map((x, n) => n === i ? { ...x, items: move(x.items, j, d) } : x))} remove={() => set('sections', value.sections.map((x, n) => n === i ? { ...x, items: x.items.filter((_, k) => k !== j) } : x))} />
      </div>)}
      <button type="button" disabled={s.items.length >= 50} onClick={() => set('sections', value.sections.map((x, n) => n === i ? { ...x, items: [...x.items, ''] } : x))}>+ Add bullet</button>
      <Controls index={i} count={value.sections.length} move={d => set('sections', move(value.sections, i, d))} remove={() => set('sections', value.sections.filter((_, n) => n !== i))} />
    </div>)}
    <button type="button" disabled={value.sections.length >= 30} onClick={() => set('sections', [...value.sections, { title: '', body: '', items: [] }])}>+ Add section</button>
  </fieldset>;
}
