import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTrainerNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getActiveNotices
} from '../api/noticeApi';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Bell, AlertTriangle, X, Check, Lock, RefreshCw, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notices() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const trainerId = user?.id || localStorage.getItem('trainerId') || '';
  const defaultBatchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || '';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Modal State for Faculty/Admin
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ACADEMIC',
    priority: 'HIGH',
    batchId: defaultBatchId,
    trainerId: trainerId,
    trainerName: user?.fullName || 'Faculty Trainer',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchNotices();
  }, [trainerId, isStudent]);

  const fetchNotices = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const res = isStudent
        ? await getActiveNotices()
        : await getTrainerNotices(trainerId);

      if (res && res.data && Array.isArray(res.data)) {
        setNotices(res.data);
      } else {
        setNotices([]);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
      if (err.response?.status === 404) {
        setNotices([]);
      } else {
        setHasError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'ACADEMIC',
      priority: 'HIGH',
      batchId: defaultBatchId,
      trainerId: trainerId || user?.id || '',
      trainerName: user?.fullName || 'Faculty Trainer',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'ACADEMIC',
      priority: item.priority || 'HIGH',
      batchId: item.batchId || defaultBatchId,
      trainerId: item.trainerId || trainerId,
      trainerName: item.trainerName || user?.fullName || 'Faculty Trainer',
      publishDate: item.publishDate || new Date().toISOString().split('T')[0],
      expiryDate: item.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || 'Announcement details',
      category: formData.category,
      priority: formData.priority,
      batchId: formData.batchId || defaultBatchId,
      trainerId: formData.trainerId || trainerId,
      trainerName: formData.trainerName || user?.fullName || 'Faculty Trainer',
      publishDate: formData.publishDate,
      expiryDate: formData.expiryDate
    };

    try {
      if (editingId) {
        await updateNotice(editingId, payload);
        toast.success('Notice updated successfully');
      } else {
        await createNotice(payload);
        toast.success('Notice posted successfully');
      }
      setModalOpen(false);
      fetchNotices();
    } catch (err) {
      console.error('Failed to save notice:', err);
      toast.error(err.response?.data?.message || 'Failed to post notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNotice(id);
      toast.success('Notice deleted');
      fetchNotices();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete notice');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{isStudent ? 'Notice Board' : 'Notices & Announcements'}</h1>
          <p className="page-subtitle">
            {isStudent ? 'Official academic circulars and announcements from faculty' : 'Publish announcements, session schedules, and exam alerts for students'}
          </p>
        </div>

        {isStudent ? (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200">
            <Lock size={14} className="text-slate-500" />
            <span>Read-Only View</span>
          </div>
        ) : (
          <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200 font-bold">
            <Plus size={18} />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="spinner w-8 h-8 border-red-600 mx-auto" />
          <p className="text-xs text-gray-400 mt-3 font-semibold">Loading notices...</p>
        </div>
      ) : hasError ? (
        <div className="card p-12 text-center bg-red-50/40 border border-red-200 space-y-3">
          <ShieldAlert size={24} className="text-red-600 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">Unable to load notices</h3>
          <p className="text-xs text-red-700">Please check your connection and try again.</p>
          <button onClick={fetchNotices} className="btn bg-red-600 text-white text-xs font-bold px-4 py-2 mx-auto flex items-center gap-1.5 shadow">
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      ) : notices.length > 0 ? (
        <div className="space-y-4">
          {notices.map((item, idx) => (
            <div key={item.id || idx} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    item.priority === 'HIGH' ? 'badge-red' : item.priority === 'MEDIUM' ? 'badge-yellow' : 'badge-gray'
                  }`}>
                    {item.priority || 'NORMAL'} PRIORITY
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {item.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Published: {item.publishDate || 'Recent'}</span>
                  {!isStudent && (
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => handleOpenEditModal(item)} className="p-1 hover:text-gray-700" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-600" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{item.description}</p>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Posted by: <strong className="text-gray-700 font-semibold">{item.trainerName || 'Faculty'}</strong></span>
                  {item.expiryDate && <span>Expires: {item.expiryDate}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 space-y-3">
          <Bell size={28} className="text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No Active Notices</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {isStudent
              ? 'There are currently no active announcements on the notice board.'
              : 'No notices posted. Click "Post Notice" to publish circulars and updates.'}
          </p>
        </div>
      )}

      {/* Modal for Create / Edit Notice */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-md">
            <div className="modal-header">
              <h3 className="text-sm font-bold text-gray-900">
                {editingId ? 'Edit Announcement' : 'Post New Notice'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="form-group">
                <label className="form-label">Notice Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule for Monthly Assessment"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                  >
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="EXAM">EXAM</option>
                    <option value="INTERVIEW">INTERVIEW</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-input font-bold"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Announcement Body</label>
                <textarea
                  rows="4"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter notice details..."
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Publish Date</label>
                  <input
                    type="date"
                    required
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn bg-gray-100 text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : editingId ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
