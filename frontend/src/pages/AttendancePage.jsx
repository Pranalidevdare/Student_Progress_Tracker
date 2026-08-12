import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAttendanceByStudent } from '../api/api';
import StatCard from '../components/StatCard';
import { MdCheckCircle, MdCancel, MdAccessTime, MdEventNote } from 'react-icons/md';

const statusBadge = (st = '') => {
  const s = st.toUpperCase();
  if (s === 'PRESENT') return <span className="badge badge-success">PRESENT</span>;
  if (s === 'ABSENT')  return <span className="badge badge-danger">ABSENT</span>;
  if (s === 'LATE')    return <span className="badge badge-warning">LATE</span>;
  if (s === 'EXCUSED') return <span className="badge badge-info">EXCUSED</span>;
  return <span className="badge badge-neutral">{st}</span>;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' }) : '—';

export default function AttendancePage() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user?.studentId) {
      setError('Student ID missing.');
      setLoading(false);
      return;
    }
    getAttendanceByStudent(user.studentId)
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load attendance records.'))
      .finally(() => setLoading(false));
  }, [user?.studentId]);

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading attendance…</p></div>;
  if (error)   return <div className="state-container"><p className="state-title" style={{ color: 'var(--color-danger)' }}>{error}</p></div>;

  const records     = data?.records || data || [];
  const totalDays   = records.length;
  const presentDays = records.filter(r => r.status === 'PRESENT').length;
  const absentDays  = records.filter(r => r.status === 'ABSENT').length;
  const lateDays    = records.filter(r => r.status === 'LATE').length;
  const pct         = totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Tracker</h1>
          <p className="page-subtitle">View your daily attendance history and compliance percentage</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Attendance Rate" value={`${pct}%`} sub="Target: > 85%" icon={MdCheckCircle} color={pct >= 85 ? 'success' : 'warning'} />
        <StatCard title="Total Classes" value={totalDays} sub="Sessions held" icon={MdEventNote} color="navy" />
        <StatCard title="Days Present" value={presentDays} sub="Attended" icon={MdCheckCircle} color="success" />
        <StatCard title="Days Absent" value={absentDays} sub="Missed" icon={MdCancel} color="danger" />
        <StatCard title="Days Late" value={lateDays} sub="Late entries" icon={MdAccessTime} color="warning" />
      </div>

      <div className="card mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Attendance Progress</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: pct >= 85 ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar-wrap" style={{ height: 12 }}>
          <div className={`progress-bar-fill ${pct >= 85 ? 'success' : pct >= 70 ? 'warning' : 'danger'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Daily Attendance Logs</span></div>
        {records.length ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id || i}>
                    <td>{i + 1}</td>
                    <td className="font-medium">{fmtDate(r.date || r.attendanceDate)}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td className="text-muted">{r.remarks || r.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="state-container" style={{ padding: 40 }}>
            <MdEventNote className="state-icon" />
            <p className="state-title">No attendance records found</p>
          </div>
        )}
      </div>
    </>
  );
}
