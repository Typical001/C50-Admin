import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, GraduationCap, Video, Users, CheckCircle, Clock } from 'lucide-react';

interface DashboardStats {
  batchesCount: number;
  subjectsCount: number;
  lecturesCount: number;
  enrollmentsCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    batchesCount: 0,
    subjectsCount: 0,
    lecturesCount: 0,
    enrollmentsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch batches count
      const { count: batchesCount } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true });

      // Fetch subjects count
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });

      // Fetch lectures count
      const { count: lecturesCount } = await supabase
        .from('lectures')
        .select('*', { count: 'exact', head: true });

      // Fetch enrollments count
      const { count: enrollmentsCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      setStats({
        batchesCount: batchesCount || 0,
        subjectsCount: subjectsCount || 0,
        lecturesCount: lecturesCount || 0,
        enrollmentsCount: enrollmentsCount || 0,
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Batches', value: stats.batchesCount, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { title: 'Subjects Configured', value: stats.subjectsCount, icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Uploaded Lectures', value: stats.lecturesCount, icon: Video, color: 'text-purple-600 bg-purple-50' },
    { title: 'Active Enrollments', value: stats.enrollmentsCount, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time statistics of C50 Academy platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{card.title}</span>
                <span className={`p-2.5 rounded-2xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{card.value}</span>
                <span className="text-emerald-600 text-xs font-semibold">+100% live</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Database Connection Active</h4>
                  <p className="text-xs text-gray-400">Successfully linked to live Supabase backend</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Platform Category Filter</h4>
                  <p className="text-xs text-gray-400">Locked exclusively to MPPSC civil prep courses</p>
                </div>
              </div>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Enforced</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-400 text-xs mb-4">Navigate pages from the sidebar to modify batches or rewrite homepage copy.</p>
          </div>
          <div className="space-y-2">
            <div className="p-3 border border-indigo-100 text-indigo-700 bg-indigo-50/20 text-xs font-semibold rounded-2xl text-center">
              Target Exam Category: MPPSC
            </div>
            <div className="p-3 border border-gray-100 text-gray-700 bg-gray-50/50 text-xs font-semibold rounded-2xl text-center">
              Active Storage: thumbnails & notes-pdfs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
