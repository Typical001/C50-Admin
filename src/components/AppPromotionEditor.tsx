import { promotionTextLimits, validateAppPromotion } from '../lib/appPromotion';
import type { AppPromotion, StoreStatus } from '../lib/appPromotion';

export default function AppPromotionEditor({ value, onChange, disabled }: {
  value: AppPromotion; onChange: (value: AppPromotion) => void; disabled: boolean;
}) {
  const error = validateAppPromotion(value);
  const labels = { badge: 'Badge', heading: 'Heading', description: 'Description', phone_name: 'Phone preview name', phone_caption: 'Phone preview caption' };
  return <fieldset disabled={disabled} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5 min-w-0">
    <legend className="text-base font-bold text-gray-900 px-2">Mobile App Promotion</legend>
    <label className="flex gap-3 items-center text-sm font-semibold"><input type="checkbox" checked={value.visible} onChange={e => onChange({ ...value, visible: e.target.checked })} />Show on website homepage</label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {(Object.keys(labels) as (keyof typeof labels)[]).map(key => <label key={key} className={`text-sm font-semibold space-y-2 min-w-0 ${key === 'description' ? 'sm:col-span-2' : ''}`}>
        <span>{labels[key]}</span>
        {key === 'description'
          ? <textarea value={value[key]} maxLength={promotionTextLimits[key]} rows={3} onChange={e => onChange({ ...value, [key]: e.target.value })} className="block w-full border border-gray-300 rounded-xl p-3 font-normal" />
          : <input value={value[key]} maxLength={promotionTextLimits[key]} onChange={e => onChange({ ...value, [key]: e.target.value })} className="block w-full border border-gray-300 rounded-xl p-3 font-normal" />}
      </label>)}
    </div>
    {(['google_play', 'app_store'] as const).map(key => <div key={key} className="border border-gray-200 rounded-2xl p-4 space-y-3">
      <label className="block text-sm font-semibold">{key === 'google_play' ? 'Google Play' : 'Apple App Store'} status
        <select value={value[key].status} onChange={e => onChange({ ...value, [key]: { ...value[key], status: e.target.value as StoreStatus } })} className="block w-full border border-gray-300 rounded-xl p-3 mt-2">
          <option value="hidden">Hidden</option><option value="coming_soon">Coming Soon</option><option value="available">Available</option>
        </select>
      </label>
      <label className="block text-sm font-semibold">Store listing URL {value[key].status === 'available' ? '(required)' : '(optional)'}
        <input type="url" value={value[key].url} maxLength={2048} onChange={e => onChange({ ...value, [key]: { ...value[key], url: e.target.value.trim() } })} placeholder={key === 'google_play' ? 'https://play.google.com/store/apps/details?id=…' : 'https://apps.apple.com/…/id…'} className="block w-full border border-gray-300 rounded-xl p-3 mt-2 font-normal" />
      </label>
      <p className="text-xs text-gray-500">Available opens the listing in a new tab. Coming Soon is a label; Hidden removes the store option.</p>
    </div>)}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <p className="text-xs text-gray-500">Save Settings, then reload the website to see your changes. Only describe features currently available in the app.</p>
  </fieldset>;
}
