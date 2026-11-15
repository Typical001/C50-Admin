import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function GooglePlayProductEditor({ batchId }: { batchId: string }) {
  const [product, setProduct] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoaded(false); setMessage('');
    void supabase.from('google_play_products').select('product_id,enabled').eq('batch_id', batchId).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) { setMessage('Unable to load Google Play settings. Retry before editing.'); return; }
      setProduct(data?.product_id || `c50_batch_${batchId.replaceAll('-', '')}`);
      setEnabled(data?.enabled === true); setLocked(!!data); setLoaded(true);
    });
    return () => { active = false; };
  }, [batchId, revision]);
  async function save() {
    if (!loaded || busy) return;
    if (!/^[a-z][a-z0-9_.]{1,99}$/.test(product)) { setMessage('Enter a valid Google Play product ID.'); return; }
    setBusy(true); setMessage('');
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Sign in again.');
      const base = (import.meta.env.VITE_API_URL || 'https://c50-web.onrender.com').replace(/\/$/, '');
      const response = await fetch(`${base}/api/admin/google-play/products/${encodeURIComponent(batchId)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ productId: product, enabled }),
      });
      if (!response.ok) throw new Error('Could not save. Check the backend deployment and your administrator session.');
      setLocked(true); setMessage('Google Play mapping saved. This does not create or price the product in Play Console.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save.'); }
    finally { setBusy(false); }
  }
  return <section className="mt-6 border rounded-xl p-4 space-y-3">
    <h3 className="font-semibold">Google Play batch purchase</h3>
    <p className="text-sm text-gray-500">Create a matching one-time, non-consumable product in Play Console. Google Play controls the displayed price. Save the batch before editing this mapping. Product IDs cannot be changed after saving.</p>
    <label className="block text-sm">Google Play product ID<input className="w-full border rounded p-2" value={product} disabled={!loaded || locked || busy} onChange={e => setProduct(e.target.value)} /></label>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={enabled} disabled={!loaded || busy} onChange={e => setEnabled(e.target.checked)} /> Product ready for checkout</label>
    <p className="text-sm text-gray-500">Keep disabled until the product, backend verification and Internal testing are configured. The global server switch also controls checkout availability.</p>
    {message && <p role="status" className="text-sm">{message}</p>}
    {!loaded && <button type="button" onClick={() => setRevision(x => x + 1)}>Retry load</button>}
    <button type="button" disabled={!loaded || busy} onClick={() => void save()} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save Google Play mapping'}</button>
  </section>;
}
