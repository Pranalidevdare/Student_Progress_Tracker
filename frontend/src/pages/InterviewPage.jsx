import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInterviewByStudent } from '../api/api';
import StatCard from '../components/StatCard';
import { MdVideoCall, MdPerson, MdEvent, MdCheckCircle } from 'react-icons/md';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function InterviewPage() {
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
    getInterviewByStudent(user.studentId)
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load interview status.'))
      .finally(() => setLoading(false));
  }, [user?.studentId]);

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading interview details…</p></div>;

  const interview = Array.isArray(data) ? data[0] : data;

  if (error || !interview)
    return (
      <>
        <div className="page-header">
          <div>
            <h1 className="page-title">Mock &amp; Technical Interviews</h1>
            <p className="page-subtitle">Track your mock interview evaluations and feedback scores</p>
          </div>
        </div>
        <div className="state-container card">
          <MdVideoCall className="state-icon" />
          <p className="state-title">No interview records scheduled</p>
          <p className="state-desc">You do not have any mock or placement interviews assigned yet.</p>
        </div>
      </>
    );

  const {
    interviewType = 'Technical',
    interviewDate,
    trainerName,
    status = 'SCHEDULED',
    technicalScore = 0,
    communicationScore = 0,
    problemSolvingScore = 0,
    overallRating = 0,
    feedback = '',
  } = interview;

  const chartData = [
    { subject: 'Technical', score: technicalScore },
    { subject: 'Communication', score: communicationScore },
    { subject: 'Problem Solving', score: problemSolvingScore },
    { subject: 'Overall', score: overallRating },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Interview Feedback &amp; Evaluation</h1>
          <p className="page-subtitle">Track interview readiness, mentor ratings, and improvement points</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Interview Type" value={interviewType} sub={status} icon={MdVideoCall} color="navy" />
        <StatCard title="Interviewer" value={trainerName || 'Assigned Mentor'} sub="Trainer" icon={MdPerson} color="info" />
        <StatCard title="Scheduled Date" value={fmtDate(interviewDate)} sub="Date" icon={MdEvent} color="primary" />
        <StatCard title="Overall Score" value={overallRating ? `${overallRating}/100` : 'Pending'} sub="Rating" icon={MdCheckCircle} color={overallRating >= 70 ? 'success' : 'warning'} />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Score Radar</span></div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <RadarChart data={chartData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#1A2744" fill="#1A2744" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header"><span className="card-title">Trainer Feedback &amp; Remarks</span></div>
            {feedback ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.7, background: 'var(--color-bg)', padding: 16, borderRadius: 8 }}>
                "{feedback}"
              </p>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>No written feedback recorded yet.</p>
            )}
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
              <span>Technical Skills</span>
              <span className="font-bold">{technicalScore}/100</span>
            </div>
            <div className="progress-bar-wrap mb-4">
              <div className="progress-bar-fill" style={{ width: `${technicalScore}%` }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
              <span>Communication</span>
              <span className="font-bold">{communicationScore}/100</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill success" style={{ width: `${communicationScore}%` }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
