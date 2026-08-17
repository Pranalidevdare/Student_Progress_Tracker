import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitFeedback, getFeedbackByStudent } from '../api/api';
import { MdFeedback, MdStar } from 'react-icons/md';

const categories = [
  'TRAINING_QUALITY',
  'INFRASTRUCTURE',
  'CURRICULUM',
  'MENTORSHIP',
  'GENERAL',
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [form, setForm]         = useState({ category: 'TRAINING_QUALITY', rating: 5, comments: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]           = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    getFeedbackByStudent(user.studentId)
      .then((r) => setHistory(r.data || []))
      .catch(() => setError('Failed to load past feedback.'))
      .finally(() => setLoading(false));
  }, [user?.studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comments.trim()) {
      setMsg({ type: 'error', text: 'Please enter your feedback comments.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitFeedback({
        studentId: user.studentId,
        category: form.category,
        rating: form.rating,
        comments: form.comments,
      });
      setMsg({ type: 'success', text: 'Thank you! Feedback submitted successfully.' });
      setHistory((prev) => [res.data || { ...form, createdAt: new Date() }, ...prev]);
      setForm({ category: 'TRAINING_QUALITY', rating: 5, comments: '' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to submit feedback.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading feedback history…</p></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback &amp; Suggestions</h1>
          <p className="page-subtitle">Share your training feedback to help us continuously improve</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Submit Feedback</span></div>
          {msg.text && (
            <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Rating (1 to 5 Stars)</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= form.rating ? 'filled' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, rating: star }))}
                  >
                    <MdStar />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Comments / Suggestions *</label>
              <textarea
                className="form-control"
                placeholder="Share your experience, trainer feedback, or suggestions..."
                value={form.comments}
                onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Your Submitted Feedback</span></div>
          {error && <div className="alert alert-error">{error}</div>}
          {history.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {history.map((item, idx) => (
                <div key={item.id || idx} style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="badge badge-primary">{item.category?.replace('_', ' ')}</span>
                    <div style={{ display: 'flex', color: '#F6AD55', fontSize: '0.9rem' }}>
                      {[...Array(item.rating || 5)].map((_, i) => <MdStar key={i} />)}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {item.comments}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: 4, display: 'block' }}>
                    {fmtDate(item.createdAt || item.submissionDate)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="state-container" style={{ padding: 30 }}>
              <MdFeedback className="state-icon" />
              <p className="state-title">No feedback submitted yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
