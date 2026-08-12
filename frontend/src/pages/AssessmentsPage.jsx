import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssessmentsByBatch, submitAssessment } from '../api/api';
import { MdQuiz, MdCheckCircle, MdClose } from 'react-icons/md';

const statusBadge = (s = '') => {
  const st = s.toUpperCase();
  if (st === 'COMPLETED' || st === 'SUBMITTED' || st === 'PASSED')
    return <span className="badge badge-success">{st}</span>;
  if (st === 'UPCOMING' || st === 'SCHEDULED')
    return <span className="badge badge-info">{st}</span>;
  if (st === 'PENDING')
    return <span className="badge badge-warning">PENDING</span>;
  return <span className="badge badge-neutral">{st || 'PENDING'}</span>;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitMsg, setSubmitMsg]       = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user?.batchId) {
      setLoading(false);
      return;
    }
    getAssessmentsByBatch(user.batchId)
      .then((r) => setAssessments(r.data || []))
      .catch(() => setError('Failed to load assessments.'))
      .finally(() => setLoading(false));
  }, [user?.batchId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitAssessment({
        studentId: user.studentId,
        assessmentId: selectedItem.id,
      });
      setSubmitMsg({ type: 'success', text: 'Assessment completed & submitted!' });
      setAssessments((prev) =>
        prev.map((a) => (a.id === selectedItem.id ? { ...a, status: 'COMPLETED' } : a))
      );
      setTimeout(() => setSelectedItem(null), 1500);
    } catch (err) {
      setSubmitMsg({ type: 'error', text: 'Failed to submit assessment.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading assessments…</p></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assessments</h1>
          <p className="page-subtitle">Take tests, view evaluation scores, and track academic progress</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!user?.batchId ? (
        <div className="state-container card">
          <MdQuiz className="state-icon" />
          <p className="state-title">Batch info missing</p>
          <p className="state-desc">Your profile is not assigned to a batch yet.</p>
        </div>
      ) : assessments.length ? (
        <div className="grid-2" style={{ gap: 20 }}>
          {assessments.map((item) => {
            const isDone = item.status === 'COMPLETED' || item.status === 'SUBMITTED';
            return (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.title}</h3>
                    {statusBadge(item.status)}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: 16 }}>
                    <span>Date: <strong style={{ color: 'var(--color-text-secondary)' }}>{fmtDate(item.assessmentDate || item.date)}</strong></span>
                    {item.totalMarks != null && <span>Max Score: <strong style={{ color: 'var(--color-text-secondary)' }}>{item.totalMarks}</strong></span>}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  {isDone ? (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                      <MdCheckCircle /> Completed
                    </span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => { setSelectedItem(item); setSubmitMsg({ type: '', text: '' }); }}>
                      Take Assessment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="state-container card">
          <MdQuiz className="state-icon" />
          <p className="state-title">No assessments found</p>
          <p className="state-desc">There are no assessments scheduled for your batch right now.</p>
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Start Assessment: {selectedItem.title}</span>
              <button className="modal-close" onClick={() => setSelectedItem(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {submitMsg.text ? (
                <div className={`alert alert-${submitMsg.type === 'error' ? 'error' : 'success'}`}>
                  {submitMsg.text}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  Are you ready to submit/complete <strong>{selectedItem.title}</strong>? Once started, ensure you submit before the allocated time.
                </p>
              )}
            </div>
            {!submitMsg.text && (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setSelectedItem(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
