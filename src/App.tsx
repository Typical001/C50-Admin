import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { createVerificationGate } from './lib/adminSession';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BatchesCMS from './components/BatchesCMS';
import SyllabusCMS from './components/SyllabusCMS';
import HomepageCMS from './components/HomepageCMS';
import { LayoutDashboard, BookOpen, GraduationCap, Sparkles, LogOut, User as UserIcon } from 'lucide-react';

type AdminView = 'dashboard' | 'batches' | 'syllabus' | 'homepage';

export default function App() {
  const [sessionUser, setSessionUser] = useState<(User & { name: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [selectedBatchIdForSyllabus, setSelectedBatchIdForSyllabus] = useState<string | undefined>(undefined);

  const [authError, setAuthError] = useState('');
  const gate = useRef(createVerificationGate());
  const blocked = useRef(false);
  const mounted = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const lock = () => {
    blocked.current = true;
    sessionStorage.setItem('c50-admin-signed-out', '1');
    gate.current.invalidate();
    controller.current?.abort();
  };

  const verify = useCallback(async (session: Session | null, ticket: number) => {
    const current = () => mounted.current && gate.current.isCurrent(ticket) && !blocked.current;
    if (!current()) return;
    if (!session) { setLoading(false); return; }
    const abort = new AbortController();
    controller.current = abort;
    const timer = setTimeout(() => {
      if (!current()) return;
      gate.current.invalidate(); abort.abort();
      setSessionUser(null); setLoading(false);
      setAuthError('Session verification timed out. Please sign in again.');
    }, 15000);
    try {
      const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
      if (!current()) return;
      if (error || !user || user.id !== session.user.id) throw new Error('denied');
      const { data: profile, error: profileError } = await supabase.from('profiles')
        .select('id,role,name').eq('id', user.id).abortSignal(abort.signal).single();
      if (!current()) return;
      const latest = await supabase.auth.getSession();
      if (!current()) return;
      if (profileError || profile?.role !== 'admin' || latest.error ||
          latest.data.session?.access_token !== session.access_token) throw new Error('denied');
      setAuthError('');
      setSessionUser({ ...user, name: profile.name || user.email || 'Administrator' });
    } catch {
      if (!current()) return;
      setSessionUser(null);
      setAuthError('Unable to authorize this session. Sign in with an administrator account.');
      // Do not perform a delayed signOut here: it could revoke a newer login.
    } finally {
      clearTimeout(timer);
      if (current()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const verificationGate = gate.current;
    mounted.current = true;
    blocked.current = sessionStorage.getItem('c50-admin-signed-out') === '1';
    let scheduled: ReturnType<typeof setTimeout>;
    const schedule = (session: Session | null) => {
      const ticket = gate.current.invalidate();
      controller.current?.abort();
      clearTimeout(scheduled);
      setSessionUser(null);
      setLoading(!!session && !blocked.current);
      if (!session || blocked.current) return;
      // Leave the Supabase auth callback before making further auth calls.
      scheduled = setTimeout(() => { void verify(session, ticket); }, 0);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      schedule(session);
    });
    const initial = gate.current.invalidate();
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted.current || !gate.current.isCurrent(initial)) return;
      if (error) { setAuthError('Unable to restore session. Please sign in.'); setLoading(false); }
      else schedule(data.session);
    }).catch(() => { if (mounted.current && gate.current.isCurrent(initial)) setLoading(false); });
    const refresh = () => {
      if (document.visibilityState === 'visible' && !blocked.current) {
        const ticket = gate.current.invalidate();
        controller.current?.abort(); setSessionUser(null); setLoading(true);
        void supabase.auth.getSession().then(({ data }) => {
          if (mounted.current && gate.current.isCurrent(ticket)) schedule(data.session);
        }).catch(() => { if (mounted.current && gate.current.isCurrent(ticket)) setLoading(false); });
      }
    };
    document.addEventListener('visibilitychange', refresh);
    return () => {
      mounted.current = false; verificationGate.invalidate(); controller.current?.abort();
      clearTimeout(scheduled); subscription.unsubscribe();
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [verify]);

  const handleLogout = async () => {
    lock(); setSessionUser(null); setLoading(false);
    setActiveView('dashboard'); setSelectedBatchIdForSyllabus(undefined);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      setAuthError('');
    } catch { setAuthError('This panel is locked. Server sign-out could not be confirmed; reconnect and sign in again.'); }
  };
  const prepareLogin = () => {
    gate.current.invalidate(); controller.current?.abort();
    blocked.current = false; sessionStorage.removeItem('c50-admin-signed-out');
    setSessionUser(null); setAuthError('');
    setActiveView('dashboard'); setSelectedBatchIdForSyllabus(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!sessionUser) {
    return <Login onLoginStart={prepareLogin} sessionError={authError} />;
  }

  const menuItems = [
    { view: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { view: 'batches' as AdminView, label: 'Manage Batches', icon: BookOpen },
    { view: 'syllabus' as AdminView, label: 'Batch Content Manager', icon: GraduationCap },
    { view: 'homepage' as AdminView, label: 'Homepage CMS', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-extrabold text-gray-900 tracking-tight text-sm">C50 Academy</h2>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Admin Panel</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 border-t border-gray-50 pt-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{sessionUser.name}</p>
              <p className="text-[10px] font-medium text-gray-400 truncate">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-10 max-h-screen overflow-y-auto">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'batches' && (
          <BatchesCMS 
            onManageSyllabus={(batchId) => {
              setSelectedBatchIdForSyllabus(batchId);
              setActiveView('syllabus');
            }}
          />
        )}
        {activeView === 'syllabus' && (
          <SyllabusCMS initialBatchId={selectedBatchIdForSyllabus} />
        )}
        {activeView === 'homepage' && <HomepageCMS />}
      </main>
    </div>
  );
}
