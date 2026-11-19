import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Payment = {
  google_order_total: number | null; google_order_currency: string | null; google_order_state: string | null; payment_gateway: string; google_is_test: boolean | null; id: string; user_id: string; batch_id: string; amount: number; amount_paise: number | null;
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
  const [working, setWorking] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const actionLock = useRef(false);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const ticket = ++generation.current;
    setLoading(true); setError('');
    try {
      // RLS authorizes this read. Never request signatures, provider payloads or credentials.
      let query = supabase.from('payments').select(
        'google_order_total,google_order_currency,google_order_state,payment_gateway,google_is_test,id,user_id,batch_id,amount,amount_paise,currency,status,gateway_mode,razorpay_order_id,razorpay_payment_id,verified_at,created_at,payment_method,gateway_order_id,gateway_payment_id,failure_code',
        { count: 'exact' },
      ).order('created_at', { ascending: false }).order('id', { ascending: false });
      if (status) query = query.eq('status', status);
      if (mode) query = query.or(`gateway_mode.eq.${mode},and(payment_gateway.eq.google_play,google_is_test.eq.${mode === 'test'})`);
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
  async function manage(row: Payment, action: 'reconcile' | 'close-test') {
    if (actionLock.current) return;
    if (action === 'close-test' && !window.confirm(
      `Check receipt ${row.id} in Razorpay Test mode first. Have you confirmed there is no payment? Closing records this attempt as failed and keeps its history.`
    )) return;
    actionLock.current = true;
    setWorking(row.id); setFeedback('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sign in again to manage payments.');
      const base = (import.meta.env.VITE_API_URL || 'https://c50-web.onrender.com').replace(/\/$/, '');
      const response = await fetch(`${base}/api/admin/payments/${row.id}/${action}`, {
        method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'close-test' ? { confirmedNoTestPayment: true } : {}),
        signal: AbortSignal.timeout(45000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Payment update failed.');
      setFeedback(result.status === 'pending' ? 'Still pending. Razorpay has no verified capture for this receipt.' :
        action === 'close-test' ? 'Test attempt closed and recorded as failed.' : `Verified status: ${result.status}.`);
    } catch (e) { setFeedback(e instanceof Error ? e.message : 'Unable to check payment.'); }
    finally { await refresh(); actionLock.current = false; setWorking(null); }
  }
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
      {feedback && <p role="status">{feedback}</p>}
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
        <table className="w-full text-sm text-left"><thead className="bg-gray-50"><tr>
          {['Customer / purchase', 'Batch / test series', 'Amount', 'Status / mode', 'Provider references', 'Created / verified', 'Manage'].map(label => <th key={label} className="p-4">{label}</th>)}
        </tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-gray-100 align-top">
          <td className="p-4">{names[row.user_id] || row.user_id}<div className="text-xs text-gray-500 break-all">{row.id}</div></td>
          <td className="p-4">{titles[row.batch_id] || row.batch_id}</td>
          <td className="p-4 whitespace-nowrap">{row.payment_gateway === 'google_play' ? (row.google_order_total == null ? 'Total pending verification' : `${row.google_order_currency} ${Number(row.google_order_total).toFixed(2)}`) : `${row.currency || 'INR'} ${((row.amount_paise ?? Math.round(Number(row.amount) * 100)) / 100).toFixed(2)}`}<div className="text-xs text-gray-500">{row.payment_method || '—'}</div></td>
          <td className="p-4">{row.status}<div className="font-semibold">{row.payment_gateway === 'google_play' ? (row.google_is_test ? 'Google Play · Test' : 'Google Play · Live') : row.gateway_mode || 'Legacy / unknown'}</div><div className="text-xs text-gray-500">{row.google_order_state || row.failure_code}</div></td>
          <td className="p-4 text-xs break-all">{row.razorpay_order_id || row.gateway_order_id || 'No order attached'}<div>{row.razorpay_payment_id || row.gateway_payment_id || 'No captured payment recorded'}</div></td>
          <td className="p-4 text-xs whitespace-nowrap">{date(row.created_at)}<div>Verified: {date(row.verified_at)}</div></td>
          <td className="p-4">{row.status === 'pending' && row.payment_gateway === 'razorpay' && <div className="grid gap-2">
            <button disabled={!!working} className="text-indigo-700 underline" onClick={() => void manage(row, 'reconcile')}>{working === row.id ? 'Checking…' : 'Check with Razorpay'}</button>
            {row.gateway_mode === 'test' && !row.verified_at && !row.gateway_order_id && !row.gateway_payment_id &&
              !row.razorpay_order_id && !row.razorpay_payment_id && Date.parse(row.created_at) < Date.now() - 86400000 &&
              <button disabled={!!working} className="text-gray-700 underline" onClick={() => void manage(row, 'close-test')}>Close test attempt</button>}
          </div>}</td>
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
