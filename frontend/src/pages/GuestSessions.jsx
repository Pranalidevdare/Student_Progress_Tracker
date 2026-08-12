import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getGuestSessionsByTrainer,
  createGuestSession,
  updateGuestSession,
  deleteGuestSession
} from '../api/guestSessionApi';
import { Plus, Edit2, Trash2, Video, Calendar, MapPin, UserCheck, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuestSessions() {
  const { user } = useAuth();
  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';
  const defaultBatchId = user?.batchId || localStorage.getItem('batchId') || 'BATCH001';

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    speakerName: '',
    companyName: '',
    topic: '',
    description: '',
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: '10:00 AM',
    venue: 'Auditorium A / Google Meet',
    batchId: defaultBatchId,
    trainerId: trainerId,
    trainerName: user?.fullName || 'Faculty Trainer'
  });

  useEffect(() => {
    fetchSessions();
  }, [trainerId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await getGuestSessionsByTrainer(trainerId);
      setSessions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load guest sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      speakerName: '',
      companyName: '',
      topic: '',
      description: '',
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: '10:00 AM',
      venue: 'Auditorium A / Google Meet',
      batchId: defaultBatchId,
      trainerId,
      trainerName: user?.fullName || 'Faculty Trainer'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      speakerName: item.speakerName || '',
      companyName: item.companyName || '',
      topic: item.topic || '',
      description: item.description || '',
      sessionDate: item.sessionDate || '',
      sessionTime: item.sessionTime || '',
      venue: item.venue || '',
      batchId: item.batchId || defaultBatchId,
      trainerId: item.trainerId || trainerId,
      trainerName: item.trainerName || user?.fullName || 'Faculty Trainer'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateGuestSession(editingId, formData);
        toast.success('Guest Session updated!');
      } else {
        await createGuestSession(formData);
        toast.success('Guest Session scheduled successfully!');
      }
      setModalOpen(false);
      fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save guest session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel and delete this guest session?')) return;
    try {
      await deleteGuestSession(id);
      toast.success('Session deleted!');
      fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete session.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Industry Guest Sessions</h1>
          <p className="page-subtitle">Organize tech talks and webinars with industry experts for students</p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200">
          <Plus size={18} />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* Grid of Sessions */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner w-10 h-10 border-red-600" />
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((item) => (
            <div key={item.id} className="card hover:border-red-200 transition-all flex flex-col justify-between">
              <div className="card-body flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold flex-shrink-0">
                      <Video size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                      <p className="text-xs text-red-600 font-semibold">{item.topic}</p>
                    </div>
                  </div>
                  <span className="badge-purple">Batch: {item.batchId}</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 text-xs text-gray-700">
                  <UserCheck size={16} className="text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">{item.speakerName}</p>
                    <p className="text-gray-500">{item.companyName}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <Calendar size={14} className="text-red-500" />
                    {item.sessionDate} ({item.sessionTime})
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <MapPin size={14} className="text-red-500" />
                    {item.venue}
                  </span>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Trainer: {item.trainerName}</span>

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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state py-16">
            <div className="empty-icon"><Video size={32} /></div>
            <h4 className="text-sm font-bold text-gray-700">No Guest Sessions Scheduled</h4>
            <p className="text-xs text-gray-400 max-w-sm">No talks scheduled yet. Click "Schedule Session" to bring industry experts to your batch.</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? 'Edit Guest Session' : 'Schedule Guest Session'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Session Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microservices Architecture in Industry"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Speaker Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Rajesh Sharma"
                      value={formData.speakerName}
                      onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company / Org *</label>
                    <input
                      type="text"
                      required
                      placeholder="Google / Microsoft / Amazon"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Topic *</label>
                    <input
                      type="text"
                      required
                      placeholder="System Design"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Batch ID *</label>
                    <input
                      type="text"
                      required
                      value={formData.batchId}
                      onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.sessionDate}
                      onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="11:00 AM"
                      value={formData.sessionTime}
                      onChange={(e) => setFormData({ ...formData, sessionTime: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Venue / Link *</label>
                    <input
                      type="text"
                      required
                      placeholder="Lab 3 / Zoom"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Session Description</label>
                  <textarea
                    rows="3"
                    placeholder="Overview of the talk..."
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
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Check size={16} />}
                  <span>{editingId ? 'Update Session' : 'Schedule Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
