import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllGuestSessions, getGuestSessionsByBatch } from '../api/api';
import { MdPeople, MdEvent, MdAccessTime, MdLocationOn, MdClose } from 'react-icons/md';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' }) : '—';

export default function GuestSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('ALL');

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetcher = tab === 'BATCH' && user?.batchId
      ? getGuestSessionsByBatch(user.batchId)
      : getAllGuestSessions();

    fetcher
      .then((r) => setSessions(r.data || []))
      .catch(() => setError('Failed to load guest sessions.'))
      .finally(() => setLoading(false));
  }, [tab, user?.batchId]);

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading guest sessions…</p></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Guest Sessions &amp; Workshops</h1>
          <p className="page-subtitle">Interact with industry leaders, domain experts, and tech mentors</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'ALL' ? 'active' : ''}`} onClick={() => setTab('ALL')}>All Sessions</button>
        {user?.batchId && (
          <button className={`tab ${tab === 'BATCH' ? 'active' : ''}`} onClick={() => setTab('BATCH')}>My Batch</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {sessions.length ? (
        <div className="grid-2" style={{ gap: 20 }}>
          {sessions.map((s) => (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'var(--color-primary-50)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
                  }}>
                    <MdPeople />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500, marginTop: 2 }}>
                      {s.speakerName} {s.designation ? `(${s.designation})` : ''}
                    </p>
                    {s.companyName && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.companyName}</p>}
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                  {s.description?.slice(0, 120)}{(s.description?.length || 0) > 120 ? '…' : ''}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MdEvent style={{ color: 'var(--color-primary)' }} />
                    <span>{fmtDate(s.sessionDate)}</span>
                  </div>
                  {s.sessionTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdAccessTime style={{ color: 'var(--color-info)' }} />
                      <span>{s.sessionTime}</span>
                    </div>
                  )}
                  {s.venue && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdLocationOn style={{ color: 'var(--color-danger)' }} />
                      <span>{s.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(s)}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="state-container card">
          <MdPeople className="state-icon" />
          <p className="state-title">No sessions found</p>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selected.title}</span>
              <button className="modal-close" onClick={() => setSelected(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-primary)' }}>{selected.speakerName}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {selected.designation} {selected.companyName ? `at ${selected.companyName}` : ''}
                </p>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: 16 }}>
                {selected.description}
              </p>
              <div style={{ background: 'var(--color-bg)', padding: 12, borderRadius: 8, fontSize: '0.8125rem' }}>
                <p><strong>Date:</strong> {fmtDate(selected.sessionDate)}</p>
                {selected.sessionTime && <p><strong>Time:</strong> {selected.sessionTime}</p>}
                {selected.venue && <p><strong>Venue/Link:</strong> {selected.venue}</p>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
