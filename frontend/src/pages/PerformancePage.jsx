import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPerformance } from '../api/api';
import StatCard from '../components/StatCard';
import { MdBarChart, MdEmojiEvents, MdCheckCircle, MdQuiz } from 'react-icons/md';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const scoreColor = (v = 0) => (v >= 80 ? 'success' : v >= 60 ? 'warning' : 'danger');

export default function PerformancePage() {
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
    getPerformance(user.studentId)
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load performance metrics.'))
      .finally(() => setLoading(false));
  }, [user?.studentId]);

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading performance…</p></div>;
  if (error)   return <div className="state-container"><p className="state-title" style={{ color: 'var(--color-danger)' }}>{error}</p></div>;

  const {
    overallPercentage = 0,
    currentRank = '—',
    attendancePercentage = 0,
    assignmentPercentage = 0,
    assessmentPercentage = 0,
    interviewScore = 0,
    status = 'AVERAGE',
    subjectScores = [],
  } = data || {};

  const radarData = [
    { subject: 'Attendance', score: attendancePercentage },
    { subject: 'Assignments', score: assignmentPercentage },
    { subject: 'Assessments', score: assessmentPercentage },
    { subject: 'Interview', score: interviewScore },
    ...(subjectScores.map(s => ({ subject: s.name || s.subject, score: s.score || s.percentage }))),
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Analytics</h1>
          <p className="page-subtitle">Comprehensive breakdown of academic and technical skill progress</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Overall Score" value={`${overallPercentage.toFixed(1)}%`} sub={status} icon={MdBarChart} color={scoreColor(overallPercentage)} />
        <StatCard title="Batch Standing" value={`#${currentRank}`} sub="Rank in batch" icon={MdEmojiEvents} color="navy" />
        <StatCard title="Attendance Rate" value={`${attendancePercentage.toFixed(1)}%`} sub="Compliance" icon={MdCheckCircle} color={scoreColor(attendancePercentage)} />
        <StatCard title="Assessment Avg" value={`${assessmentPercentage.toFixed(1)}%`} sub="Tests average" icon={MdQuiz} color={scoreColor(assessmentPercentage)} />
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Skill Breakdown Radar</span></div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Student" dataKey="score" stroke="#F47920" fill="#F47920" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Category Wise Performance</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Attendance Compliance', val: attendancePercentage },
              { label: 'Assignments Completed', val: assignmentPercentage },
              { label: 'Assessment Scores',     val: assessmentPercentage },
              { label: 'Interview Readiness',   val: interviewScore },
            ].map(({ label, val }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 500 }}>{label}</span>
                  <span className="font-bold">{val?.toFixed(1)}%</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className={`progress-bar-fill ${scoreColor(val)}`} style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {subjectScores.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Subject-wise Scores</span></div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={subjectScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <Tooltip />
                <Bar dataKey="score" fill="#1A2744" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}
