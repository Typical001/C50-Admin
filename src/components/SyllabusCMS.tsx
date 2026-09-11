import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Batch, Subject, Chapter, Lecture } from '../types';
import { Plus, Pencil, Trash2, Video, FileText, ChevronRight, ChevronDown, PlusCircle, X, Upload } from 'lucide-react';

const extractSrcFromIframe = (input: string): string => {
  const trimmed = input.trim();
  if (trimmed.startsWith('<iframe') || trimmed.includes('<iframe')) {
    const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  return trimmed;
};

export default function SyllabusCMS({ initialBatchId }: { initialBatchId?: string }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);

  // Selection states
  const [selectedSubjId, setSelectedSubjId] = useState('');
  const [selectedChapId, setSelectedChapId] = useState('');

  // Modals / forms
  const [activeModal, setActiveModal] = useState<'subject' | 'chapter' | 'lecture' | null>(null);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  // Subject form
  const [subjTitle, setSubjTitle] = useState('');
  const [subjDesc, setSubjDesc] = useState('');

  // Chapter form
  const [chapTitle, setChapTitle] = useState('');
  const [chapDesc, setChapDesc] = useState('');

  // Lecture form
  const [lecTitle, setLecTitle] = useState('');
  const [lecDesc, setLecDesc] = useState('');
  const [lecVideoUrl, setLecVideoUrl] = useState('');
  const [lecNotesTitle, setLecNotesTitle] = useState('');
  const [lecNotesUrl, setLecNotesUrl] = useState('');
  const [lecDuration, setLecDuration] = useState('45:00');

  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchSubjects(selectedBatchId);
      setSelectedSubjId('');
      setSelectedChapId('');
      setChapters([]);
      setLectures([]);
    }
  }, [selectedBatchId]);

  useEffect(() => {
    if (selectedSubjId) {
      fetchChapters(selectedSubjId);
      setSelectedChapId('');
      setLectures([]);
    }
  }, [selectedSubjId]);

  useEffect(() => {
    if (selectedChapId) {
      fetchLectures(selectedChapId);
    }
  }, [selectedChapId]);

  const fetchBatches = async () => {
    try {
      const { data } = await supabase.from('batches').select('*').order('title');
      setBatches(data || []);
      if (initialBatchId) {
        setSelectedBatchId(initialBatchId);
      } else if (data && data.length > 0 && !selectedBatchId) {
        setSelectedBatchId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (initialBatchId) {
      setSelectedBatchId(initialBatchId);
    }
  }, [initialBatchId]);

  const fetchSubjects = async (batchId: string) => {
    try {
      const { data } = await supabase.from('subjects').select('*').eq('batch_id', batchId).order('title');
      setSubjects(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChapters = async (subjId: string) => {
    try {
      const { data } = await supabase.from('chapters').select('*').eq('subject_id', subjId).order('title');
      setChapters(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLectures = async (chapId: string) => {
    try {
      const { data } = await supabase.from('lectures').select('*').eq('chapter_id', chapId).order('title');
      setLectures(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Add / Edit Subject
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjTitle || !selectedBatchId) return;

    const payload = {
      batch_id: selectedBatchId,
      title: subjTitle.trim(),
      description: subjDesc.trim(),
    };

    try {
      if (editTargetId) {
        await supabase.from('subjects').update(payload).eq('id', editTargetId);
      } else {
        await supabase.from('subjects').insert([payload]);
      }
      setActiveModal(null);
      fetchSubjects(selectedBatchId);
    } catch (err) {
      console.error(err);
    }
  };

  // Add / Edit Chapter
  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapTitle || !selectedSubjId) return;

    const payload = {
      subject_id: selectedSubjId,
      title: chapTitle.trim(),
      description: chapDesc.trim(),
    };

    try {
      if (editTargetId) {
        await supabase.from('chapters').update(payload).eq('id', editTargetId);
      } else {
        await supabase.from('chapters').insert([payload]);
      }
      setActiveModal(null);
      fetchChapters(selectedSubjId);
    } catch (err) {
      console.error(err);
    }
  };

  // Add / Edit Lecture
  const handleLectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecTitle || !lecVideoUrl || !selectedChapId) return;

    const parsedVideoUrl = extractSrcFromIframe(lecVideoUrl.trim());

    const payload = {
      chapter_id: selectedChapId,
      subject_id: selectedSubjId || null,
      batch_id: selectedBatchId || null,
      title: lecTitle.trim(),
      description: lecDesc.trim(),
      video_url: parsedVideoUrl,
      notes_title: lecNotesTitle.trim() || null,
      notes_url: lecNotesUrl.trim() || null,
      duration: lecDuration.trim()
    };

    try {
      let res;
      if (editTargetId) {
        res = await supabase.from('lectures').update(payload).eq('id', editTargetId);
      } else {
        res = await supabase.from('lectures').insert([payload]);
      }

      if (res.error) {
        console.error('Error saving lecture:', res.error);
        alert('Failed to save lecture: ' + res.error.message);
        return;
      }

      setActiveModal(null);
      fetchLectures(selectedChapId);
    } catch (err: any) {
      console.error(err);
      alert('An unexpected error occurred: ' + err.message);
    }
  };

  const handleUploadPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPdf(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `note_${Date.now()}.${fileExt}`;
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

      setLecNotesUrl(publicUrl);
      if (!lecNotesTitle) {
        setLecNotesTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (error: any) {
      console.error('Error uploading pdf note:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  // Delete Handlers
  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Delete subject and all nested contents?')) return;
    await supabase.from('subjects').delete().eq('id', id);
    fetchSubjects(selectedBatchId);
    setSelectedSubjId('');
  };

  const handleDeleteChapter = async (id: string) => {
    if (!window.confirm('Delete chapter and all lectures?')) return;
    await supabase.from('chapters').delete().eq('id', id);
    fetchChapters(selectedSubjId);
    setSelectedChapId('');
  };

  const handleDeleteLecture = async (id: string) => {
    if (!window.confirm('Delete this lecture?')) return;
    await supabase.from('lectures').delete().eq('id', id);
    fetchLectures(selectedChapId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Syllabus & CMS</h1>
        <p className="text-gray-500 text-sm mt-1">Structure subjects, chapters, and lectures inside study batches</p>
      </div>

      {/* Batch Selector */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Selected Batch</label>
        <select
          className="w-full max-w-md px-4 py-3 bg-gray-50/50 border border-gray-100 focus:border-indigo-500 rounded-2xl text-sm focus:outline-none focus:bg-white transition-all cursor-pointer font-semibold text-gray-800"
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Subjects */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">1. Subjects</h3>
            <button
              onClick={() => {
                setEditTargetId(null);
                setSubjTitle('');
                setSubjDesc('');
                setActiveModal('subject');
              }}
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                onClick={() => setSelectedSubjId(subj.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedSubjId === subj.id
                    ? 'border-indigo-200 bg-indigo-50/30 text-indigo-900 font-semibold'
                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm truncate">{subj.title}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTargetId(subj.id);
                      setSubjTitle(subj.title);
                      setSubjDesc(subj.description || '');
                      setActiveModal('subject');
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(subj.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            {subjects.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No subjects found.</p>}
          </div>
        </div>

        {/* Column 2: Chapters */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">2. Chapters</h3>
            <button
              disabled={!selectedSubjId}
              onClick={() => {
                setEditTargetId(null);
                setChapTitle('');
                setChapDesc('');
                setActiveModal('chapter');
              }}
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:text-gray-300 disabled:hover:bg-transparent cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {selectedSubjId ? (
              chapters.map((chap) => (
                <div
                  key={chap.id}
                  onClick={() => setSelectedChapId(chap.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedChapId === chap.id
                      ? 'border-indigo-200 bg-indigo-50/30 text-indigo-900 font-semibold'
                      : 'border-gray-100 hover:border-gray-200 text-gray-600'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm truncate">{chap.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTargetId(chap.id);
                        setChapTitle(chap.title);
                        setChapDesc(chap.description || '');
                        setActiveModal('chapter');
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chap.id);
                      }}
                      className="p-1 hover:bg-red-50 rounded text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Select a subject first.</p>
            )}
            {selectedSubjId && chapters.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No chapters found.</p>
            )}
          </div>
        </div>

        {/* Column 3: Lectures */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">3. Lectures</h3>
            <button
              disabled={!selectedChapId}
              onClick={() => {
                setEditTargetId(null);
                setLecTitle('');
                setLecDesc('');
                setLecVideoUrl('');
                setLecNotesTitle('');
                setLecNotesUrl('');
                setLecDuration('45:00');
                setActiveModal('lecture');
              }}
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:text-gray-300 disabled:hover:bg-transparent cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {selectedChapId ? (
              lectures.map((lec) => (
                <div
                  key={lec.id}
                  className="p-3 rounded-2xl border border-gray-100 hover:border-gray-200 text-gray-600 transition-all flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{lec.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-medium">
                      <span className="flex items-center gap-0.5">
                        <Video className="w-3 h-3 text-indigo-500" /> video
                      </span>
                      {lec.notesUrl && (
                        <span className="flex items-center gap-0.5">
                          <FileText className="w-3 h-3 text-emerald-500" /> PDF
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditTargetId(lec.id);
                        setLecTitle(lec.title);
                        setLecDesc(lec.description || '');
                        setLecVideoUrl(lec.videoUrl || lec.video_url || '');
                        setLecNotesTitle(lec.notesTitle || lec.notes_title || '');
                        setLecNotesUrl(lec.notesUrl || lec.notes_url || '');
                        setLecDuration(lec.duration || '45:00');
                        setActiveModal('lecture');
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLecture(lec.id)}
                      className="p-1 hover:bg-red-50 rounded text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Select a chapter first.</p>
            )}
            {selectedChapId && lectures.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No lectures found.</p>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editTargetId ? 'Edit' : 'Add'} {activeModal}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeModal === 'subject' && (
              <form onSubmit={handleSubjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Subject Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhya Pradesh Geography"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:bg-white"
                    value={subjTitle}
                    onChange={(e) => setSubjTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description..."
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    value={subjDesc}
                    onChange={(e) => setSubjDesc(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold">
                  Save Subject
                </button>
              </form>
            )}

            {activeModal === 'chapter' && (
              <form onSubmit={handleChapterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Chapter Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rivers and Mountain Ranges in MP"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    value={chapTitle}
                    onChange={(e) => setChapTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description..."
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    value={chapDesc}
                    onChange={(e) => setChapDesc(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold">
                  Save Chapter
                </button>
              </form>
            )}

            {activeModal === 'lecture' && (
              <form onSubmit={handleLectureSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Lecture Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lecture 01: Narmada River Drainage Basin"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    value={lecTitle}
                    onChange={(e) => setLecTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Video Embed / URL</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://www.youtube.com/embed/... or paste <iframe> embed code"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    value={lecVideoUrl}
                    onChange={(e) => setLecVideoUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  <span className="block text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Companion Notes & Handouts</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Notes Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Hand-written Study Notes"
                        className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                        value={lecNotesTitle}
                        onChange={(e) => setLecNotesTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Notes PDF URL / Drive Link</label>
                      <input
                        type="text"
                        placeholder="e.g. https://drive.google.com/..."
                        className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                        value={lecNotesUrl}
                        onChange={(e) => setLecNotesUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Upload Note to Supabase</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleUploadPDF}
                        className="hidden"
                        id="pdf-notes-upload-input"
                        disabled={uploadingPdf}
                      />
                      <label
                        htmlFor="pdf-notes-upload-input"
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer border border-gray-200/50 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-500" />
                        {uploadingPdf ? 'Uploading Note...' : 'Choose PDF Note'}
                      </label>
                      {lecNotesUrl && lecNotesUrl.includes('supabase.co') && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          Uploaded to Supabase Storage
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Duration (MM:SS)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 52:15"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    value={lecDuration}
                    onChange={(e) => setLecDuration(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold">
                  Save Lecture Details
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
