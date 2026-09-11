import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { HomepageSettings } from '../types';
import { Plus, Trash2, Save, Sparkles, PlusCircle, User, Upload, ArrowUp, ArrowDown } from 'lucide-react';

export default function HomepageCMS() {
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [testimonials, setTestimonials] = useState<{ name: string; role: string; text: string }[]>([]);
  const [faculties, setFaculties] = useState<{ name: string; role: string; bio: string; imageUrl?: string }[]>([]);
  const [showHero, setShowHero] = useState(true);
  const [showFaculty, setShowFaculty] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [showFaq, setShowFaq] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchHomepageSettings();
  }, []);

  const fetchHomepageSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('*')
        .eq('id', 'mppsc_homepage')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setHeroTitle(data.hero_title || '');
        setHeroSubtitle(data.hero_subtitle || '');
        setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
        setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
        setFaculties(Array.isArray(data.faculties) ? data.faculties : []);
        setShowHero(data.show_hero !== false);
        setShowFaq(data.show_faq !== false);
        setShowTestimonials(data.show_testimonials !== false);
        setShowFaculty(data.show_faculty !== false);
      } else {
        // Defaults
        setHeroTitle('Design your future with C50 Academy');
        setHeroSubtitle('Access premium lectures, complete syllabus tracking, and study notes.');
        setFaqs([]);
        setTestimonials([]);
        setFaculties([]);
        setShowHero(true);
        setShowFaq(true);
        setShowTestimonials(true);
        setShowFaculty(true);
      }
    } catch (err) {
      console.error('Failed to load homepage settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleUpdateFaq = (index: number, key: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index][key] = value;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleAddTestimonial = () => {
    setTestimonials([...testimonials, { name: '', role: '', text: '' }]);
  };

  const handleUpdateTestimonial = (index: number, key: 'name' | 'role' | 'text', value: string) => {
    const updated = [...testimonials];
    updated[index][key] = value;
    setTestimonials(updated);
  };

  const handleRemoveTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  const handleAddFaculty = () => {
    setFaculties([...faculties, { name: '', role: '', bio: '', imageUrl: '' }]);
  };

  const handleUpdateFaculty = (index: number, key: 'name' | 'role' | 'bio' | 'imageUrl', value: string) => {
    const updated = [...faculties];
    updated[index][key] = value;
    setFaculties(updated);
  };

  const handleDeleteImageFromStorage = async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName && imageUrl.includes('supabase')) {
        await supabase.storage.from('thumbnails').remove([fileName]);
      }
    } catch (err) {
      console.error('Failed to delete image from storage:', err);
    }
  };

  const handleRemoveFaculty = (index: number) => {
    const faculty = faculties[index];
    if (faculty.imageUrl) {
      handleDeleteImageFromStorage(faculty.imageUrl);
    }
    setFaculties(faculties.filter((_, i) => i !== index));
  };

  const handleUploadImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `faculty_${Date.now()}_${index}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to public 'thumbnails' bucket
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath);

      handleUpdateFaculty(index, 'imageUrl', publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Upload failed: ' + error.message);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = faculties[index].imageUrl;
    if (!imageUrl) return;
    await handleDeleteImageFromStorage(imageUrl);
    handleUpdateFaculty(index, 'imageUrl', '');
  };

  const handleMoveFaculty = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === faculties.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...faculties];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFaculties(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');

    try {
      const { error } = await supabase
        .from('homepage_settings')
        .upsert({
          id: 'mppsc_homepage',
          hero_title: heroTitle.trim(),
          hero_subtitle: heroSubtitle.trim(),
          faqs: faqs.filter(f => f.question.trim() && f.answer.trim()),
          testimonials: testimonials.filter(t => t.name.trim() && t.text.trim()),
          faculties: faculties.filter(f => f.name.trim() && f.role.trim()),
          show_hero: showHero,
          show_faq: showFaq,
          show_testimonials: showTestimonials,
          show_faculty: showFaculty,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setMsg('Homepage configurations updated successfully.');
    } catch (err: any) {
      console.error(err);
      setMsg('Error saving configurations: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Homepage CMS</h1>
          <p className="text-gray-500 text-sm mt-1">Manage landing hero sections, FAQs, and testimonials</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold rounded-2xl text-sm shadow-md transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl border text-xs ${msg.includes('Error') ? 'bg-red-50 border-red-100 text-red-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
          {msg}
        </div>
      )}

      {/* Homepage Sections Management */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          ⚙️ Homepage Sections Management
        </h2>
        <p className="text-xs text-gray-500">Enable or disable (add/remove) sections on the student landing page dynamically</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-2.5 p-3.5 border border-gray-100 rounded-2xl bg-gray-50/20 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showHero}
              onChange={(e) => setShowHero(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900">Hero Section</p>
              <p className="text-[10px] text-gray-400">Header title & intro</p>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3.5 border border-gray-100 rounded-2xl bg-gray-50/20 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showFaculty}
              onChange={(e) => setShowFaculty(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900">Elite Faculty</p>
              <p className="text-[10px] text-gray-400">Mentors & profiles</p>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3.5 border border-gray-100 rounded-2xl bg-gray-50/20 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showTestimonials}
              onChange={(e) => setShowTestimonials(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900">Testimonials</p>
              <p className="text-[10px] text-gray-400">Student reviews</p>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3.5 border border-gray-100 rounded-2xl bg-gray-50/20 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showFaq}
              onChange={(e) => setShowFaq(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900">FAQs</p>
              <p className="text-[10px] text-gray-400">Frequently Asked Questions</p>
            </div>
          </label>
        </div>
      </div>

      {/* Hero settings */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" /> Hero Section
        </h2>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Title</label>
          <input
            type="text"
            className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:bg-white"
            placeholder="e.g. Design your future with C50 Academy"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Subtitle</label>
          <textarea
            rows={2}
            className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
            placeholder="Access premium lectures, complete syllabus tracking..."
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
          />
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Student Reviews & Testimonials</h2>
          <button
            onClick={handleAddTestimonial}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Testimonial
          </button>
        </div>
        <div className="space-y-4">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-4 border border-gray-100 rounded-2xl space-y-3 relative bg-gray-50/10">
              <button
                onClick={() => handleRemoveTestimonial(idx)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-4 mr-8">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Student Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                    value={t.name}
                    onChange={(e) => handleUpdateTestimonial(idx, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Role/Achievement</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                    placeholder="e.g. Selected as Deputy Collector"
                    value={t.role}
                    onChange={(e) => handleUpdateTestimonial(idx, 'role', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Review Content</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                  value={t.text}
                  onChange={(e) => handleUpdateTestimonial(idx, 'text', e.target.value)}
                />
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No reviews configured.</p>
          )}
        </div>
      </div>

      {/* Faculty Members & Mentors */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">Faculty Members & Mentors</h2>
            <p className="text-xs text-gray-400">Manage instructors displayed in the "Our Elite Faculty" section</p>
          </div>
          <button
            onClick={handleAddFaculty}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Faculty
          </button>
        </div>
        <div className="space-y-6">
          {faculties.map((f, idx) => (
            <div key={idx} className="p-4 border border-gray-100 rounded-2xl space-y-4 relative bg-gray-50/10">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveFaculty(idx, 'up')}
                  disabled={idx === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveFaculty(idx, 'down')}
                  disabled={idx === faculties.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveFaculty(idx)}
                  className="text-red-500 hover:text-red-700 cursor-pointer ml-1"
                  title="Delete Faculty"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start mr-20">
                {/* Faculty Photo Section */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                    {f.imageUrl ? (
                      <img src={f.imageUrl} alt={f.name || 'Faculty'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-[10px] font-bold text-gray-700 cursor-pointer shadow-sm">
                      <Upload className="w-3 h-3" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadImage(idx, e)}
                      />
                    </label>
                    {f.imageUrl && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-[9px] text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Faculty Details Fields */}
                <div className="flex-1 w-full space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Faculty Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mr. Prathvish Singh"
                        className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                        value={f.name}
                        onChange={(e) => handleUpdateFaculty(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Role / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. MP History & General Studies Lead"
                        className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                        value={f.role}
                        onChange={(e) => handleUpdateFaculty(idx, 'role', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Biography & Credentials</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Ph.D. with 15+ years of experience training civil services aspirants."
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                      value={f.bio}
                      onChange={(e) => handleUpdateFaculty(idx, 'bio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {faculties.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No faculty members configured.</p>
          )}
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Frequently Asked Questions (FAQ)</h2>
          <button
            onClick={handleAddFaq}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add FAQ
          </button>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 border border-gray-100 rounded-2xl space-y-3 relative bg-gray-50/10">
              <button
                onClick={() => handleRemoveFaq(idx)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="mr-8 space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Question</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Answer</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          {faqs.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No FAQs configured.</p>
          )}
        </div>
      </div>
    </div>
  );
}
