import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTrainerDashboard } from '../api/trainerApi';
import {
  Users,
  ClipboardList,
  FileText,
  BookOpen,
  Award,
  CalendarCheck,
  Video,
  Bell,
  Trophy,
  ArrowRight,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const trainerId = user?.id || user?.email || localStorage.getItem('trainerId') || '';

  useEffect(() => {
    fetchDashboard();
  }, [trainerId]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTrainerDashboard(trainerId);
      if (res && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error('Faculty dashboard load failed:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load faculty dashboard data from server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Assigned Students', value: data?.totalStudents ?? 0, icon: Users, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Total Assignments', value: data?.totalAssignments ?? 0, icon: ClipboardList, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Assessments Created', value: data?.totalAssessments ?? 0, icon: FileText, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Study Materials', value: data?.totalStudyMaterials ?? 0, icon: BookOpen, color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'Interviews Conducted', value: data?.totalInterviews ?? 0, icon: Award, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Attendance Marked Today', value: data?.attendanceMarkedToday != null ? `${data.attendanceMarkedToday} Present` : '0 Present', icon: CalendarCheck, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Guest Sessions', value: data?.totalGuestSessions ?? 0, icon: Video, color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { label: 'Active Notices', value: data?.totalNotices ?? 0, icon: Bell, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="spinner w-10 h-10 border-red-600" />
        <p className="text-xs text-gray-500 font-semibold">Loading faculty overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-12 text-center bg-red-50/40 border border-red-200 max-w-lg mx-auto space-y-4 my-8">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-red-900">Dashboard Unavailable</h3>
          <p className="text-xs text-red-700 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="btn bg-red-600 text-white hover:bg-red-700 text-xs font-bold px-4 py-2 mx-auto flex items-center gap-1.5 shadow"
        >
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Faculty Overview
          </span>
          <h1 className="text-2xl font-extrabold mt-2">
            Welcome back, {data?.trainer?.firstName || user?.fullName || 'Faculty'}!
          </h1>
          <p className="text-xs text-red-100 mt-1 max-w-xl">
            {data?.trainer?.specialization ? `Specialization: ${data.trainer.specialization} • ` : ''}
            Manage your classes, track student progress, grade submissions, and post announcements.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/attendance" className="btn bg-white text-red-700 hover:bg-red-50 text-xs font-bold shadow">
            <CalendarCheck size={16} />
            <span>Mark Attendance</span>
          </Link>
          <Link to="/assignments" className="btn bg-red-800 text-white hover:bg-red-900 text-xs font-bold">
            <ClipboardList size={16} />
            <span>New Assignment</span>
          </Link>
        </div>
      </div>

      {/* Grid of Real Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className={`stat-icon border ${stat.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Section: Top Performers & Latest Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold text-gray-800">Top Performers (Batch Rankers)</h3>
            </div>
            <Link to="/toppers" className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body p-0">
            {data?.topPerformers && data.topPerformers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.topPerformers.map((student, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-amber-700/10 text-amber-900' : 'bg-gray-100 text-gray-600'
                      }`}>
                        #{student.rank || idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{student.studentName || 'Student'}</p>
                        <p className="text-[11px] text-gray-400">ID: {student.studentId || 'N/A'}</p>
                      </div>
                    </div>
                    <span className="badge-green font-bold">
                      {student.overallPercentage != null ? `${student.overallPercentage.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-xs">
                <Trophy size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="font-semibold text-gray-700">No Top Performers Recorded Yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Rankings will update as student evaluations are completed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Notices */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-red-600" />
              <h3 className="text-sm font-bold text-gray-800">Recent Notices & Announcements</h3>
            </div>
            <Link to="/notices" className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1">
              <span>Post Notice</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body p-0">
            {data?.latestNotices && data.latestNotices.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.latestNotices.map((notice, idx) => (
                  <div key={idx} className="p-4 flex flex-col gap-1 hover:bg-red-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">{notice.title || 'Notice'}</span>
                      <span className={`badge ${
                        notice.priority === 'HIGH' ? 'badge-red' : 'badge-gray'
                      }`}>
                        {notice.priority || 'NORMAL'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{notice.description || 'No details provided.'}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Posted by: {notice.trainerName || 'Faculty'} • Category: {notice.category || 'General'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-xs">
                <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="font-semibold text-gray-700">No Active Notices</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Announcements posted by faculty will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
