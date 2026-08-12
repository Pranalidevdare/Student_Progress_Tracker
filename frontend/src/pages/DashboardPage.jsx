import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../api/api';
import StatCard from '../components/StatCard';
import {
  MdCheckCircle, MdAssignment, MdQuiz, MdBarChart,
  MdMenuBook, MdNotifications, MdVideoCall, MdPeople, MdEmojiEvents,
} from 'react-icons/md';

const priorityBadge = (p = '') => {
  const m = { HIGH: 'badge-danger', MEDIUM: 'badge-warning', LOW: 'badge-info' };
  return m[p.toUpperCase()] || 'badge-neutral';
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
};

export default function DashboardPage() {
  const { user, updateStudentMeta } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const sid = user?.studentId;
    if (!sid) {
      setError(
        'Student ID not resolved. Please log out and sign in again to sync your student profile.'
      );
      setLoading(false);
      return;
    }
    getDashboard(sid)
      .then((r) => {
        setData(r.data);
        if (r.data?.student?.batchId) {
          updateStudentMeta(sid, r.data.student.batchId);
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data || '';
        setError(msg || 'Failed to load dashboard. Ensure the Spring Boot backend is active on port 8080.');
      })
      .finally(() => setLoading(false));
  }, [user?.studentId]);

  if (loading) {
    return (
      <div className="state-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p className="state-title">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container" style={{ minHeight: '60vh' }}>
        <p className="state-title" style={{ color: 'var(--color-danger)', maxWidth: 460, textAlign: 'center', lineHeight: 1.6 }}>
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="state-container">
        <p className="state-title">No data available</p>
      </div>
    );
  }

  const {
    student,
    attendancePercentage,
    totalAssignments,
    completedAssignments,
    pendingAssignments,
    totalAssessments,
    assessmentPercentage,
    overallPerformance,
    currentRank,
    performanceStatus,
    totalStudyMaterials,
    latestNotices,
    guestSessions,
    upcomingInterview,
  } = data;

  const statusBadgeClass = {
    EXCELLENT: 'badge-success',
    GOOD:      'badge-info',
    AVERAGE:   'badge-warning',
    POOR:      'badge-danger',
  };

  const studentFirstName = student?.firstName || user?.fullName?.split(' ')[0] || 'Student';

  return (
    <>
      {/* Refined Corporate Welcome Banner */}
      <div className="card mb-4" style={{
        borderLeft: '4px solid var(--color-primary)',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              InfoBeans Foundation Training Portal
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Good {greeting()}, {studentFirstName}! 👋
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Track your training progress, coursework compliance, and performance metrics.
          </p>
        </div>

        {performanceStatus && (
          <span
            className={`badge ${statusBadgeClass[performanceStatus] || 'badge-neutral'}`}
            style={{ fontSize: '0.75rem', padding: '6px 14px', borderRadius: 20 }}
          >
            Status: {performanceStatus}
          </span>
        )}
      </div>

      {/* Stat Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Attendance"
          value={attendancePercentage != null ? `${attendancePercentage.toFixed(1)}%` : '—'}
          sub="Overall attendance"
          icon={MdCheckCircle}
          color="primary"
        />
        <StatCard
          title="Assignments Completed"
          value={completedAssignments != null ? completedAssignments : '—'}
          sub={`${pendingAssignments ?? 0} pending · ${totalAssignments ?? 0} total`}
          icon={MdAssignment}
          color="primary"
        />
        <StatCard
          title="Assessment Average"
          value={assessmentPercentage != null ? `${assessmentPercentage.toFixed(1)}%` : '—'}
          sub={`${totalAssessments ?? 0} assessments`}
          icon={MdQuiz}
          color="primary"
        />
        <StatCard
          title="Overall Performance"
          value={overallPerformance != null ? `${overallPerformance.toFixed(1)}%` : '—'}
          sub={performanceStatus || 'Overall score'}
          icon={MdBarChart}
          color="primary"
        />
        <StatCard
          title="Batch Standing"
          value={currentRank != null ? `#${currentRank}` : '—'}
          sub="Rank in batch"
          icon={MdEmojiEvents}
          color="navy"
        />
        <StatCard
          title="Study Materials"
          value={totalStudyMaterials != null ? totalStudyMaterials : '—'}
          sub="Available resources"
          icon={MdMenuBook}
          color="info"
        />
      </div>

      {/* Widgets Grid */}
      <div className="grid-2" style={{ gap: 20 }}>
        {/* Latest Notices Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Latest Notices</span>
            <Link to="/notices" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {latestNotices?.length ? (
            <div>
              {latestNotices.slice(0, 4).map((notice) => (
                <div key={notice.id} style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--color-border-light)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{notice.title}</span>
                    <span className={`badge ${priorityBadge(notice.priority)}`} style={{ flexShrink: 0 }}>
                      {notice.priority || 'GENERAL'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {notice.description?.slice(0, 95)}{(notice.description?.length || 0) > 95 ? '…' : ''}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {fmtDate(notice.publishDate)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="state-container" style={{ padding: 24 }}>
              <MdNotifications className="state-icon" />
              <p className="state-title">No notices published</p>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Interview & Guest Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Upcoming Interview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Upcoming Interview</span>
              <Link to="/interviews" className="btn btn-ghost btn-sm">Details</Link>
            </div>
            {upcomingInterview ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Interview Type', val: upcomingInterview.interviewType },
                  { label: 'Date',           val: fmtDate(upcomingInterview.interviewDate) },
                  { label: 'Trainer / Evaluator', val: upcomingInterview.trainerName || '—' },
                  { label: 'Status',
                    val: (
                      <span className={`badge ${upcomingInterview.status === 'SCHEDULED' ? 'badge-info' : 'badge-success'}`}>
                        {upcomingInterview.status}
                      </span>
                    ),
                  },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="state-container" style={{ padding: 18 }}>
                <MdVideoCall className="state-icon" />
                <p className="state-title">No interview scheduled</p>
              </div>
            )}
          </div>

          {/* Guest Sessions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Guest Sessions</span>
              <Link to="/guest-sessions" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            {guestSessions?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {guestSessions.slice(0, 2).map((session) => (
                  <div key={session.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 32, height: 32,
                      background: 'var(--color-primary-light)',
                      borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-primary)', fontSize: '1rem', flexShrink: 0,
                    }}>
                      <MdPeople />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 1 }}>{session.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {session.speakerName} {session.companyName ? `· ${session.companyName}` : ''}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
                        {fmtDate(session.sessionDate)}{session.sessionTime ? ` · ${session.sessionTime}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="state-container" style={{ padding: 18 }}>
                <MdPeople className="state-icon" />
                <p className="state-title">No guest sessions available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
