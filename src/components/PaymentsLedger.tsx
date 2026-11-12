import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Payment = {
  id: string; user_id: string; batch_id: string; amount: number; amount_paise: number | null;
  currency: string | null; status: string; gateway_mode: string | null;
  razorpay_order_id: string | null; razorpay_payment_id: string | null;
  gateway_order_id: string | null; gateway_payment_id: string | null; failure_code: string | null;
  verified_at: string | null; created_at: string; payment_method: string | null;
};
const PAGE_SIZE = 50;
const date = (value: string | null) => value ? new Date(value).toLocaleString() : '—';

export default function PaymentsLedger() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const ticket = ++generation.current;
    setLoading(true); setError('');
    try {
      // RLS authorizes this read. Never request signatures, provider payloads or credentials.
      let query = supabase.from('payments').select(
        'id,user_id,batch_id,amount,amount_paise,currency,status,gateway_mode,razorpay_order_id,razorpay_payment_id,verified_at,created_at,payment_method,gateway_order_id,gateway_payment_id,failure_code',
        { count: 'exact' },
      ).order('created_at', { ascending: false }).order('id', { ascending: false });
      if (status) query = query.eq('status', status);
      if (mode) query = query.eq('gateway_mode', mode);
      const result = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (result.error) throw result.error;
      const payments = (result.data || []) as Payment[];
      const userIds = [...new Set(payments.map(row => row.user_id))];
      const batchIds = [...new Set(payments.map(row => row.batch_id))];
      const [users, batches] = await Promise.all([
        userIds.length ? supabase.from('profiles').select('id,name').in('id', userIds) : Promise.resolve({ data: [], error: null }),
        batchIds.length ? supabase.from('batches').select('id,title').in('id', batchIds) : Promise.resolve({ data: [], error: null }),
      ]);
      if (users.error || batches.error) throw users.error || batches.error;
      if (ticket !== generation.current) return;
      setRows(payments); setCount(result.count || 0);
      setNames(Object.fromEntries((users.data || []).map(user => [user.id, user.name])));
      setTitles(Object.fromEntries((batches.data || []).map(batch => [batch.id, batch.title])));
    } catch {
      if (ticket !== generation.current) return;
      setRows([]); setCount(0); setError('Unable to load payments. Check your administrator session and retry.');
    } finally { if (ticket === generation.current) setLoading(false); }
  }, [page, status, mode]);
  useEffect(() => {
    void refresh();
    const visibleRefresh = () => { if (document.visibilityState === 'visible') void refresh(); };
    const timer = setInterval(visibleRefresh, 30000);
    window.addEventListener('focus', visibleRefresh);
    return () => { generation.current++; clearInterval(timer); window.removeEventListener('focus', visibleRefresh); };
  }, [refresh]);
  return (
    <section className="space-y-6 min-w-0">
      <div><h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-2">Shared website and Android purchase records. Test payments are labelled; pending payments do not grant access. Refreshes every 30 seconds.</p></div>
      <div className="flex flex-wrap gap-3 items-center">
        <select aria-label="Payment status" value={status} onChange={event => { setStatus(event.target.value); setPage(0); }} className="border rounded-lg p-2">
          <option value="">All statuses</option>{['pending', 'success', 'failed', 'refunded'].map(value => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Gateway mode" value={mode} onChange={event => { setMode(event.target.value); setPage(0); }} className="border rounded-lg p-2">
          <option value="">All modes</option><option value="test">Test</option><option value="live">Live</option>
        </select>
        <button disabled={loading} onClick={() => void refresh()} className="bg-indigo-600 text-white rounded-lg px-4 py-2 disabled:opacity-50">{loading ? 'Loading…' : 'Refresh'}</button>
        <span className="text-sm text-gray-500">{count} records</span>
      </div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
        <table className="w-full text-sm text-left"><thead className="bg-gray-50"><tr>
          {['Customer / purchase', 'Batch / test series', 'Amount', 'Status / mode', 'Provider references', 'Created / verified'].map(label => <th key={label} className="p-4">{label}</th>)}
        </tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-gray-100 align-top">
          <td className="p-4">{names[row.user_id] || row.user_id}<div className="text-xs text-gray-500 break-all">{row.id}</div></td>
          <td className="p-4">{titles[row.batch_id] || row.batch_id}</td>
          <td className="p-4 whitespace-nowrap">{row.currency || 'INR'} {((row.amount_paise ?? Math.round(Number(row.amount) * 100)) / 100).toFixed(2)}<div className="text-xs text-gray-500">{row.payment_method || '—'}</div></td>
          <td className="p-4">{row.status}<div className="font-semibold">{row.gateway_mode || 'Legacy / unknown'}</div><div className="text-xs text-gray-500">{row.failure_code}</div></td>
          <td className="p-4 text-xs break-all">{row.razorpay_order_id || row.gateway_order_id || 'No order attached'}<div>{row.razorpay_payment_id || row.gateway_payment_id || 'No captured payment recorded'}</div></td>
          <td className="p-4 text-xs whitespace-nowrap">{date(row.created_at)}<div>Verified: {date(row.verified_at)}</div></td>
        </tr>)}</tbody></table>
        {!loading && !error && !rows.length && <p className="p-6 text-gray-500">No payments match these filters.</p>}
      </div>
      <div className="flex gap-4 items-center">
        <button disabled={loading || page === 0} onClick={() => setPage(value => value - 1)} className="border rounded-lg px-4 py-2 disabled:opacity-50">Previous</button>
        <span>Page {page + 1}</span>
        <button disabled={loading || (page + 1) * PAGE_SIZE >= count} onClick={() => setPage(value => value + 1)} className="border rounded-lg px-4 py-2 disabled:opacity-50">Next</button>
      </div>
    </section>
  );
}
