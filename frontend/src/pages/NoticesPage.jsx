import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveNotices, getNoticesByBatch, getImportantNotices } from '../api/api';
import { MdNotifications, MdClose, MdPriorityHigh } from 'react-icons/md';

const priorityBadge = (p = '') => {
  const pr = p.toUpperCase();
  if (pr === 'HIGH' || pr === 'URGENT') return <span className="badge badge-danger">HIGH</span>;
  if (pr === 'MEDIUM') return <span className="badge badge-warning">MEDIUM</span>;
  return <span className="badge badge-info">GENERAL</span>;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('ALL');

  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    setLoading(true);
    let fetcher = getActiveNotices();
    if (tab === 'IMPORTANT') fetcher = getImportantNotices();
    else if (tab === 'BATCH' && user?.batchId) fetcher = getNoticesByBatch(user.batchId);

    fetcher
      .then((r) => setNotices(r.data || []))
      .catch(() => setError('Failed to load notices.'))
      .finally(() => setLoading(false));
  }, [tab, user?.batchId]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="page-subtitle">Stay updated with Foundation announcements, events, and circulars</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'ALL' ? 'active' : ''}`} onClick={() => setTab('ALL')}>All Notices</button>
        <button className={`tab ${tab === 'IMPORTANT' ? 'active' : ''}`} onClick={() => setTab('IMPORTANT')}>Important</button>
        {user?.batchId && (
          <button className={`tab ${tab === 'BATCH' ? 'active' : ''}`} onClick={() => setTab('BATCH')}>My Batch</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="state-container"><div className="spinner" /><p className="state-title">Loading notices…</p></div>
      ) : notices.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {notices.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'all var(--transition)' }}
              onClick={() => setSelectedNotice(n)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: n.priority === 'HIGH' ? 'var(--color-danger-bg)' : 'var(--color-primary-50)',
                    color: n.priority === 'HIGH' ? 'var(--color-danger)' : 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                  }}>
                    {n.priority === 'HIGH' ? <MdPriorityHigh /> : <MdNotifications />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{n.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                      {n.description?.slice(0, 140)}{(n.description?.length || 0) > 140 ? '…' : ''}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  {priorityBadge(n.priority)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{fmtDate(n.publishDate || n.createdDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="state-container card">
          <MdNotifications className="state-icon" />
          <p className="state-title">No notices found</p>
          <p className="state-desc">There are no active notices under this section.</p>
        </div>
      )}

      {selectedNotice && (
        <div className="modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="modal-title">{selectedNotice.title}</span>
                {priorityBadge(selectedNotice.priority)}
              </div>
              <button className="modal-close" onClick={() => setSelectedNotice(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                Published on {fmtDate(selectedNotice.publishDate || selectedNotice.createdDate)}
              </p>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.7, whitespace: 'pre-line' }}>
                {selectedNotice.description}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedNotice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
