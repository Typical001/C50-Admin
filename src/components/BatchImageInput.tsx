import { useId, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled: boolean;
  onBusy: (busy: boolean) => void;
};
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export default function BatchImageInput({ label, value, onChange, disabled, onBusy }: Props) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const upload = async (file: File) => {
    if (busy || disabled) return;
    setBusy(true); onBusy(true); setMessage('');
    try {
      const extension = extensions[file.type];
      if (!extension || file.size === 0 || file.size > 5 * 1024 * 1024) {
        throw new Error('Choose a JPG, PNG or WebP image, up to 5 MB.');
      }
      const bitmap = await createImageBitmap(file);
      const valid = bitmap.width > 0 && bitmap.height > 0 && bitmap.width <= 10000 && bitmap.height <= 10000;
      bitmap.close();
      if (!valid) throw new Error('Image dimensions must not exceed 10,000 pixels per side.');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Please sign in again.');
      const { data: profile, error: roleError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (roleError || profile?.role !== 'admin') throw new Error('Only administrators can upload images.');
      const path = 'admin/batches/' + user.id + '/' + crypto.randomUUID() + '.' + extension;
      const { error } = await supabase.storage.from('thumbnails').upload(path, file, {
        contentType: file.type, cacheControl: '3600', upsert: false,
      });
      if (error) throw error;
      const current = await supabase.auth.getUser();
      if (current.data.user?.id !== user.id) throw new Error('Account changed. Reopen the batch editor.');
      const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
      onChange(data.publicUrl);
      setMessage('Uploaded. Save the batch to publish this image.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally { setBusy(false); onBusy(false); }
  };
  return <div className="space-y-2">
    <label htmlFor={id} className="block text-xs font-semibold text-gray-500">{label} URL</label>
    <input id={id} type="url" pattern="https://.*" value={value} disabled={disabled || busy}
      onChange={event => { onChange(event.target.value); setMessage(''); }}
      placeholder="https://..." className="w-full rounded-xl border p-2 text-sm" />
    <label className="block rounded-xl border border-dashed p-3 text-sm text-indigo-700">
      {busy ? 'Uploading…' : 'Or upload from your device'}
      <input type="file" aria-label={'Upload ' + label.toLowerCase()} accept="image/jpeg,image/png,image/webp"
        disabled={disabled || busy} className="mt-2 block w-full text-xs"
        onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void upload(file); }} />
    </label>
    <p className="text-xs text-gray-500">JPG, PNG or WebP · Maximum 5 MB. Existing images are not deleted when replaced.</p>
    {message && <p role="status" aria-live="polite" className="text-xs text-indigo-700">{message}</p>}
    {value.startsWith('https://') && <img src={value} alt={label + ' preview'} className="h-28 w-full rounded-xl object-cover" />}
  </div>;
}
