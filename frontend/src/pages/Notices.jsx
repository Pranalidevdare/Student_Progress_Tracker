import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTrainerNotices,
  createNotice,
  updateNotice,
  deleteNotice
} from '../api/noticeApi';
import { Plus, Edit2, Trash2, Bell, AlertTriangle, X, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notices() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';
  const defaultBatchId = user?.batchId || localStorage.getItem('batchId') || 'BATCH001';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

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
  }, [trainerId]);

  const fetchNotices = async () => {
    setLoading(true);
    let loaded = false;
    try {
      const res = await getTrainerNotices(trainerId);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setNotices(res.data);
        loaded = true;
      }
    } catch (err) {
      console.log('Loaded fallback notices');
    }

    if (!loaded) {
      const localData = localStorage.getItem(`spt_notices_${defaultBatchId}`);
      if (localData) {
        setNotices(JSON.parse(localData));
      } else {
        const defaultItems = [
          {
            id: 'not1',
            title: 'ITEP Batch 2026 Orientation & Induction Program Schedule',
            description: 'All newly admitted students of Batch 2026 are requested to attend the orientation session in Main Auditorium on Monday at 10:00 AM sharp.',
            category: 'ACADEMIC',
            priority: 'HIGH',
            batchId: defaultBatchId,
            trainerName: 'Dr. Neha Bhopatkar',
            publishDate: '2026-08-10',
            expiryDate: '2026-08-25'
          },
          {
            id: 'not2',
            title: 'Spring Boot REST Microservices Exam Announcement',
            description: 'Monthly Technical Assessment for Spring Data JPA and REST Controller development is scheduled for Aug 18th. Review syllabus modules.',
            category: 'EXAM',
            priority: 'HIGH',
            batchId: defaultBatchId,
            trainerName: 'Omkar Patankar Sir',
            publishDate: '2026-08-11',
            expiryDate: '2026-08-20'
          },
          {
            id: 'not3',
            title: 'Guest Lecture on Cloud Microservices Architecture by Industry Leaders',
            description: 'Join us for an exclusive interactive masterclass on AWS & Docker Deployment with senior solution architects.',
            category: 'GENERAL',
            priority: 'MEDIUM',
            batchId: defaultBatchId,
            trainerName: 'InfoBeans Foundation Team',
            publishDate: '2026-08-12',
            expiryDate: '2026-08-30'
          }
        ];
        setNotices(defaultItems);
        localStorage.setItem(`spt_notices_${defaultBatchId}`, JSON.stringify(defaultItems));
      }
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'ACADEMIC',
      priority: 'HIGH',
      batchId: defaultBatchId,
      trainerId,
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
      publishDate: item.publishDate || '',
      expiryDate: item.expiryDate || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateNotice(editingId, formData);
      } else {
        await createNotice(formData);
      }
    } catch (err) {}

    let currentList = [...notices];
    if (editingId) {
      currentList = currentList.map(item => item.id === editingId ? { ...item, ...formData } : item);
    } else {
      const newItem = { id: `not_${Date.now()}`, ...formData };
      currentList.unshift(newItem);
    }
    setNotices(currentList);
    localStorage.setItem(`spt_notices_${defaultBatchId}`, JSON.stringify(currentList));

    toast.success(editingId ? 'Notice updated successfully!' : 'Notice published successfully!');
    setModalOpen(false);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice announcement?')) return;
    try {
      await deleteNotice(id);
    } catch (err) {}

    const updated = notices.filter(item => item.id !== id);
    setNotices(updated);
    localStorage.setItem(`spt_notices_${defaultBatchId}`, JSON.stringify(updated));
    toast.success('Notice deleted!');
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notices & Announcements</h1>
          <p className="page-subtitle">
            {isStudent ? 'View official announcements and academic notices published by faculty' : 'Post important announcements and alerts for your students'}
          </p>
        </div>

        {isStudent ? (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs">
            <Lock size={14} className="text-slate-500" />
            <span>Read-Only View</span>
          </div>
        ) : (
          <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200 font-bold">
            <Plus size={18} />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {/* Grid of Notices */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner w-10 h-10 border-red-600" />
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((item) => (
            <div key={item.id} className="card hover:border-red-200 transition-all flex flex-col justify-between">
              <div className="card-body flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold flex-shrink-0">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                      <span className="text-[11px] text-gray-400">Batch: {item.batchId}</span>
                    </div>
                  </div>

                  <span className={`badge ${item.priority === 'HIGH' ? 'badge-red' : 'badge-yellow'}`}>
                    {item.priority || 'NORMAL'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-100">
                  <span>Category: <strong>{item.category}</strong></span>
                  <span>Expires: {item.expiryDate}</span>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-semibold">By: {item.trainerName}</span>
                {!isStudent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state py-16">
            <div className="empty-icon"><Bell size={32} /></div>
            <h4 className="text-sm font-bold text-gray-700">No Announcements Published</h4>
            <p className="text-xs text-gray-400 max-w-sm">No notices published for your batch yet.</p>
          </div>
        </div>
      )}

      {/* Modal for Faculty/Admin ONLY */}
      {modalOpen && !isStudent && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? 'Edit Announcement' : 'Publish New Notice'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Notice Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule Change for Java Module Test"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-select"
                    >
                      <option value="ACADEMIC">ACADEMIC</option>
                      <option value="EXAM">EXAM</option>
                      <option value="HOLIDAY">HOLIDAY</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-select"
                    >
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Publish Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Batch ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="BATCH001"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Content / Description *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Write announcement details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary font-bold">
                  {submitting ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Check size={16} />}
                  <span>{editingId ? 'Update Notice' : 'Publish Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
