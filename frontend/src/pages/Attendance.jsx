import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTodayAttendance,
  markAttendance,
  updateAttendance,
  bulkMarkAttendance,
  getStudentMonthlyAttendance,
  getAttendanceHistory
} from '../api/attendanceApi';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  X,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  RefreshCw,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  Eye,
  UserCheck,
  ArrowUpDown,
  Lock,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';

export default function Attendance() {
  const { user } = useAuth();
  const userTypeStr = String(user?.trainerType || user?.specialization || user?.role || '').toUpperCase();
  const isSoftSkillTrainer = userTypeStr.includes('SOFT') || userTypeStr.includes('COMMUNICATION');
  
  // Enforce trainer authorized session type (Read-Only)
  const allowedSessionType = isSoftSkillTrainer ? 'SOFT_SKILL' : 'TECHNICAL';

  const defaultBatchId = user?.batchId || localStorage.getItem('batchId') || 'BATCH001';
  const defaultBatchName = user?.batchName || 'Java Full Stack Batch (BATCH001)';
  const trainerName = user?.fullName || user?.name || (isSoftSkillTrainer ? 'Soft Skills Faculty' : 'Technical Trainer');

  // Core State
  const [batchId, setBatchId] = useState(defaultBatchId);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter, Search, Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('nameAZ');

  // Per-Student Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: 'PRESENT',
    remarks: ''
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Bulk Modal State
  const [bulkConfirmModalOpen, setBulkConfirmModalOpen] = useState(false);
  const [submittingBulk, setSubmittingBulk] = useState(false);

  // Monthly Report Modal State
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
  const [selectedStudentForMonthly, setSelectedStudentForMonthly] = useState(null);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyDate, setHistoryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const [apiError, setApiError] = useState(null);

  const getErrorMessage = (err) => {
    if (!err.response) {
      return 'Unable to connect to the attendance server. Please make sure the backend is running.';
    }
    const status = err.response.status;
    const msg = err.response.data?.message;
    if (status === 401) return 'Session expired or unauthenticated. Please log in again.';
    if (status === 403) return msg || 'You are not authorized to manage this attendance session.';
    if (status === 400) return msg || 'Invalid attendance request format.';
    if (status === 404) return msg || 'Requested attendance resource not found.';
    if (status === 500) return msg || 'Server error occurred while processing attendance. Please try again.';
    return msg || 'An error occurred while communicating with the server.';
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await getTodayAttendance(batchId, selectedDate, allowedSessionType);
      if (res.data) {
        setTodayData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance data', err);
      const errMsg = getErrorMessage(err);
      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Date Navigation Handlers
  const handlePreviousDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const nextStr = d.toISOString().split('T')[0];
    if (nextStr > todayStr) {
      toast.error('Cannot select a future date.');
      return;
    }
    setSelectedDate(nextStr);
  };

  const handleSelectToday = () => {
    setSelectedDate(todayStr);
  };

  // Edit Modal Handler
  const handleOpenEditModal = (stu) => {
    setSelectedStudentForEdit(stu);
    setEditFormData({
      status: stu.todayStatus === 'NOT MARKED' ? 'PRESENT' : stu.todayStatus,
      remarks: stu.todayRemarks || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEditAttendance = async (e) => {
    e.preventDefault();
    if (!selectedStudentForEdit) return;

    setSubmittingEdit(true);
    try {
      const payload = {
        studentId: selectedStudentForEdit.studentId,
        batchId: todayData?.batchId || batchId,
        attendanceDate: selectedDate,
        sessionType: allowedSessionType,
        status: editFormData.status,
        remarks: editFormData.remarks.trim()
      };

      if (selectedStudentForEdit.todayAttendanceId) {
        await updateAttendance(selectedStudentForEdit.todayAttendanceId, payload);
      } else {
        await markAttendance(payload);
      }

      toast.success(`Attendance updated for ${selectedStudentForEdit.studentName}!`);
      setEditModalOpen(false);
      fetchAttendanceData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save attendance.';
      toast.error(errMsg);
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Bulk Mark Remaining Students as PRESENT
  const handleConfirmBulkMarkAllPresent = async () => {
    setSubmittingBulk(true);
    try {
      const payload = {
        batchId: todayData?.batchId || batchId,
        attendanceDate: selectedDate,
        sessionType: allowedSessionType,
        targetStatus: 'PRESENT'
      };

      const res = await bulkMarkAttendance(payload);
      if (res.data) {
        setTodayData(res.data);
      }
      toast.success('All remaining unmarked students marked as Present! 🚀');
      setBulkConfirmModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to bulk mark attendance.';
      toast.error(errMsg);
    } finally {
      setSubmittingBulk(false);
    }
  };

  // Monthly Report Handler
  const handleOpenMonthlyReport = async (stu) => {
    setSelectedStudentForMonthly(stu);
    setMonthlyModalOpen(true);
    fetchStudentMonthlyData(stu.studentId, monthlyMonth, monthlyYear);
  };

  const fetchStudentMonthlyData = async (studentId, month, year) => {
    setLoadingMonthly(true);
    try {
      const res = await getStudentMonthlyAttendance(studentId, month, year);
      if (res.data) {
        setMonthlyData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch monthly attendance report', err);
      toast.error('Failed to load monthly attendance report.');
    } finally {
      setLoadingMonthly(false);
    }
  };

  // History Review Handler
  const handleOpenHistoryModal = () => {
    setHistoryDate(selectedDate);
    setHistoryModalOpen(true);
    fetchHistoryData(selectedDate);
  };

  const fetchHistoryData = async (hDate) => {
    setLoadingHistory(true);
    try {
      const res = await getAttendanceHistory(batchId, hDate, allowedSessionType);
      if (res.data) {
        setHistoryData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Student Roster Filtering & Sorting
  const rawStudentList = todayData?.students || [];

  const filteredStudents = rawStudentList
    .filter(stu => {
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch = !term || (
        stu.studentName?.toLowerCase().includes(term) ||
        stu.studentId?.toLowerCase().includes(term) ||
        stu.studentEmail?.toLowerCase().includes(term)
      );

      let matchesStatus = true;
      if (statusFilter === 'PRESENT') matchesStatus = stu.todayStatus === 'PRESENT';
      else if (statusFilter === 'ABSENT') matchesStatus = stu.todayStatus === 'ABSENT';
      else if (statusFilter === 'LATE') matchesStatus = stu.todayStatus === 'LATE';
      else if (statusFilter === 'LEAVE') matchesStatus = stu.todayStatus === 'LEAVE';
      else if (statusFilter === 'NOT_MARKED' || statusFilter === 'ONLY_UNMARKED') matchesStatus = stu.todayStatus === 'NOT MARKED';

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'nameAZ') return (a.studentName || '').localeCompare(b.studentName || '');
      if (sortBy === 'nameZA') return (b.studentName || '').localeCompare(a.studentName || '');
      if (sortBy === 'lowestAtt') return (a.overallAttendancePercentage || 0) - (b.overallAttendancePercentage || 0);
      if (sortBy === 'highestAtt') return (b.overallAttendancePercentage || 0) - (a.overallAttendancePercentage || 0);
      if (sortBy === 'status') return (a.todayStatus || '').localeCompare(b.todayStatus || '');
      return 0;
    });

  const activeBatchName = todayData?.batchName || defaultBatchName;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <CalendarCheck size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>{isSoftSkillTrainer ? 'Soft Skill Attendance Today' : 'Technical Attendance Today'}</span>
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
              <span>Trainer: <strong className="text-gray-800">{trainerName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px]">SESSION:</span>
                <span className={`badge text-xs font-black px-2.5 py-0.5 inline-flex items-center gap-1 ${
                  allowedSessionType === 'SOFT_SKILL' ? 'badge-purple' : 'badge-red'
                }`}>
                  {allowedSessionType === 'SOFT_SKILL' ? <MessageSquare size={12} /> : <BookOpen size={12} />}
                  <span>{allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill Session' : 'Technical Session'}</span>
                  <Lock size={10} className="ml-0.5 opacity-60" title="Session type is locked based on your trainer authorization" />
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE BATCH CARD */}
        <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center gap-3 shadow-md">
          <Users size={20} className="text-red-400" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Active Batch</span>
            <p className="text-xs font-bold text-white flex items-center gap-2">
              <span>{activeBatchName}</span>
              <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-700">{todayData?.batchId || batchId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* SESSION-SPECIFIC TODAY'S ATTENDANCE SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Total Students</span>
          <span className="text-xl font-black text-gray-900">{todayData?.totalStudents || 0}</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 shadow-sm">
          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block flex items-center gap-1">
            <CheckCircle2 size={12} /> Present
          </span>
          <span className="text-xl font-black text-emerald-900">{todayData?.presentCount || 0}</span>
        </div>

        <div className="p-4 bg-red-50/70 rounded-2xl border border-red-100 shadow-sm">
          <span className="text-[10px] font-black uppercase text-red-700 tracking-wider block flex items-center gap-1">
            <XCircle size={12} /> Absent
          </span>
          <span className="text-xl font-black text-red-900">{todayData?.absentCount || 0}</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 shadow-sm">
          <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block flex items-center gap-1">
            <Clock size={12} /> Late
          </span>
          <span className="text-xl font-black text-amber-900">{todayData?.lateCount || 0}</span>
        </div>

        <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 shadow-sm">
          <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider block flex items-center gap-1">
            <AlertCircle size={12} /> Leave
          </span>
          <span className="text-xl font-black text-purple-900">{todayData?.leaveCount || 0}</span>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">Not Marked</span>
          <span className="text-xl font-black text-gray-800">{todayData?.notMarkedCount || 0}</span>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 shadow-sm">
          <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">Attendance %</span>
          <span className="text-xl font-black text-blue-900">{todayData?.attendancePercentage || 0}%</span>
        </div>
      </div>

      {/* TOOLBAR & CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* READ-ONLY SESSION DISPLAY & DATE NAVIGATOR */}
          <div className="flex flex-wrap items-center gap-3">
            {/* READ-ONLY SESSION INDICATOR */}
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">SESSION:</span>
              <span className="text-slate-900 font-extrabold flex items-center gap-1">
                {allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill Session' : 'Technical Session'}
                <Lock size={12} className="text-slate-400" title="Session type is locked based on your logged-in trainer role" />
              </span>
            </div>

            {/* DATE NAVIGATOR */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={handlePreviousDay}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value > todayStr) {
                    toast.error('Cannot select a future date.');
                    return;
                  }
                  setSelectedDate(e.target.value);
                }}
                className="bg-white border border-gray-200 text-xs font-bold text-gray-800 px-2 py-1 rounded-lg focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                disabled={selectedDate >= todayStr}
                onClick={handleNextDay}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
              {!isToday && (
                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="btn-outline text-[11px] py-1 px-2 font-bold text-red-600 border-red-200 hover:bg-red-50"
                >
                  Today
                </button>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 flex-wrap">
            {todayData && todayData.notMarkedCount > 0 && (
              <button
                type="button"
                onClick={() => setBulkConfirmModalOpen(true)}
                className="btn-primary text-xs font-bold py-2 px-3.5 shadow-md shadow-red-200 flex items-center gap-1.5"
              >
                <UserCheck size={15} />
                <span>Mark All Present ({todayData.notMarkedCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenHistoryModal}
              className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5"
            >
              <FileSpreadsheet size={15} />
              <span>Attendance History</span>
            </button>

            <button
              type="button"
              onClick={fetchAttendanceData}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
              title="Refresh Attendance Roster"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* SEARCH, FILTER & SORT BAR */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student by name, ID or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1">
              <Filter size={13} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">🟢 Present</option>
                <option value="ABSENT">🔴 Absent</option>
                <option value="LATE">🟠 Late</option>
                <option value="LEAVE">🟣 Leave</option>
                <option value="NOT_MARKED">⚪ Not Marked</option>
                <option value="ONLY_UNMARKED">⚠️ Only Unmarked</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <ArrowUpDown size={13} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white"
              >
                <option value="nameAZ">Name (A-Z)</option>
                <option value="nameZA">Name (Z-A)</option>
                <option value="lowestAtt">Lowest Attendance %</option>
                <option value="highestAtt">Highest Attendance %</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT ATTENDANCE ROSTER TABLE */}
      <div className="card overflow-hidden border border-gray-200 shadow-sm">
        {loading ? (
          <LoadingState message="Fetching student attendance records from MongoDB..." />
        ) : apiError ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-full border border-red-100">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Attendance Server Error</h3>
            <p className="text-xs text-gray-600 max-w-md">{apiError}</p>
            <button
              type="button"
              onClick={fetchAttendanceData}
              className="btn-primary text-xs font-bold py-1.5 px-4 mt-2 flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table text-xs">
              <thead>
                <tr>
                  <th>Student Name & Email</th>
                  <th>Student ID</th>
                  <th>{allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill Attendance' : 'Technical Attendance'}</th>
                  <th>Remarks</th>
                  <th>Monthly Attendance %</th>
                  <th>Total Sessions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(stu => {
                    const status = stu.todayStatus;
                    return (
                      <tr key={stu.studentId} className="hover:bg-gray-50/80 transition">
                        <td>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{stu.studentName}</span>
                              {stu.lowAttendanceWarning && (
                                <span
                                  className="badge-red text-[10px] font-extrabold px-1.5 py-0.2 inline-flex items-center gap-0.5"
                                  title="Low Attendance Alert (< 75%)"
                                >
                                  <AlertTriangle size={10} /> Low Att.
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-gray-500 font-mono">{stu.studentEmail}</p>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {stu.studentId}
                          </span>
                        </td>
                        <td>
                          {status === 'PRESENT' && (
                            <span className="badge-green font-extrabold px-2.5 py-1 inline-flex items-center gap-1">
                              🟢 {allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill' : 'Technical'}: PRESENT
                            </span>
                          )}
                          {status === 'ABSENT' && (
                            <span className="badge-red font-extrabold px-2.5 py-1 inline-flex items-center gap-1">
                              🔴 {allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill' : 'Technical'}: ABSENT
                            </span>
                          )}
                          {status === 'LATE' && (
                            <span className="badge-amber font-extrabold px-2.5 py-1 inline-flex items-center gap-1">
                              🟠 {allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill' : 'Technical'}: LATE
                            </span>
                          )}
                          {status === 'LEAVE' && (
                            <span className="badge-purple font-extrabold px-2.5 py-1 inline-flex items-center gap-1">
                              🟣 {allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill' : 'Technical'}: LEAVE
                            </span>
                          )}
                          {status === 'NOT MARKED' && (
                            <span className="badge-gray font-extrabold px-2.5 py-1 inline-flex items-center gap-1">
                              ⚪ {allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill' : 'Technical'}: NOT MARKED
                            </span>
                          )}
                        </td>
                        <td>
                          {stu.todayRemarks ? (
                            <span className="text-gray-700 italic font-medium">{stu.todayRemarks}</span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                              <div
                                className={`h-full ${
                                  stu.overallAttendancePercentage >= 75
                                    ? 'bg-emerald-500'
                                    : stu.overallAttendancePercentage >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, stu.overallAttendancePercentage)}%` }}
                              />
                            </div>
                            <span className={`font-black ${
                              stu.overallAttendancePercentage >= 75
                                ? 'text-emerald-700'
                                : stu.overallAttendancePercentage >= 60
                                ? 'text-amber-700'
                                : 'text-red-700'
                            }`}>
                              {stu.overallAttendancePercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="font-bold text-gray-800">
                          {stu.presentSessions} / {stu.totalSessions}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(stu)}
                              className="btn-primary text-[11px] font-bold py-1 px-2.5 flex items-center gap-1"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenMonthlyReport(stu)}
                              className="btn-outline text-[11px] font-bold py-1 px-2.5 flex items-center gap-1"
                              title="View Monthly Attendance Report"
                            >
                              <Eye size={12} />
                              <span>Monthly Report</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-0">
                      <EmptyState
                        icon={Users}
                        title="No Students Found"
                        description={
                          searchQuery
                            ? "No students match your search query or status filter."
                            : "No active students found in your assigned trainer batch."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PER-STUDENT EDIT ATTENDANCE MODAL */}
      {editModalOpen && selectedStudentForEdit && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>{allowedSessionType === 'SOFT_SKILL' ? 'Edit Soft Skill Attendance' : 'Edit Technical Attendance'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update status for <strong>{selectedStudentForEdit.studentName}</strong> on <strong>{selectedDate}</strong>
                </p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditAttendance}>
              <div className="modal-body p-6 flex flex-col gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-900">{selectedStudentForEdit.studentName}</p>
                  <p className="text-[11px] text-gray-500 font-mono">{selectedStudentForEdit.studentEmail} • ID: {selectedStudentForEdit.studentId}</p>
                </div>

                <div className="form-group">
                  <label className="form-label font-bold text-gray-800">Attendance Status *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, status: 'PRESENT' })}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                        editFormData.status === 'PRESENT'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>🟢 PRESENT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, status: 'ABSENT' })}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                        editFormData.status === 'ABSENT'
                          ? 'bg-red-50 border-red-500 text-red-800 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>🔴 ABSENT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, status: 'LATE' })}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                        editFormData.status === 'LATE'
                          ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>🟠 LATE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, status: 'LEAVE' })}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                        editFormData.status === 'LEAVE'
                          ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>🟣 LEAVE</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label font-bold text-gray-800">Faculty Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Joined 10 mins late / Medical Leave"
                    value={editFormData.remarks}
                    onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn-outline font-bold text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn-primary font-bold text-xs py-2 px-4 shadow-md shadow-red-200 flex items-center gap-1.5"
                >
                  {submittingEdit ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Check size={16} />}
                  <span>Save Attendance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK MARK ALL PRESENT CONFIRMATION MODAL */}
      {bulkConfirmModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">Confirm Bulk Attendance</h3>
              </div>
              <button onClick={() => setBulkConfirmModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-3 text-xs">
              <p className="text-sm font-bold text-gray-900">
                Mark all remaining students as Present?
              </p>
              <p className="text-gray-600 leading-relaxed">
                This action will mark <strong>{todayData?.notMarkedCount}</strong> currently unmarked students as <strong>PRESENT</strong> for session <strong>{allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill' : 'Technical'}</strong> on <strong>{selectedDate}</strong>.
              </p>
              <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] font-medium">
                Note: Students already marked as ABSENT, LATE, or LEAVE will not be overwritten.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setBulkConfirmModalOpen(false)} className="btn-outline font-bold text-xs">
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingBulk}
                onClick={handleConfirmBulkMarkAllPresent}
                className="btn-primary font-bold text-xs py-2 px-4 shadow-md shadow-red-200 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {submittingBulk ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <CheckCircle2 size={16} />}
                <span>Yes, Mark All Present</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT MONTHLY ATTENDANCE DASHBOARD MODAL */}
      {monthlyModalOpen && selectedStudentForMonthly && (
        <div className="modal-backdrop">
          <div className="modal max-w-4xl">
            <div className="modal-header bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill Monthly Attendance' : 'Technical Monthly Attendance'}</span>
                  <span className="badge-purple text-[10px] font-bold px-2 py-0.5">{selectedStudentForMonthly.studentName}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  ID: {selectedStudentForMonthly.studentId} • Email: {selectedStudentForMonthly.studentEmail}
                </p>
              </div>
              <button onClick={() => setMonthlyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-6">
              {/* MONTH / YEAR SELECTOR */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-red-600" />
                  <span className="font-bold text-gray-800">Select Month & Year:</span>
                  <select
                    value={monthlyMonth}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setMonthlyMonth(m);
                      fetchStudentMonthlyData(selectedStudentForMonthly.studentId, m, monthlyYear);
                    }}
                    className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-800"
                  >
                    <option value={1}>January</option>
                    <option value={2}>February</option>
                    <option value={3}>March</option>
                    <option value={4}>April</option>
                    <option value={5}>May</option>
                    <option value={6}>June</option>
                    <option value={7}>July</option>
                    <option value={8}>August</option>
                    <option value={9}>September</option>
                    <option value={10}>October</option>
                    <option value={11}>November</option>
                    <option value={12}>December</option>
                  </select>

                  <select
                    value={monthlyYear}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      setMonthlyYear(y);
                      fetchStudentMonthlyData(selectedStudentForMonthly.studentId, monthlyMonth, y);
                    }}
                    className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-800"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>

                {monthlyData && (
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">Monthly Attendance Rate:</span>
                    <span className={`text-base font-black px-3 py-1 rounded-xl ${
                      monthlyData.attendancePercentage >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {monthlyData.attendancePercentage}%
                    </span>
                  </div>
                )}
              </div>

              {loadingMonthly ? (
                <LoadingState message="Fetching student monthly report from MongoDB..." />
              ) : monthlyData ? (
                <>
                  {/* MONTHLY SUMMARY CARDS */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Sessions</span>
                      <span className="text-lg font-black text-gray-900">{monthlyData.totalSessions}</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 block">Present</span>
                      <span className="text-lg font-black text-emerald-900">{monthlyData.presentCount}</span>
                    </div>

                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                      <span className="text-[10px] font-bold uppercase text-red-600 block">Absent</span>
                      <span className="text-lg font-black text-red-900">{monthlyData.absentCount}</span>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-[10px] font-bold uppercase text-amber-600 block">Late</span>
                      <span className="text-lg font-black text-amber-900">{monthlyData.lateCount}</span>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-[10px] font-bold uppercase text-purple-600 block">Leave</span>
                      <span className="text-lg font-black text-purple-900">{monthlyData.leaveCount}</span>
                    </div>
                  </div>

                  {/* DAILY CALENDAR BREAKDOWN TABLE */}
                  <div className="card overflow-hidden border border-gray-200">
                    <div className="table-wrapper max-h-[350px]">
                      <table className="table text-xs">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Session Type</th>
                            <th>Attendance Status</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyData.dailyRecords && monthlyData.dailyRecords.length > 0 ? (
                            monthlyData.dailyRecords.map(rec => (
                              <tr key={rec.date}>
                                <td className="font-bold text-gray-900">{rec.date}</td>
                                <td>
                                  <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                    {allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill' : 'Technical'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge font-bold px-2 py-0.5 ${
                                    rec.overallStatus === 'PRESENT' ? 'badge-green' :
                                    rec.overallStatus === 'ABSENT' ? 'badge-red' :
                                    rec.overallStatus === 'LATE' ? 'badge-amber' :
                                    rec.overallStatus === 'LEAVE' ? 'badge-purple' : 'badge-gray'
                                  }`}>
                                    {rec.overallStatus}
                                  </span>
                                </td>
                                <td className="text-gray-600 italic font-medium">{rec.remarks || '—'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="p-0">
                                <EmptyState icon={Calendar} title="No Monthly Records" description="No attendance records found for this month." />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState icon={Calendar} title="No Attendance Found" description="No monthly attendance records available." />
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setMonthlyModalOpen(false)} className="btn-outline font-bold text-xs">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE HISTORY REVIEW MODAL */}
      {historyModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-3xl">
            <div className="modal-header bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-red-400" />
                  <span>{allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill Attendance History' : 'Technical Attendance History'}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Inspect past date attendance logs</p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-4 text-xs">
              <div className="flex flex-wrap items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">Select Date:</span>
                  <input
                    type="date"
                    max={todayStr}
                    value={historyDate}
                    onChange={(e) => {
                      setHistoryDate(e.target.value);
                      fetchHistoryData(e.target.value);
                    }}
                    className="bg-white border border-gray-200 text-xs font-bold text-gray-800 px-2 py-1 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold">
                  <Lock size={12} className="text-slate-500" />
                  <span>Session: {allowedSessionType === 'SOFT_SKILL' ? 'Soft Skill' : 'Technical'}</span>
                </div>
              </div>

              {loadingHistory ? (
                <LoadingState message="Loading historical attendance log..." />
              ) : historyData ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Total</span>
                      <span className="text-base font-black text-gray-900">{historyData.totalStudents}</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present</span>
                      <span className="text-base font-black text-emerald-900">{historyData.presentCount}</span>
                    </div>
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-[10px] uppercase font-bold text-red-600 block">Absent</span>
                      <span className="text-base font-black text-red-900">{historyData.absentCount}</span>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-blue-600 block">Attendance %</span>
                      <span className="text-base font-black text-blue-900">{historyData.attendancePercentage}%</span>
                    </div>
                  </div>

                  <div className="card overflow-hidden border border-gray-200 max-h-[300px]">
                    <div className="table-wrapper">
                      <table className="table text-xs">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Status</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyData.students && historyData.students.length > 0 ? (
                            historyData.students.map(s => (
                              <tr key={s.studentId}>
                                <td>
                                  <p className="font-bold text-gray-900">{s.studentName}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{s.studentId}</p>
                                </td>
                                <td>
                                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                    s.todayStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                                    s.todayStatus === 'ABSENT' ? 'bg-red-100 text-red-800' :
                                    s.todayStatus === 'LATE' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {s.todayStatus}
                                  </span>
                                </td>
                                <td className="text-gray-600 italic font-medium">{s.todayRemarks || '—'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="p-0">
                                <EmptyState icon={Calendar} title="No History Records" description="No attendance logs found for this date." />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState icon={Calendar} title="No History Data" description="No historical attendance available." />
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setHistoryModalOpen(false)} className="btn-outline font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
