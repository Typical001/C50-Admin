import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BatchesCMS from './components/BatchesCMS';
import SyllabusCMS from './components/SyllabusCMS';
import HomepageCMS from './components/HomepageCMS';
import { LayoutDashboard, BookOpen, GraduationCap, Sparkles, LogOut, User as UserIcon } from 'lucide-react';

type AdminView = 'dashboard' | 'batches' | 'syllabus' | 'homepage';

export default function App() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [selectedBatchIdForSyllabus, setSelectedBatchIdForSyllabus] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        verifyAdminAndSet(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        verifyAdminAndSet(session.user);
      } else {
        setSessionUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyAdminAndSet = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setSessionUser(null);
      } else {
        setSessionUser({
          ...user,
          name: profile.name || user.email,
        });
      }
    } catch (err) {
      console.error(err);
      setSessionUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!sessionUser) {
    return <Login onLoginSuccess={verifyAdminAndSet} />;
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
