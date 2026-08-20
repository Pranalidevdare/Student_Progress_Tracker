import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/apiServices';
import { getStudentMaterialsByBatch } from '../api/materialApi';
import { getStudentAssignmentsByBatch } from '../api/assignmentApi';
import { getActiveNotices } from '../api/noticeApi';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts';
import {
  BookOpen, ClipboardList, CalendarCheck, Award, Bell, Trophy,
  ExternalLink, Paperclip, CheckCircle, Clock, UserCheck, ShieldAlert,
  ArrowRight, RefreshCw, TrendingUp, Sparkles, BarChart2, CheckCircle2, Target
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const handleSync = () => fetchDashboardData();
    window.addEventListener('spt_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('spt_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setHasError(false);
    setErrorMessage('');
    try {
      // 1. Fetch dashboard data for authenticated student from /api/student/dashboard
      const dashRes = await studentApi.getDashboard();
      const dash = dashRes?.data;
      if (!dash) {
        throw new Error("Unable to retrieve student dashboard data");
      }
      setDashboardData(dash);

      // 2. Resolve active batch ID from backend response
      const activeBatchId = dash.batchId || dash.batch?.id || dash.student?.batchId || user?.batchId || null;

      // 3. Fetch materials, assignments, notices
      if (activeBatchId) {
        const [matRes, assRes, notRes] = await Promise.allSettled([
          getStudentMaterialsByBatch(activeBatchId),
          getStudentAssignmentsByBatch(activeBatchId),
          getActiveNotices()
        ]);

        if (matRes.status === 'fulfilled') setMaterials(Array.isArray(matRes.value.data) ? matRes.value.data : []);
        if (assRes.status === 'fulfilled') setAssignments(Array.isArray(assRes.value.data) ? assRes.value.data : []);
        if (notRes.status === 'fulfilled') setNotices(Array.isArray(notRes.value.data) ? notRes.value.data : []);
      } else {
        const notRes = await getActiveNotices().catch(() => ({ data: [] }));
        setNotices(Array.isArray(notRes.data) ? notRes.data : []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setHasError(true);
      setErrorMessage(err.response?.data?.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToLeaderboard = () => {
    setShowLeaderboard(true);
    const elem = document.getElementById('leaderboard-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="spinner w-10 h-10 border-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (hasError || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-2xl border border-red-100 shadow-xs max-w-lg mx-auto my-12">
        <ShieldAlert size={48} className="text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Unable to load dashboard data</h3>
        <p className="text-xs text-gray-500 mb-4">{errorMessage || 'Unable to load dashboard data. Please try again.'}</p>
        <button
          onClick={fetchDashboardData}
          className="btn-primary flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Calculate real student identifiers and metadata from database
  const studentName = dashboardData.studentName
    || [dashboardData.student?.firstName, dashboardData.student?.lastName].filter(Boolean).join(' ')
    || user?.fullName
    || 'Student';

  const studentDisplayId = dashboardData.studentId
    || dashboardData.student?.studentId
    || user?.studentId
    || user?.id
    || '-';

  const batchDisplayName = dashboardData.batch?.name
    || dashboardData.batchName
    || dashboardData.student?.batchName
    || (dashboardData.batchId ? `Batch ${dashboardData.batchId}` : 'No batch assigned');

  // Metrics directly from real backend database response
  const overallPerf = dashboardData.overallPerformance != null ? Number(dashboardData.overallPerformance).toFixed(1) : '0.0';
  const assessmentScore = dashboardData.assessmentPercentage != null ? Number(dashboardData.assessmentPercentage).toFixed(1) : '0.0';
  const attendancePct = dashboardData.attendancePercentage != null ? Number(dashboardData.attendancePercentage).toFixed(1) : '0.0';
  const totalAss = dashboardData.totalAssignments != null ? dashboardData.totalAssignments : assignments.length;
  const completedAss = dashboardData.completedAssignments != null ? dashboardData.completedAssignments : 0;
  const pendingAss = dashboardData.pendingAssignments != null ? dashboardData.pendingAssignments : Math.max(0, totalAss - completedAss);
  const assCompletionPct = dashboardData.assignmentCompletionPercentage != null
    ? Math.round(dashboardData.assignmentCompletionPercentage)
    : (totalAss > 0 ? Math.round((completedAss * 100) / totalAss) : 0);
  const currentRank = dashboardData.currentRank != null ? dashboardData.currentRank : (dashboardData.batchRank || '-');
  const totalBatchStudents = dashboardData.totalBatchStudents != null ? dashboardData.totalBatchStudents : (dashboardData.batchSize || 0);
  const trendStatus = dashboardData.trendStatus || 'Stable';

  // Real chart datasets from MongoDB
  const trendData = Array.isArray(dashboardData.performanceTrend) ? dashboardData.performanceTrend : [];
  const subjectPerformance = Array.isArray(dashboardData.subjectPerformance) ? dashboardData.subjectPerformance : [];

  // Attendance metrics
  const presentDays = dashboardData.presentDays != null ? dashboardData.presentDays : 0;
  const absentDays = dashboardData.absentDays != null ? dashboardData.absentDays : 0;
  const totalDays = presentDays + absentDays;
  const attendanceDonutData = totalDays > 0 ? [
    { name: 'Present', value: presentDays, color: '#10b981' },
    { name: 'Absent', value: absentDays, color: '#ef4444' }
  ] : [];

  // Skill radar dataset
  const radarData = subjectPerformance.map(s => ({
    subject: s.subject,
    score: s.score
  }));

  // Leaderboard data from backend
  const leaderboard = Array.isArray(dashboardData.batchLeaderboard) ? dashboardData.batchLeaderboard : [];

  const getTrendBadge = (status) => {
    if (status === 'Improving') {
      return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1"><TrendingUp size={12} /> Improving</span>;
    }
    if (status === 'Needs Attention') {
      return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1"><ShieldAlert size={12} /> Needs Attention</span>;
    }
    return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"><BarChart2 size={12} /> Stable Performance</span>;
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full w-fit flex items-center gap-1.5">
            <UserCheck size={14} /> Student Performance Analytics Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome back, {studentName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Assigned Batch: <strong className="font-medium bg-white/15 px-2.5 py-0.5 rounded-md">{batchDisplayName}</strong> • Real-time database analytics tracking your assessment progress, attendance, and batch standings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs">
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wide">Student ID</p>
            <p className="font-mono font-extrabold text-white text-base">{studentDisplayId}</p>
          </div>

          <button
            onClick={scrollToLeaderboard}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Trophy size={16} className="text-amber-500" />
            <span>View All Rankers</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Top Performance Summary Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overall Performance */}
        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-blue-600 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Overall Performance</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-gray-900">{overallPerf}%</p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
              {dashboardData.performanceStatus || 'EVALUATING'}
            </span>
          </div>
        </div>

        {/* Assessment Average */}
        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-indigo-600 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Avg Assessment</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Target size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-gray-900">{assessmentScore}%</p>
            <p className="text-[11px] text-gray-500 mt-1">{dashboardData.totalAssessments || trendData.length} Assessments Taken</p>
          </div>
        </div>

        {/* Assignment Completion */}
        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-purple-600 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assignments</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ClipboardList size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-gray-900">{completedAss}/{totalAss}</p>
              <span className="text-xs font-bold text-purple-600">{assCompletionPct}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${assCompletionPct}%` }} />
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-emerald-600 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Attendance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-gray-900">{attendancePct}%</p>
            {totalDays === 0 ? (
              <p className="text-[11px] text-gray-400 mt-1">No sessions logged</p>
            ) : Number(attendancePct) < 75 ? (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                Below 75% Limit
              </span>
            ) : (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Good Standing (≥ 75%)</p>
            )}
          </div>
        </div>

        {/* Batch Rank */}
        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-amber-500 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Batch Rank</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Trophy size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-extrabold text-gray-900">#{currentRank}</p>
              <span className="text-xs text-gray-400">/ {totalBatchStudents} Students</span>
            </div>
            <p className="text-[11px] text-amber-700 font-bold mt-1">
              {totalBatchStudents > 0 && typeof currentRank === 'number'
                ? `Top ${Math.round((currentRank / totalBatchStudents) * 100)}% in Batch`
                : 'Batch Standings'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 4: Performance Trend & Attendance Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend Line Chart (2 Cols) */}
        <div className="card lg:col-span-2 flex flex-col">
          <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" /> Performance Trend
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Historical assessment score trajectory over time</p>
            </div>
            <div>{getTrendBadge(trendStatus)}</div>
          </div>

          <div className="card-body pt-6 flex-1 min-h-[280px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="title" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 8, fill: '#1d4ed8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400 text-xs py-8">
                <TrendingUp size={28} className="text-gray-300 mb-2" />
                <p className="font-semibold text-gray-600">No performance history available yet.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Assessment trajectories will plot here once graded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Donut Chart (1 Col) */}
        <div className="card flex flex-col">
          <div className="card-header border-b border-gray-100 pb-4">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <CalendarCheck size={18} className="text-emerald-600" /> Attendance Overview
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Present vs Absent lecture distribution</p>
          </div>

          <div className="card-body pt-4 flex flex-col items-center justify-center flex-1 min-h-[280px]">
            {attendanceDonutData.length > 0 ? (
              <>
                <div className="relative w-full h-[180px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceDonutData}
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {attendanceDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => [`${val} Days`, 'Days']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-gray-900">{attendancePct}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Present</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span>Present ({presentDays} Days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                    <span>Absent ({absentDays} Days)</span>
                  </div>
                </div>

                {totalDays > 0 && Number(attendancePct) < 75 && (
                  <div className="mt-4 p-2.5 rounded-xl bg-red-50 border border-red-100 text-[11px] text-red-700 font-bold flex items-center gap-2 w-full text-center justify-center">
                    <ShieldAlert size={14} className="text-red-600 flex-shrink-0" />
                    <span>Attendance Warning: Below required 75% threshold</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400 text-xs py-8">
                <CalendarCheck size={28} className="text-gray-300 mb-2" />
                <p className="font-semibold text-gray-600">No attendance records logged yet.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Faculty session attendance logs will display here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3 & 5: Subject Performance & Assignment Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance Bar Chart */}
        <div className="card flex flex-col">
          <div className="card-header border-b border-gray-100 pb-4">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <BarChart2 size={18} className="text-blue-600" /> Performance by Subject
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Average score percentage across academic modules</p>
          </div>

          <div className="card-body pt-6 min-h-[260px]">
            {subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={subjectPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(val) => [`${val}%`, 'Score']}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-gray-400 text-xs py-6">
                <BarChart2 size={28} className="text-gray-300 mb-2" />
                <p className="font-semibold text-gray-600">No Subject Performance Recorded</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Module evaluations will appear here once submitted.</p>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Progress & Breakdown */}
        <div className="card flex flex-col">
          <div className="card-header border-b border-gray-100 pb-4">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-purple-600" /> Assignment Progress
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Status breakdown of coursework submissions</p>
          </div>

          <div className="card-body p-6 flex flex-col justify-between flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Overall Submission Rate</span>
                <span className="text-purple-700 font-extrabold text-sm">{assCompletionPct}%</span>
              </div>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all" style={{ width: `${assCompletionPct}%` }} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-800">
                    <CheckCircle2 size={16} className="text-purple-600" /> Completed
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 mt-2">{completedAss}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Submitted & Evaluated</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <Clock size={16} className="text-amber-600" /> Pending
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 mt-2">{pendingAss}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Awaiting Submission</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Total Coursework Assigned: <strong>{totalAss}</strong></span>
              <span className="text-purple-600 font-bold">{completedAss === totalAss && totalAss > 0 ? 'All Completed! 🎉' : 'Keep it up!'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6 & 7: Skill Radar & Rank Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Analysis Radar Chart */}
        <div className="card flex flex-col">
          <div className="card-header border-b border-gray-100 pb-4">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" /> Skill Analysis
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Multidimensional academic skill evaluation</p>
          </div>

          <div className="card-body pt-4 min-h-[260px] flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
                  <Tooltip formatter={(val) => [`${val}%`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-gray-400 text-xs py-6">
                <Sparkles size={28} className="text-gray-300 mb-2" />
                <p className="font-semibold text-gray-600">No Skill Analysis Data Available</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Multidimensional skills will plot here after assessments.</p>
              </div>
            )}
          </div>
        </div>

        {/* Batch Rank Summary Card */}
        <div className="card p-6 flex flex-col justify-between bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border-amber-100">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Batch Standings • {batchDisplayName}
              </span>
              <Trophy size={28} className="text-amber-500" />
            </div>

            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-gray-900">{currentRank !== '-' ? `Rank #${currentRank}` : 'Rank: Evaluating'}</h3>
              <p className="text-xs text-gray-600 mt-1">
                {totalBatchStudents > 0
                  ? `You are currently ranked #${currentRank} out of ${totalBatchStudents} students in ${batchDisplayName}.`
                  : `Assigned to ${batchDisplayName}. Rankings will generate upon grading.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-2xs">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Overall Score</p>
                <p className="text-xl font-extrabold text-amber-700 mt-0.5">{overallPerf}%</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-2xs">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Performance Status</p>
                <p className="text-xs font-extrabold text-emerald-600 mt-1">{dashboardData.performanceStatus || 'EVALUATING'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-200/50 flex justify-end">
            <button
              onClick={scrollToLeaderboard}
              className="btn-primary px-4 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-200 bg-amber-600 hover:bg-amber-700 flex items-center gap-1.5"
            >
              <span>Explore Batch Leaderboard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 8 & LEADERBOARD: Batch Leaderboard */}
      <div id="leaderboard-section" className="card flex flex-col border-amber-200 shadow-sm scroll-mt-6">
        <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-4 bg-gradient-to-r from-amber-50/40 to-transparent">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> Batch Leaderboard ({batchDisplayName})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Public academic ranking performance for students in your assigned batch</p>
          </div>
          <span className="badge-amber text-xs font-mono font-bold">Batch: {batchDisplayName}</span>
        </div>

        <div className="card-body p-0 overflow-x-auto">
          {leaderboard.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Overall Score</th>
                  <th className="py-3 px-4 text-right">Performance Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {leaderboard.map((item, idx) => {
                  const isCurrentUser =
                    (item.id && user?.id && item.id === user.id) ||
                    (item.studentId && studentDisplayId && item.studentId === studentDisplayId) ||
                    (item.studentId && user?.studentId && item.studentId === user?.studentId) ||
                    (item.studentName && studentName && item.studentName === studentName);

                  return (
                    <tr
                      key={item.id || (item.studentId ? `${item.studentId}-${idx}` : `rank-${item.rank}-${idx}`)}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-amber-50/80 font-bold border-l-4 border-l-amber-500'
                          : 'hover:bg-gray-50/60'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {item.rank === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center border border-amber-300">🥇 1</span>
                          ) : item.rank === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center border border-slate-300">🥈 2</span>
                          ) : item.rank === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-900/10 text-amber-900 font-extrabold text-xs flex items-center justify-center border border-amber-200">🥉 3</span>
                          ) : (
                            <span className="font-mono font-bold text-gray-600 text-xs px-2 py-0.5 rounded bg-gray-100">#{item.rank}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                        {item.studentId || '-'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{item.studentName || 'Student'}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-extrabold text-gray-900">
                        {item.overallPercentage != null ? `${Number(item.overallPercentage).toFixed(1)}%` : '0.0%'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          item.performanceStatus === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' :
                          item.performanceStatus === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {item.performanceStatus || 'EVALUATING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 text-xs">
              <Trophy size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700">No Batch Rankings Recorded Yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Leaderboard standings will populate once batch assessments are graded.</p>
            </div>
          )}
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
            <span className="text-xs text-gray-500 font-medium">{batchDisplayName}</span>
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
                No study materials uploaded for '{batchDisplayName}' yet.
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
            <span className="text-xs text-gray-500 font-medium">{batchDisplayName}</span>
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
                No active assignments assigned for '{batchDisplayName}' yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
