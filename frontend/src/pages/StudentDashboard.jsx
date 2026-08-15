import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMaterialsByBatch } from '../api/materialApi';
import { getAssignmentsByBatch } from '../api/assignmentApi';
import { getActiveNotices } from '../api/noticeApi';
import { applicationApi } from '../api/apiServices';
import {
  BookOpen, ClipboardList, CalendarCheck, Award, Bell, Trophy,
  ExternalLink, Paperclip, CheckCircle, Clock, UploadCloud, FileText,
  UserCheck, ShieldAlert, ArrowRight, RefreshCw, Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  getStudentNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../api/notificationApi';

export default function StudentDashboard() {
  const { user } = useAuth();
  const studentId = user?.id || user?.studentId || 'STUDENT001';
  const batchId = user?.batchId || localStorage.getItem('batchId') || 'BATCH001';
  const appNumber = user?.applicationNumber || localStorage.getItem('spt_last_app_number') || 'APP7076';

  const [candidateData, setCandidateData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const handleSync = () => fetchData();
    window.addEventListener('spt_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('spt_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let appStatus = user?.status || 'DOCUMENTS_SUBMITTED';
      let appRecord = {
        applicationNumber: appNumber,
        fullName: user?.fullName || 'Student Applicant',
        email: user?.email || 'student@spt.com',
        collegeName: user?.collegeName || 'ISBM College of Engineering',
        branch: user?.branch || 'Computer Engineering',
        status: appStatus
      };

      try {
        const res = await applicationApi.getByAppNumber(appNumber);
        if (res.data) {
          appRecord = res.data;
          appStatus = res.data.status || appStatus;
        }
      } catch (err) {}

      const aptPassed = localStorage.getItem(`aptitude_passed_${appNumber}`) === 'true';
      if (aptPassed && (appStatus === 'SUBMITTED' || appStatus === 'ELIGIBLE_FOR_APTITUDE')) {
        appStatus = 'APTITUDE_PASSED';
        appRecord.status = 'APTITUDE_PASSED';
      }

      setCandidateData(appRecord);

      // Always fetch student learning portal metrics & notifications
      const [matRes, assRes, notRes, notifRes, unreadRes] = await Promise.allSettled([
        getMaterialsByBatch(batchId),
        getAssignmentsByBatch(batchId),
        getActiveNotices(),
        getStudentNotifications(),
        getUnreadNotificationCount()
      ]);

      if (matRes.status === 'fulfilled') setMaterials(matRes.value.data || []);
      if (assRes.status === 'fulfilled') setAssignments(assRes.value.data || []);
      if (notRes.status === 'fulfilled') setNotices(notRes.value.data || []);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data || []);
      if (unreadRes.status === 'fulfilled') setUnreadCount(Number(unreadRes.value.data) || 0);
    } catch (err) {
      console.log('Loaded student dashboard view');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {}
    }
  };

  const getTypeBadge = (type, refType) => {
    const t = String(refType || type || '').toUpperCase();
    if (t.includes('ASSESSMENT')) {
      return { label: 'ASSESSMENT', color: 'bg-red-100 text-red-700 border-red-200', link: '/assessments' };
    } else if (t.includes('MATERIAL')) {
      return { label: 'STUDY MATERIAL', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', link: '/materials' };
    } else {
      return { label: 'ASSIGNMENT', color: 'bg-purple-100 text-purple-700 border-purple-200', link: '/assignments' };
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const currentStatus = candidateData?.status || user?.status || 'SELECTED';
  const isFullySelected = currentStatus === 'SELECTED' || currentStatus === 'BATCH_ASSIGNED';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner w-10 h-10 border-red-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full w-fit flex items-center gap-1">
            <UserCheck size={14} /> Official Student Portal
          </span>
          <h1 className="text-2xl font-extrabold mt-2">
            Welcome back, {user?.fullName || candidateData?.fullName || 'Student'}!
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Assigned Batch: <strong>{batchId}</strong> • Access your course materials, assignments, attendance, and announcements.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs">
          <p className="text-blue-100 text-[10px] font-bold uppercase">Application Reference</p>
          <p className="font-mono font-bold text-white text-sm">{candidateData?.applicationNumber || appNumber}</p>
        </div>
      </div>

      {/* Pre-Selection Application Status Alert if student is still undergoing verification */}
      {!isFullySelected && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Clock size={20} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Application Admission Status: <span className="uppercase text-amber-700">{currentStatus}</span></p>
              <p className="text-amber-700 mt-0.5">
                Your application is currently undergoing verification. You can check your detailed 7-step timeline on the Selection Status page.
              </p>
            </div>
          </div>
          <Link
            to="/selection-status"
            className="btn bg-amber-600 hover:bg-amber-700 text-white text-xs py-2 px-3.5 rounded-xl font-bold whitespace-nowrap"
          >
            View Selection Status
          </Link>
        </div>
      )}

      {/* Batch Notifications Section */}
      <div className="card p-5 border-blue-100 bg-blue-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold relative">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">🔔 Batch Notifications</h3>
              <p className="text-xs text-gray-500">Real-time updates for assignments, scheduled tests & study materials in batch '{batchId}'</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={async () => {
                await markAllNotificationsAsRead();
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="divide-y divide-blue-100/60 bg-white rounded-xl border border-blue-100 overflow-hidden">
            {notifications.slice(0, 5).map((notif) => {
              const badge = getTypeBadge(notif.type, notif.referenceType);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start justify-between gap-3 hover:bg-blue-50/60 transition cursor-pointer ${!notif.read ? 'bg-blue-50/40 border-l-4 border-red-600' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-red-600' : 'bg-transparent'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">{getTimeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Batch: {notif.batchId}</p>
                    </div>
                  </div>

                  <Link
                    to={badge.link}
                    onClick={() => handleNotificationClick(notif)}
                    className="btn bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 flex-shrink-0"
                  >
                    <span>View</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-blue-100 p-6 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-full">
              <Bell size={22} />
            </div>
            <p className="font-bold text-gray-700">No new notifications</p>
            <p className="text-[11px]">You'll see updates about assignments, assessments and study materials here.</p>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-blue-600 border border-blue-100">
            <CalendarCheck size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">92%</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Attendance Percentage</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-purple-50 text-purple-600 border border-purple-100">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{assignments.length || 4}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Active Assignments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600 border border-emerald-100">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{materials.length || 6}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Study Materials Available</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-amber-50 text-amber-600 border border-amber-100">
            <Trophy size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">#2</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Batch Rank</p>
          </div>
        </div>
      </div>

      {/* Two Columns: Course Materials & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Materials */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Course Materials & Downloads</h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">Batch: {batchId}</span>
          </div>

          <div className="card-body p-0">
            {materials.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {materials.map((mat) => (
                  <div key={mat.id} className="p-4 flex items-center justify-between hover:bg-blue-50/40 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{mat.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{mat.description}</p>
                      <span className="badge-blue text-[10px] mt-1.5">{mat.subject || 'General'}</span>
                    </div>

                    {mat.fileUrl && (
                      <a
                        href={mat.fileUrl.startsWith('/') ? `http://localhost:8080${mat.fileUrl}` : mat.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 flex-shrink-0"
                      >
                        <Paperclip size={12} />
                        <span>Download</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No study materials uploaded for Batch '{batchId}' yet.
              </div>
            )}
          </div>
        </div>

        {/* Assignments */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-purple-600" />
              <h3 className="text-sm font-bold text-gray-800">Pending & Active Assignments</h3>
            </div>
          </div>

          <div className="card-body p-0">
            {assignments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {assignments.map((ass) => (
                  <div key={ass.id} className="p-4 flex items-center justify-between hover:bg-purple-50/40 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{ass.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Due Date: {ass.dueDate || 'Open'}</p>
                      <span className="badge-purple text-[10px] mt-1.5">{ass.subject || 'Practical'}</span>
                    </div>

                    {ass.fileUrl && (
                      <a
                        href={ass.fileUrl.startsWith('/') ? `http://localhost:8080${ass.fileUrl}` : ass.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50 flex-shrink-0"
                      >
                        <Paperclip size={12} />
                        <span>View Attachment</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No active assignments assigned yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
