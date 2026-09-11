import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Batch } from '../types';
import BatchImageInput from './BatchImageInput';
import PaymentButtonTest from './PaymentButtonTest';
import BatchOverviewEditor from './BatchOverviewEditor';
import { batchOverview } from '../lib/batchOverview';
import { Plus, Pencil, Trash2, X, AlertCircle, BookOpen } from 'lucide-react';

interface BatchesCMSProps {
  onManageSyllabus?: (batchId: string) => void;
}

export default function BatchesCMS({ onManageSyllabus }: BatchesCMSProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [duration, setDuration] = useState('6 Months');
  const [language, setLanguage] = useState('Hindi/English');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [buttonId, setButtonId] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [overview, setOverview] = useState(() => batchOverview(null));

  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((b: any) => ({
        id: b.id,
        overviewContent: b.overview_content,
        rating: b.rating,
        title: b.title,
        description: b.description,
        instructor: b.instructor || 'Mr. Prathvish Singh',
        price: Number(b.price) || 0,
        discountPrice: Number(b.discount_price || b.price) || 0,
        duration: b.duration || '12 Months',
        totalLectures: Number(b.total_lectures || 0),
        notesCount: Number(b.notes_count || 0),
        language: b.language || 'Hindi/English',
        difficulty: b.difficulty || 'Intermediate',
        tags: Array.isArray(b.tags) ? b.tags : ['MPPSC'],
        category: b.category || 'MPPSC',
        enrollmentCount: Number(b.enrollment_count || 0),
        bannerUrl: b.banner_url || '',
        thumbnailUrl: b.thumbnail_url || '',
        lastUpdated: b.last_updated || b.created_at,
        isFree: Boolean(b.is_free),
        isPaid: Boolean(b.is_paid),
        paymentEnabled: Boolean(b.payment_enabled),
        razorpayPaymentButtonId: b.razorpay_payment_button_id || '',
        customTag: b.custom_tag || ''
      }));

      setBatches(mapped);
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditBatch(null);
    setOverview(batchOverview(null, { duration: '6 Months', total_lectures: 0 }));
    setTitle('');
    setDescription('');
    setInstructor('Mr. Prathvish Singh');
    setPrice('5000');
    setDiscountPrice('2499');
    setDuration('6 Months');
    setLanguage('Hindi/English');
    setDifficulty('Beginner');
    setThumbnailUrl('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400');
    setBannerUrl('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200');
    setIsFree(false);
    setPaymentEnabled(false);
    setButtonId('');
    setCustomTag('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (batch: Batch) => {
    setEditBatch(batch);
    setOverview(batchOverview(batch.overviewContent, { duration: batch.duration, total_lectures: batch.totalLectures, rating: batch.rating }));
    setTitle(batch.title);
    setDescription(batch.description);
    setInstructor(batch.instructor);
    setPrice(batch.price.toString());
    setDiscountPrice(batch.discountPrice.toString());
    setDuration(batch.duration);
    setLanguage(batch.language);
    setDifficulty(batch.difficulty);
    setThumbnailUrl(batch.thumbnailUrl);
    setBannerUrl(batch.bannerUrl);
    setIsFree(batch.isFree);
    setPaymentEnabled(Boolean(batch.paymentEnabled));
    setButtonId(batch.razorpayPaymentButtonId || '');
    setCustomTag(batch.customTag || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;
    setSaving(true);
    setFormError('');

    if (!title || !description || !instructor) {
      setFormError('Title, Description, and Instructor are required fields.');
      setSaving(false);
      return;
    }

    if (!Number.isFinite(Number(price)) || !Number.isFinite(Number(discountPrice)) || Number(price) < 0 || Number(discountPrice) < 0 ||
      (paymentEnabled && (isFree || (Number(discountPrice) > 0 ? Number(discountPrice) : Number(price)) <= 0)) ||
      (buttonId.trim() && !/^pl_[A-Za-z0-9]+$/.test(buttonId.trim()))) {
      setFormError('Use a positive price for enabled payments and a valid pl_ button ID, not HTML or a link.');
      setSaving(false); return;
    }
    const dbPayload: any = {
      overview_content: overview,
      title: title.trim(),
      description: description.trim(),
      instructor: instructor.trim(),
      price: isFree ? 0 : Number(price) || 0,
      discount_price: isFree ? 0 : Number(discountPrice) > 0 ? Number(discountPrice) : null,
      payment_enabled: paymentEnabled,
      razorpay_payment_button_id: buttonId.trim() || null,
      duration,
      language,
      difficulty,
      thumbnail_url: thumbnailUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400',
      banner_url: bannerUrl.trim() || null,
      is_free: isFree,
      is_paid: !isFree,
      // Preserve archived/test-only state when editing an existing batch.
      ...(editBatch ? {} : { is_active: true }),
      category: 'MPPSC',
      custom_tag: customTag || null,
      tags: ['MPPSC']
    };

    try {
      if (editBatch) {
        // Update batch
        const { error } = await supabase
          .from('batches')
          .update(dbPayload)
          .eq('id', editBatch.id);

        if (error) throw error;
      } else {
        // Create batch
        const { error } = await supabase
          .from('batches')
          .insert([dbPayload]);

        if (error) throw error;
      }

      setModalOpen(false);
      fetchBatches();
    } catch (err: any) {
      console.error('Save batch error:', err);
      setFormError(err.message || 'Failed to save batch. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this batch? All subjects, chapters, and lectures inside it will be orphaned or deleted.')) return;

    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBatches();
    } catch (err: any) {
      console.error('Delete batch error:', err);
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">MPPSC Batches</h1>
          <p className="text-gray-500 text-sm mt-1">Manage active prep programs and enrollment pricing</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-2xl text-sm shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Batch
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900">No batches available</h3>
          <p className="text-xs text-gray-400 mt-1">Start by creating your first MPPSC course batch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <img
                  src={batch.thumbnailUrl || batch.thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80'}
                  alt={batch.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-6">
                  <div className="flex gap-2 mb-2">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">MPPSC</span>
                    {batch.isFree || (batch.price === 0) ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Free</span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Paid</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight mb-2">{batch.title}</h3>
                  <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">{batch.description}</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Price</span>
                  <span className="font-extrabold text-gray-900 text-lg">
                    {batch.isFree || batch.price === 0 ? 'Free' : `₹${batch.price}`}
                  </span>
                </div>
                 <div className="flex gap-1.5 items-center">
                  {onManageSyllabus && (
                    <button
                      onClick={() => onManageSyllabus(batch.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                      title="Manage Batch Content"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Content
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(batch)}
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors cursor-pointer"
                    title="Edit Batch"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(batch.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                    title="Delete Batch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editBatch ? 'Edit Batch details' : 'Create New Batch'}
              </h2>
              <button
                disabled={saving || uploading}
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Batch Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MPPSC Mains Answer Writing Revision"
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 focus:border-indigo-500 rounded-xl text-sm focus:outline-none focus:bg-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide batch details, timeline, and topics covered..."
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 focus:border-indigo-500 rounded-xl text-sm focus:outline-none focus:bg-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <BatchImageInput label="Thumbnail image" value={thumbnailUrl} onChange={setThumbnailUrl} disabled={saving || uploading} onBusy={setUploading} />
              <BatchImageInput label="Banner image" value={bannerUrl} onChange={setBannerUrl} disabled={saving || uploading} onBusy={setUploading} />
              <p className="text-xs text-gray-500">The Android overview uses the banner; clear its URL to use the thumbnail instead.</p>
              <label className="block text-xs font-semibold text-gray-500">Batch tag (optional)
                <input value={customTag} onChange={e => setCustomTag(e.target.value)} maxLength={100} className="mt-1 w-full rounded-xl border p-2" />
              </label>
              <BatchOverviewEditor value={overview} onChange={setOverview} />

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isFree"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={!isFree}
                  onChange={(e) => { setIsFree(!e.target.checked); if (!e.target.checked) setPaymentEnabled(false); }}
                />
                <label htmlFor="isFree" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Paid Batch (uncheck for free enrollment)
                </label>
              </div>

              <div className="space-y-3 rounded-xl bg-indigo-50 p-4">
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" disabled={isFree} checked={paymentEnabled} onChange={e => setPaymentEnabled(e.target.checked)} /> Payment Enabled</label>
                <label className="block text-xs font-semibold">Razorpay Payment Button ID (optional reference)
                  <input value={buttonId} onChange={e => setButtonId(e.target.value)} placeholder="pl_xxxxx" className="mt-1 w-full rounded-lg border bg-white p-2" />
                </label>
                <p className="text-xs text-gray-600">Student purchases use verified Orders + Checkout, not this static button. Enable payments only after deployment and test-mode verification.</p>
              </div>
              {!isFree && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="5000"
                      className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 focus:border-indigo-500 rounded-xl text-sm focus:outline-none focus:bg-white"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Discount Price (₹)</label>
                    <input
                      type="number"
                      placeholder="2499"
                      className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 focus:border-indigo-500 rounded-xl text-sm focus:outline-none focus:bg-white"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold rounded-2xl text-sm shadow-md transition-colors cursor-pointer"
              >
                {uploading ? 'Uploading image...' : saving ? 'Saving...' : editBatch ? 'Update Batch Details' : 'Create Batch'}
              </button>
            </form>
            {editBatch && !isFree && (Number(discountPrice) > 0 ? Number(discountPrice) : Number(price)) === 1000 &&
              <PaymentButtonTest key={editBatch.id + buttonId} buttonId={buttonId.trim()} />}
          </div>
        </div>
      )}
    </div>
  );
}
