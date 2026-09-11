import { useEffect, useRef, useState } from 'react';

// Isolated admin-only test surface. Never invokes C50 payment/enrollment APIs.
export default function PaymentButtonTest({ buttonId }: { buttonId: string }) {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!import.meta.env.DEV || !confirmed || !host.current || buttonId !== 'pl_TYDEnuuLchDM7E') return;
    const form = document.createElement('form');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', buttonId); script.async = true;
    script.onerror = () => setError('The official button could not load.');
    form.appendChild(script); host.current.appendChild(form);
    return () => { form.remove(); };
  }, [confirmed, buttonId]);
  if (!import.meta.env.DEV || buttonId !== 'pl_TYDEnuuLchDM7E') return null;
  return <aside className="mt-6 space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
    <h3 className="font-bold">₹1,000 official button test — development only</h3>
    <p className="text-sm">Payment test only — course access is not granted by this button.</p>
    <p className="text-xs">First confirm in Razorpay Dashboard that this exact button is in Test mode and charges ₹1,000. Do not use a live-mode button here.</p>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> I confirmed Test mode and ₹1,000 in Razorpay Dashboard.</label>
    {error && <p role="alert">{error}</p>}
    <div ref={host} />
  </aside>;
}
