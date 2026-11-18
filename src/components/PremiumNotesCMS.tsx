import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { type NoteProduct, type NoteRequest, notesPrice } from '../lib/premiumNotes';

const blank = { title: '', description: '', contents: '', kind: 'note' as const, price_paise: 100, cover_url: '', checkout_url: '', delivery_instructions: '', published: false, sort_order: 0 };
const labels = { title: 'Title', description: 'Description', contents: 'Included notes / bundle contents', cover_url: 'Cover image HTTPS URL (optional)', checkout_url: 'External checkout / Google Form HTTPS URL', delivery_instructions: 'Delivery instructions after purchase' };
const field = 'w-full rounded-xl border border-gray-300 p-3';
const button = 'rounded-xl bg-indigo-600 text-white px-4 py-2 disabled:opacity-50';
async function api(path: string, method = 'GET', body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in again.');
  const base = (import.meta.env.VITE_API_URL || 'https://c50-web.onrender.com').replace(/\/$/, '');
  const response = await fetch(base + path, { method, headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
  const result = await response.json();
  const latest = await supabase.auth.getSession();
  if (latest.data.session?.user.id !== session.user.id) throw new Error('Account changed.');
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}
export default function PremiumNotesCMS() {
  const [products, setProducts] = useState<NoteProduct[]>([]);
  const [editing, setEditing] = useState<Partial<NoteProduct> | null>(null);
  const [rows, setRows] = useState<NoteRequest[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [count, setCount] = useState(0), [page, setPage] = useState(0), [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [review, setReview] = useState<NoteRequest | null>(null), [reason, setReason] = useState('');
  const [history, setHistory] = useState<Array<{ id: string; status: string; delivery_status: string; reason: string; created_at: string; actor_id: string }>>([]);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [loaded, setLoaded] = useState(false);
  const ticket = useRef(0);
  const load = useCallback(async () => {
    const t = ++ticket.current; setBusy(true); setLoaded(false); setError('');
    try {
      const [p, r] = await Promise.all([api('/api/admin/premium-notes'), api(`/api/admin/premium-note-requests?page=${page}&status=${status}`)]);
      if (t !== ticket.current) return;
      setProducts(p); setRows(r.rows); setEmails(r.emails); setCount(r.count); setLoaded(true);
    } catch (e) { if (t === ticket.current) setError((e as Error).message); }
    finally { if (t === ticket.current) setBusy(false); }
  }, [page, status]);
  useEffect(() => { const generation = ticket; void load(); return () => { generation.current++; }; }, [load]);
  const save = async () => {
    if (!editing || !loaded || busy) return;
    for (const value of [editing.checkout_url, editing.cover_url]) {
      if (!value) continue;
      try { const url = new URL(value); if (url.protocol !== 'https:' || url.username || url.password || /[\s\\]/.test(value)) throw new Error(); }
      catch { setError('Use valid HTTPS links without embedded credentials.'); return; }
    }
    setBusy(true); setError('');
    try {
      const saved = await api('/api/admin/premium-notes' + (editing.id ? '/' + editing.id : ''), editing.id ? 'PUT' : 'POST', editing);
      setEditing(saved); await load();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const decide = async () => {
    if (!review || !reason.trim() || busy || !loaded) return;
    setBusy(true); setError('');
    try { await api('/api/admin/premium-note-requests/' + review.id, 'POST', { ...review, reason }); setReview(null); setReason(''); await load(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const openReview = async (r: NoteRequest) => {
    setReview(r); setReason(''); setHistory([]); setError(''); setBusy(true);
    try { setHistory(await api(`/api/admin/premium-note-requests/${r.id}/history`)); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return <section className="space-y-6 max-w-5xl">
    <h1 className="text-3xl font-bold">Premium Notes</h1>
    <p>Configure individual PDFs or bundles and the external checkout / Google Form URL. Verify actual payments before approval. Forms are reviewed separately; C50 does not import submissions or payment proof.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="flex gap-3"><button className={button} disabled={busy} onClick={() => { setEditing(null); setReview(null); void load(); }}>Reload</button><button className={button} disabled={!loaded || busy} onClick={() => setEditing({ ...blank })}>Add notes / bundle</button></div>
    {busy && <p role="status">Working…</p>}
    <div className="grid md:grid-cols-2 gap-3">{products.map(p => <button className="text-left border rounded-xl bg-white p-4" key={p.id} disabled={busy} onClick={() => setEditing({ ...p })}><strong>{p.title}</strong><p>{notesPrice(p.price_paise)} · {p.published ? 'Published' : 'Hidden / archived'}</p></button>)}</div>
    {loaded && !products.length && <p>No Premium Notes listings yet.</p>}
    {editing && <form className="bg-white border rounded-2xl p-5 space-y-4" onSubmit={e => { e.preventDefault(); void save(); }}>
      <h2 className="text-xl font-bold">{editing.id ? 'Edit listing' : 'New listing'}</h2>
      {(['title', 'description', 'contents', 'cover_url', 'checkout_url', 'delivery_instructions'] as const).map(k => <label className="block" key={k}>{labels[k]}<textarea aria-label={labels[k]} className={field} required={k === 'title' || k === 'description' || (k === 'checkout_url' && editing.published)} value={editing[k] || ''} onChange={e => setEditing({ ...editing, [k]: e.target.value })} /></label>)}
      <p className="text-sm text-gray-600">Use HTTPS links without passwords or embedded credentials. In the form, request the C50 account email and request reference. Never request passwords, CVV or payment PINs.</p>
      <label className="block">Type<select className={field} value={editing.kind} onChange={e => setEditing({ ...editing, kind: e.target.value as NoteProduct['kind'] })}><option value="note">Individual PDF</option><option value="bundle">PDF bundle</option></select></label>
      <label className="block">Price (INR)<input className={field} type="number" min="1" max="1000000" step="0.01" required value={(editing.price_paise || 0) / 100} onChange={e => setEditing({ ...editing, price_paise: Math.round(Number(e.target.value) * 100) })} /></label>
      <label className="block">Display order<input className={field} type="number" min="-100000" max="100000" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></label>
      <label className="block"><input type="checkbox" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} /> Published (uncheck to archive; existing records remain)</label>
      <button className={button} disabled={busy || !loaded}>Save listing</button> <button type="button" onClick={() => setEditing(null)}>Close</button>
    </form>}
    <h2 className="text-2xl font-bold">Purchase verification requests</h2>
    <label>Status <select value={status} onChange={e => { setPage(0); setStatus(e.target.value); }}><option value="">All</option><option value="pending">Pending</option><option value="purchased">Purchased</option><option value="rejected">Rejected</option></select></label>
    <label className="block">Search this page by customer email, notes or reference<input className={field} type="search" value={search} onChange={e => setSearch(e.target.value)} /></label>
    {rows.filter(r => [emails[r.user_id || ''], r.user_id, r.title_snapshot, r.id].some(v => v?.toLowerCase().includes(search.toLowerCase().trim()))).map(r => <article className="border rounded-xl bg-white p-4 break-words" key={r.id}><strong>{r.title_snapshot}</strong><p>{emails[r.user_id || ''] || r.user_id} · {notesPrice(r.price_paise)}</p><p>{r.status} · Delivery: {r.delivery_status} · {new Date(r.created_at).toLocaleString()}</p><p className="text-xs">Reference: {r.id}</p><button className={button} disabled={busy || !loaded} onClick={() => void openReview(r)}>Review / history</button></article>)}
    {loaded && !rows.length && <p>No requests in this category.</p>}
    <div className="flex gap-4"><button disabled={page === 0 || busy} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page + 1} · {count} requests</span><button disabled={(page + 1) * 50 >= count || busy} onClick={() => setPage(p => p + 1)}>Next</button></div>
    {review && <form className="bg-white border rounded-2xl p-5 space-y-4" onSubmit={e => { e.preventDefault(); void decide(); }}>
      <h3 className="font-bold">Review {review.title_snapshot}</h3><p>Match the customer and reference with the form submission and external payment records. Pending alone is not payment evidence.</p>
      <label className="block">Decision<select aria-label="Decision" className={field} value={review.status} onChange={e => setReview({ ...review, status: e.target.value as NoteRequest['status'], delivery_status: 'pending' })}><option value="pending">Pending</option><option value="purchased">Purchased</option><option value="rejected">Rejected</option></select></label>
      <label className="block">Delivery<select aria-label="Delivery" className={field} disabled={review.status !== 'purchased'} value={review.delivery_status} onChange={e => setReview({ ...review, delivery_status: e.target.value as NoteRequest['delivery_status'] })}><option value="pending">Pending</option><option value="delivered">Delivered</option></select></label>
      <label className="block">Internal verification / correction reason<textarea className={field} required maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} /></label>
      <button className={button} disabled={busy || !loaded}>Save decision</button> <button type="button" onClick={() => setReview(null)}>Close</button>
      <h4 className="font-bold">History</h4>{history.map(h => <p key={h.id}>{new Date(h.created_at).toLocaleString()} · {h.status} / {h.delivery_status} · {h.reason} · Actor: {h.actor_id || 'Deleted account'}</p>)}
    </form>}
  </section>;
}
