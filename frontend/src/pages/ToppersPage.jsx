import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllToppers, getToppersByBatch } from '../api/api';
import { MdEmojiEvents, MdStar } from 'react-icons/md';

export default function ToppersPage() {
  const { user } = useAuth();
  const [toppers, setToppers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState('ALL');

  useEffect(() => {
    setLoading(true);
    const fetcher = tab === 'BATCH' && user?.batchId
      ? getToppersByBatch(user.batchId)
      : getAllToppers();

    fetcher
      .then((r) => setToppers(r.data || []))
      .catch(() => setError('Failed to load toppers leaderboard.'))
      .finally(() => setLoading(false));
  }, [tab, user?.batchId]);

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading leaderboard…</p></div>;

  const top3 = toppers.slice(0, 3);
  const rest = toppers.slice(3);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Toppers &amp; Leaderboard</h1>
          <p className="page-subtitle">Recognizing high performers, top rankers, and academic achievers</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'ALL' ? 'active' : ''}`} onClick={() => setTab('ALL')}>Overall Leaders</button>
        {user?.batchId && (
          <button className={`tab ${tab === 'BATCH' ? 'active' : ''}`} onClick={() => setTab('BATCH')}>My Batch</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {top3.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, marginBottom: 32 }}>
          {/* Rank 2 */}
          {top3[1] && (
            <div className="card" style={{ width: 220, textAlign: 'center', padding: '20px 14px', borderTop: '4px solid #A0AEC0' }}>
              <div style={{ fontSize: '1.8rem', color: '#A0AEC0', marginBottom: 6 }}>🥈</div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{top3[1].studentName || top3[1].fullName}</h3>
              <span className="badge badge-navy" style={{ margin: '6px 0' }}>Rank #2</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {top3[1].score || top3[1].percentage}%
              </p>
            </div>
          )}

          {/* Rank 1 */}
          {top3[0] && (
            <div className="card" style={{ width: 240, textAlign: 'center', padding: '28px 16px', borderTop: '4px solid #F47920', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ fontSize: '2.4rem', color: '#F47920', marginBottom: 6 }}>🥇</div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800 }}>{top3[0].studentName || top3[0].fullName}</h3>
              <span className="badge badge-primary" style={{ margin: '8px 0' }}>Rank #1</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {top3[0].score || top3[0].percentage}%
              </p>
            </div>
          )}

          {/* Rank 3 */}
          {top3[2] && (
            <div className="card" style={{ width: 220, textAlign: 'center', padding: '20px 14px', borderTop: '4px solid #ED8936' }}>
              <div style={{ fontSize: '1.8rem', color: '#ED8936', marginBottom: 6 }}>🥉</div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{top3[2].studentName || top3[2].fullName}</h3>
              <span className="badge badge-warning" style={{ margin: '6px 0' }}>Rank #3</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {top3[2].score || top3[2].percentage}%
              </p>
            </div>
          )}
        </div>
      )}

      {toppers.length ? (
        <div className="card">
          <div className="card-header"><span className="card-title">Full Leaderboard</span></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Batch</th>
                  <th>Performance %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {toppers.map((t, idx) => {
                  const isYou = t.studentId === user?.studentId || t.email === user?.email;
                  return (
                    <tr key={t.id || idx} style={isYou ? { background: 'var(--color-primary-50)', fontWeight: 600 } : {}}>
                      <td>
                        <span className={`badge ${idx === 0 ? 'badge-primary' : idx === 1 ? 'badge-navy' : idx === 2 ? 'badge-warning' : 'badge-neutral'}`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="font-medium">
                        {t.studentName || t.fullName} {isYou && <span className="badge badge-primary" style={{ marginLeft: 6 }}>You</span>}
                      </td>
                      <td className="text-muted">{t.batchName || `Batch #${t.batchId || '—'}`}</td>
                      <td className="font-bold text-primary">{t.score || t.percentage}%</td>
                      <td>
                        <span className="badge badge-success">EXCELLENT</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="state-container card">
          <MdEmojiEvents className="state-icon" />
          <p className="state-title">No toppers data recorded</p>
        </div>
      )}
    </>
  );
}
