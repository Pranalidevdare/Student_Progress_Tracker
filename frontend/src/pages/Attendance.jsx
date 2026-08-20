import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMyAttendance,
  getAttendanceByBatch,
  markAttendance,
  updateAttendance
} from '../api/attendanceApi';
import api from '../api/axios';
import { CalendarCheck, Plus, CheckCircle2, XCircle, Clock, AlertCircle, X, Check, ShieldCheck, Lock, User, RefreshCw, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Attendance() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');
  
  const studentId = user?.id || user?.studentId || user?.email || '';
  const studentName = user?.fullName || 'Student';
  const trainerId = user?.id || user?.trainerId || localStorage.getItem('trainerId') || '';
  const defaultBatchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || '';

  const [batchId, setBatchId] = useState(defaultBatchId);
  const [batches, setBatches] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // Modal State for Trainers/Admins only
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    trainerId: trainerId,
    batchId: defaultBatchId,
    attendanceDate: new Date().toISOString().split('T')[0],
    sessionType: 'TECHNICAL',
    status: 'PRESENT',
    remarks: 'Class attendance recorded'
  });

  useEffect(() => {
    // Load active batches and enrolled students for faculty/admin
    if (!isStudent) {
      api.get('/batches/active')
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setBatches(res.data);
            if (!batchId) {
              setBatchId(res.data[0].id || res.data[0].batchName || '');
            }
          }
        })
        .catch(() => {});

      api.get('/students')
        .then(res => {
          if (Array.isArray(res.data)) {
            setEnrolledStudents(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isStudent]);

  useEffect(() => {
    fetchAttendance();
  }, [batchId]);

  const fetchAttendance = async () => {
    if (!batchId && !isStudent) {
      setRecords([]);
      return;
    }
    setLoading(true);
    setHasError(false);
    setErrorMessage('');
    try {
      if (isStudent) {
        const res = await getMyAttendance();
        const data = res?.data || {};
        if (data.records && Array.isArray(data.records)) {
          setRecords(data.records);
        } else if (Array.isArray(data)) {
          setRecords(data);
        } else {
          setRecords([]);
        }
      } else {
        const activeBatch = batchId || defaultBatchId || 'BATCH001';
        const res = await getAttendanceByBatch(activeBatch);
        if (res && res.data && Array.isArray(res.data)) {
          setRecords(res.data);
        } else {
          setRecords([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      if (err.response?.status === 404) {
        setRecords([]);
      } else {
        setHasError(true);
        setErrorMessage(
          err.response?.data?.message ||
          (err.code === 'ERR_NETWORK' || err.message?.includes('Network')
            ? 'Backend server is unavailable. Please check if Spring Boot is running.'
            : 'Unable to load attendance records.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMarkModal = () => {
    setEditingId(null);
    const firstStudent = enrolledStudents[0];
    const sId = firstStudent?.id || firstStudent?.studentId || '';
    const sName = firstStudent ? `${firstStudent.firstName || ''} ${firstStudent.lastName || ''}`.trim() || firstStudent.email : '';
    const sBatch = firstStudent?.batchId || batchId || defaultBatchId || '';

    setFormData({
      studentId: sId,
      studentName: sName,
      trainerId: trainerId || user?.id || '',
      batchId: sBatch,
      attendanceDate: new Date().toISOString().split('T')[0],
      sessionType: user?.trainerType === 'SOFT_SKILLS' ? 'SOFT_SKILL' : 'TECHNICAL',
      status: 'PRESENT',
      remarks: 'Class attendance recorded'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      studentId: item.studentId || '',
      studentName: item.studentName || '',
      trainerId: item.trainerId || trainerId,
      batchId: item.batchId || batchId,
      attendanceDate: item.attendanceDate || new Date().toISOString().split('T')[0],
      sessionType: item.sessionType || 'TECHNICAL',
      status: item.status || 'PRESENT',
      remarks: item.remarks || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast.error('Please select a student from the list');
      return;
    }
    if (!formData.attendanceDate) {
      toast.error('Please select a valid attendance date');
      return;
    }

    setSubmitting(true);

    const payload = {
      studentId: formData.studentId,
      trainerId: formData.trainerId || trainerId || 'TRN001',
      batchId: formData.batchId || batchId || defaultBatchId || 'BATCH001',
      attendanceDate: formData.attendanceDate,
      sessionType: formData.sessionType || 'TECHNICAL',
      status: formData.status || 'PRESENT',
      remarks: formData.remarks?.trim() || 'Class attendance recorded'
    };

    try {
      if (editingId) {
        await updateAttendance(editingId, payload);
        toast.success('Attendance updated successfully');
      } else {
        await markAttendance(payload);
        toast.success(`Attendance marked for ${formData.studentName || 'student'}`);
      }
      setModalOpen(false);
      await fetchAttendance();
    } catch (err) {
      console.error('Failed to save attendance:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save attendance record';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <span className="badge-green flex items-center gap-1"><CheckCircle2 size={12} /> Present</span>;
      case 'ABSENT':
        return <span className="badge-red flex items-center gap-1"><XCircle size={12} /> Absent</span>;
      case 'LATE':
        return <span className="badge-yellow flex items-center gap-1"><Clock size={12} /> Late</span>;
      case 'LEAVE':
        return <span className="badge-blue flex items-center gap-1"><AlertCircle size={12} /> Leave</span>;
      default:
        return <span className="badge-gray">{status || 'N/A'}</span>;
    }
  };

  // Display records
  const displayRecords = records;

  // Calculate Student Personal Attendance Analytics
  const totalDays = displayRecords.length;
  const presentDays = displayRecords.filter(r => r.status === 'PRESENT').length;
  const lateDays = displayRecords.filter(r => r.status === 'LATE').length;
  const absentDays = displayRecords.filter(r => r.status === 'ABSENT').length;
  const attendancePct = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{isStudent ? 'My Personal Attendance Record' : 'Daily Attendance Tracker'}</h1>
          <p className="page-subtitle">
            {isStudent ? 'View your official faculty-verified daily class attendance log' : 'Mark and view daily student attendance logs per batch'}
          </p>
        </div>

        {isStudent ? (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs">
            <Lock size={14} className="text-slate-500" />
            <span>Read-Only View (Faculty Verified)</span>
          </div>
        ) : (
          <button onClick={handleOpenMarkModal} className="btn-primary shadow-md shadow-red-200 font-bold">
            <Plus size={18} />
            <span>Record Attendance</span>
          </button>
        )}
      </div>

      {/* Student Personal Attendance Analytics Banner */}
      {isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col justify-between shadow-md">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-100">Overall Attendance</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black">{attendancePct}%</span>
              <span className="text-xs text-emerald-200 font-semibold">Target: 80%</span>
            </div>
          </div>

          <div className="card p-4 border-emerald-100 bg-emerald-50/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Days Present</span>
            <span className="text-2xl font-black text-emerald-700 mt-1">{presentDays} Days</span>
          </div>

          <div className="card p-4 border-amber-100 bg-amber-50/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Days Late</span>
            <span className="text-2xl font-black text-amber-700 mt-1">{lateDays} Days</span>
          </div>

          <div className="card p-4 border-red-100 bg-red-50/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800">Days Absent</span>
            <span className="text-2xl font-black text-red-700 mt-1">{absentDays} Days</span>
          </div>
        </div>
      )}

      {/* Batch Header Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-bold">
            <CalendarCheck size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              {isStudent ? `Personal Attendance Log for ${studentName}` : 'Batch Attendance Log'}
            </h3>
            <p className="text-xs text-gray-400">Total Entries Logged: {displayRecords.length}</p>
          </div>
        </div>

        {!isStudent && batches.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Batch:</span>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="form-input py-1 text-xs font-mono font-bold"
            >
              {batches.map(b => (
                <option key={b.id || b.batchName} value={b.id || b.batchName}>
                  {b.batchName || b.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Attendance Table / Content */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="spinner w-8 h-8 border-red-600 mx-auto" />
          <p className="text-xs text-gray-400 mt-3 font-semibold">Loading attendance logs...</p>
        </div>
      ) : hasError ? (
        <div className="card p-12 text-center bg-red-50/40 border border-red-200 space-y-3">
          <ShieldAlert size={24} className="text-red-600 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">Unable to load attendance records</h3>
          <p className="text-xs text-red-700">{errorMessage || 'Please check server connection and try again.'}</p>
          <button onClick={fetchAttendance} className="btn bg-red-600 text-white text-xs font-bold px-4 py-2 mx-auto flex items-center gap-1.5 shadow">
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      ) : displayRecords.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="table-wrapper">
            <table className="table w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500 tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                  {!isStudent && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {displayRecords.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-700">{item.attendanceDate || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-800">{item.studentId || 'N/A'}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{item.studentName || 'Student'}</td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-gray-500">{item.remarks || '—'}</td>
                    {!isStudent && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="text-xs text-red-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 space-y-3">
          <CalendarCheck size={28} className="text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No Attendance Records Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {isStudent
              ? 'No attendance has been logged for your account in this batch yet.'
              : 'No attendance records recorded for this batch. Click "Record Attendance" to create entries.'}
          </p>
        </div>
      )}

      {/* Modal for Mark / Edit Attendance */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-md">
            <div className="modal-header">
              <h3 className="text-sm font-bold text-gray-900">
                {editingId ? 'Edit Attendance Entry' : 'Record Daily Attendance'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="form-group">
                <label className="form-label">Select Student</label>
                {enrolledStudents.length > 0 ? (
                  <select
                    value={formData.studentId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selected = enrolledStudents.find(
                        s => s.id === selectedId || s.studentId === selectedId
                      );
                      setFormData(prev => ({
                        ...prev,
                        studentId: selectedId,
                        studentName: selected ? `${selected.firstName || ''} ${selected.lastName || ''}`.trim() || selected.email : prev.studentName,
                        batchId: selected?.batchId || prev.batchId
                      }));
                    }}
                    className="form-input"
                    required
                  >
                    <option value="">Select Student...</option>
                    {enrolledStudents.map((s, idx) => {
                      const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || `Student ${idx + 1}`;
                      const idLabel = s.studentId ? ` (${s.studentId})` : ` (${s.id?.substring(0, 8)}...)`;
                      return <option key={s.id || idx} value={s.id || s.studentId}>{name}{idLabel}</option>;
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="Enter Student ID or Email"
                    className="form-input"
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Attendance Date</label>
                <input
                  type="date"
                  required
                  value={formData.attendanceDate}
                  onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="form-input font-bold"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LEAVE">LEAVE</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Optional remarks"
                  className="form-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn bg-gray-100 text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Recording...' : editingId ? 'Update Record' : 'Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
