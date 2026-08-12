import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssignmentsByBatch, submitAssignment } from '../api/api';
import { MdAssignment, MdFileUpload, MdCheckCircle, MdAccessTime, MdClose } from 'react-icons/md';

const statusBadge = (s = '') => {
  const st = s.toUpperCase();
  if (st === 'SUBMITTED' || st === 'COMPLETED' || st === 'GRADED')
    return <span className="badge badge-success">{st}</span>;
  if (st === 'PENDING')
    return <span className="badge badge-warning">PENDING</span>;
  if (st === 'OVERDUE' || st === 'LATE')
    return <span className="badge badge-danger">{st}</span>;
  return <span className="badge badge-neutral">{st || 'PENDING'}</span>;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [submitForm, setSubmitForm]     = useState({ submissionUrl: '', remarks: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [submitMsg, setSubmitMsg]       = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user?.batchId) {
      setLoading(false);
      return;
    }
    getAssignmentsByBatch(user.batchId)
      .then((r) => setAssignments(r.data || []))
      .catch(() => setError('Failed to load assignments.'))
      .finally(() => setLoading(false));
  }, [user?.batchId]);

  const handleOpenSubmit = (item) => {
    setSelectedItem(item);
    setSubmitForm({ submissionUrl: '', remarks: '' });
    setSubmitMsg({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submitForm.submissionUrl) {
      setSubmitMsg({ type: 'error', text: 'Please enter submission URL / link.' });
      return;
    }
    setSubmitting(true);
    try {
      await submitAssignment({
        studentId: user.studentId,
        assignmentId: selectedItem.id,
        submissionUrl: submitForm.submissionUrl,
        remarks: submitForm.remarks,
      });
      setSubmitMsg({ type: 'success', text: 'Assignment submitted successfully!' });
      setAssignments((prev) =>
        prev.map((a) => (a.id === selectedItem.id ? { ...a, status: 'SUBMITTED' } : a))
      );
      setTimeout(() => setSelectedItem(null), 1500);
    } catch (err) {
      setSubmitMsg({ type: 'error', text: 'Failed to submit. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading assignments…</p></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">View coursework, track deadlines, and submit your solutions</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!user?.batchId ? (
        <div className="state-container card">
          <MdAccessTime className="state-icon" />
          <p className="state-title">Batch info missing</p>
          <p className="state-desc">Your profile is not assigned to a batch yet.</p>
        </div>
      ) : assignments.length ? (
        <div className="grid-2" style={{ gap: 20 }}>
          {assignments.map((item) => {
            const isDone = item.status === 'SUBMITTED' || item.status === 'GRADED';
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
                    <span>Due: <strong style={{ color: 'var(--color-text-secondary)' }}>{fmtDate(item.dueDate)}</strong></span>
                    {item.maxMarks != null && <span>Max Marks: <strong style={{ color: 'var(--color-text-secondary)' }}>{item.maxMarks}</strong></span>}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  {isDone ? (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                      <MdCheckCircle /> Submitted
                    </span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenSubmit(item)}>
                      <MdFileUpload /> Submit Solution
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="state-container card">
          <MdAssignment className="state-icon" />
          <p className="state-title">No assignments found</p>
          <p className="state-desc">There are no assignments assigned to your batch at this time.</p>
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Submit: {selectedItem.title}</span>
              <button className="modal-close" onClick={() => setSelectedItem(null)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {submitMsg.text && (
                  <div className={`alert alert-${submitMsg.type === 'error' ? 'error' : 'success'}`}>
                    {submitMsg.text}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Submission Link (GitHub / Google Drive / Live URL) *</label>
                  <input
                    className="form-control"
                    type="url"
                    placeholder="https://github.com/your-username/repository"
                    value={submitForm.submissionUrl}
                    onChange={(e) => setSubmitForm((f) => ({ ...f, submissionUrl: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks / Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    placeholder="Any notes for the trainer..."
                    value={submitForm.remarks}
                    onChange={(e) => setSubmitForm((f) => ({ ...f, remarks: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
