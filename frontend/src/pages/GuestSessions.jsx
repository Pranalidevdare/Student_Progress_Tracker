import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getGuestSessionsByTrainer,
  getStudentGuestSessionsByBatch,
  createGuestSession,
  updateGuestSession,
  deleteGuestSession
} from '../api/guestSessionApi';
import {
  Plus, Edit2, Trash2, Video, Calendar, MapPin, UserCheck, X, Check,
  ExternalLink, Search, Clock, Building2, Briefcase, Award, ShieldAlert,
  Sparkles, Layers, ChevronRight, User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuestSessions() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const studentBatchId = user?.batchId || user?.batch || 'BATCH001';
  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';
  const defaultBatchId = studentBatchId;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for Trainer Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    speakerName: '',
    companyName: '',
    designation: '',
    organization: '',
    topic: '',
    description: '',
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: '10:00 AM – 12:00 PM',
    venue: 'Google Meet / Auditorium A',
    batchId: defaultBatchId,
    trainerId: trainerId,
    trainerName: user?.fullName || 'Faculty Trainer'
  });

  // Modal State for Student View Details
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [isStudent, studentBatchId, trainerId]);

  const fetchSessions = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const activeBatchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || 'BATCH001';
      if (isStudent) {
        const res = await getStudentGuestSessionsByBatch(activeBatchId);
        setSessions(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await getGuestSessionsByTrainer(trainerId);
        setSessions(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load guest sessions:', err);
      setHasError(true);
      toast.error('Unable to load guest sessions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getComputedSessionStatus = (item) => {
    if (item.status && ['UPCOMING', 'ONGOING', 'COMPLETED'].includes(item.status)) {
      return item.status;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const sDate = item.sessionDate;
    if (!sDate) return 'UPCOMING';
    if (sDate > todayStr) return 'UPCOMING';
    if (sDate === todayStr) return 'ONGOING';
    return 'COMPLETED';
  };

  const filteredSessions = sessions.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speakerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topic?.toLowerCase().includes(searchTerm.toLowerCase());

    const compStatus = getComputedSessionStatus(item);
    const matchesStatus = statusFilter === 'ALL' || compStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      speakerName: '',
      companyName: '',
      designation: '',
      organization: '',
      topic: '',
      description: '',
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: '10:00 AM – 12:00 PM',
      venue: 'Google Meet / Auditorium A',
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
      designation: item.designation || '',
      organization: item.organization || '',
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

  const handleOpenViewModal = (item) => {
    setSelectedSession(item);
    setViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateGuestSession(editingId, formData);
        toast.success('Guest session updated!');
      } else {
        await createGuestSession(formData);
        toast.success('Guest session scheduled successfully!');
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

  const getStatusBadge = (statusStr) => {
    switch (statusStr) {
      case 'ONGOING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 animate-pulse">ONGOING</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200">COMPLETED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">UPCOMING</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans pb-12">
      {/* Top Banner Header */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/20 rounded-xl text-purple-300 border border-purple-400/30">
              <Video size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Industry Guest Sessions</h1>
          </div>
          <p className="text-xs text-purple-200/80 max-w-xl">
            View scheduled talks, webinars and sessions from industry experts.
          </p>
        </div>

        {/* Schedule Session Button is ONLY visible to Trainers/Admins */}
        {!isStudent ? (
          <button onClick={handleOpenCreateModal} className="btn-primary bg-purple-600 hover:bg-purple-700 font-bold text-xs py-2.5 px-4 shadow-lg shadow-purple-900/30">
            <Plus size={16} />
            <span>Schedule Session</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20 select-none">
            <span className="text-purple-200 font-medium">Batch:</span>
            <span className="font-mono text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">{studentBatchId}</span>
            <span className="text-[10px] text-purple-200 uppercase font-semibold bg-white/10 px-1.5 py-0.5 rounded">STUDENT VIEW</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by topic, speaker name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 p-1 rounded-xl text-xs">
          {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                statusFilter === st ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {st === 'ALL' ? 'All Sessions' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="spinner w-8 h-8 border-purple-600 mx-auto" />
          <p className="text-xs text-gray-400 mt-3 font-semibold">Loading guest sessions from backend...</p>
        </div>
      ) : hasError ? (
        /* ERROR STATE */
        <div className="card p-12 text-center bg-red-50/40 border border-red-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert size={24} />
          </div>
          <h3 className="text-sm font-extrabold text-red-900">Unable to load guest sessions</h3>
          <p className="text-xs text-red-700 mt-1 max-w-sm mx-auto leading-relaxed">
            Please try again later or contact your batch administrator.
          </p>
        </div>
      ) : filteredSessions.length > 0 ? (
        /* SESSIONS LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((item) => {
            const compStatus = getComputedSessionStatus(item);
            return (
              <div
                key={item.id}
                className="card p-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between border-t-4 border-t-purple-600 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                      {item.topic || 'Industry Guest Session'}
                    </span>
                    {getStatusBadge(compStatus)}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 line-clamp-2 leading-snug">{item.title}</h3>
                  </div>

                  {/* Speaker Details Summary */}
                  <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-purple-200">
                      {item.speakerName ? item.speakerName.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-gray-900 truncate">{item.speakerName || 'Guest Speaker'}</p>
                      <p className="text-[11px] text-gray-600 truncate">{item.designation || 'Industry Specialist'}</p>
                      <p className="text-[10px] font-bold text-purple-700 truncate">{item.companyName || item.organization || 'Tech Organization'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description || 'Interactive talk on modern technology trends and career paths.'}</p>

                  <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Scheduled Date:</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1">
                        <Calendar size={12} className="text-purple-600" /> {item.sessionDate || 'Scheduled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Time Window:</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1">
                        <Clock size={12} className="text-purple-600" /> {item.sessionTime || '10:00 AM – 12:00 PM'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Batch ID:</span>
                      <span className="font-mono font-bold text-red-700">{item.batchId || studentBatchId}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenViewModal(item)}
                    className="w-full btn bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>VIEW SESSION</span>
                    <ChevronRight size={14} />
                  </button>

                  {!isStudent && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEditModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DEDICATED EMPTY STATE (NO SCHEDULE SESSION BUTTON FOR STUDENTS!) */
        <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 space-y-3">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
            <Video size={28} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-gray-900">No Guest Sessions Scheduled</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              There are currently no industry guest sessions scheduled for your batch (<span className="font-mono font-bold text-purple-700">{studentBatchId}</span>).
            </p>
            <p className="text-[11px] text-gray-400">New sessions will appear here when they are scheduled by your trainer.</p>
          </div>
        </div>
      )}

      {/* STUDENT VIEW DETAILED GUEST SESSION MODAL */}
      {viewModalOpen && selectedSession && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <div className="modal-header bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div>
                <span className="badge bg-purple-100 text-purple-800 font-bold text-[10px] mb-1 inline-block">
                  {selectedSession.topic || 'Industry Guest Session'}
                </span>
                <h2 className="text-lg font-extrabold text-gray-900">{selectedSession.title}</h2>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body space-y-6">
              {/* STATUS & SCHEDULE BANNER */}
              <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-purple-950">{selectedSession.sessionDate || 'Scheduled Date'}</p>
                    <p className="text-xs text-purple-800 font-semibold">{selectedSession.sessionTime || '10:00 AM – 12:00 PM'}</p>
                  </div>
                </div>
                <div>{getStatusBadge(getComputedSessionStatus(selectedSession))}</div>
              </div>

              {/* ABOUT THE SPEAKER SECTION */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <UserCheck size={16} className="text-purple-600" />
                  <span>SPEAKER INFORMATION</span>
                </h3>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md border border-purple-300 flex-shrink-0">
                    {selectedSession.speakerName ? selectedSession.speakerName.charAt(0).toUpperCase() : <User size={24} />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-extrabold text-gray-900">{selectedSession.speakerName || 'Industry Expert'}</h4>
                    <p className="text-xs text-gray-700 font-bold">{selectedSession.designation || 'Senior Technical Leader'}</p>
                    <p className="text-xs font-bold text-purple-700">{selectedSession.companyName || selectedSession.organization || 'Global Tech Industry'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t border-gray-200/80">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Organization</p>
                    <p className="font-bold text-gray-800">{selectedSession.organization || selectedSession.companyName || 'Corporate Partner'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Session Topic</p>
                    <p className="font-bold text-purple-700">{selectedSession.topic || 'Technology & Career Guidelines'}</p>
                  </div>
                </div>
              </div>

              {/* SESSION INFORMATION SECTION */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <Layers size={16} className="text-purple-600" />
                  <span>SESSION DETAILS & OVERVIEW</span>
                </h3>

                <p className="text-xs text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-line">
                  {selectedSession.description || 'Comprehensive industry interaction session covering architecture guidelines, software development standards, and career guidance.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Target Batch</p>
                    <p className="font-mono font-bold text-red-700">{selectedSession.batchId || studentBatchId}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Session Venue / Platform</p>
                    <p className="font-bold text-gray-800 truncate">{selectedSession.venue || 'Online / Auditorium'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Coordinator Trainer</p>
                    <p className="font-bold text-gray-800 truncate">{selectedSession.trainerName || 'Academic Faculty'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer flex items-center justify-between">
              <button type="button" onClick={() => setViewModalOpen(false)} className="btn-outline text-xs">
                Back to Guest Sessions
              </button>

              {selectedSession.venue?.startsWith('http') && (
                <a
                  href={selectedSession.venue}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink size={14} />
                  <span>JOIN SESSION</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRAINER SCHEDULE/EDIT SESSION MODAL */}
      {modalOpen && !isStudent && (
        <div className="modal-backdrop">
          <div className="modal max-w-xl">
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
                    <label className="form-label">Speaker Designation</label>
                    <input
                      type="text"
                      placeholder="Senior Engineering Manager"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="10:00 AM – 12:00 PM"
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
                      placeholder="Auditorium / Google Meet"
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
                <button type="submit" disabled={submitting} className="btn-primary bg-purple-600">
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
