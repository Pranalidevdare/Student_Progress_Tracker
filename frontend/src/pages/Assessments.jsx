import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getStudentAssessmentsByBatch,
  getAssessmentsByBatch,
  createAssessment,
  updateAssessment,
  deleteAssessment
} from '../api/assessmentApi';
import { Plus, Edit2, Trash2, Search, FileText, Clock, X, Check, Lock, CheckCircle2, Play, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Assessments() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const studentId = user?.id || user?.studentId || user?.email || 'STU001';
  const trainerId = user?.id || localStorage.getItem('trainerId') || 'TRN101';
  const batchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || 'BATCH001';

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Trainer Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    trainerId: trainerId,
    batchId: batchId,
    title: '',
    subject: '',
    description: '',
    totalMarks: 50,
    durationInMinutes: 60,
    assessmentDate: new Date().toISOString().split('T')[0],
    status: 'UPCOMING'
  });

  // Modal State for Student Assessment Submission / View Result
  const [takeModalOpen, setTakeModalOpen] = useState(false);
  const [targetAssessment, setTargetAssessment] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [completedAssessments, setCompletedAssessments] = useState({});

  useEffect(() => {
    fetchAssessments();
    const localCompleted = localStorage.getItem(`spt_completed_assessments_${studentId}`);
    if (localCompleted) {
      try {
        setCompletedAssessments(JSON.parse(localCompleted));
      } catch (e) {}
    }
  }, [batchId, studentId]);

  const fetchAssessments = async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const res = isStudent
        ? await getStudentAssessmentsByBatch(batchId)
        : await getAssessmentsByBatch(batchId);

      if (res.data && Array.isArray(res.data)) {
        setAssessments(res.data);
      } else {
        setAssessments([]);
      }
    } catch (err) {
      console.error('Error fetching academic assessments:', err);
      toast.error('Unable to load academic assessments. Please try again.');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      trainerId,
      batchId,
      title: '',
      subject: '',
      description: '',
      totalMarks: 50,
      durationInMinutes: 60,
      assessmentDate: new Date().toISOString().split('T')[0],
      status: 'UPCOMING'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      trainerId: item.trainerId || trainerId,
      batchId: item.batchId || batchId,
      title: item.title || '',
      subject: item.subject || '',
      description: item.description || '',
      totalMarks: item.totalMarks || 50,
      durationInMinutes: item.durationInMinutes || 60,
      assessmentDate: item.assessmentDate || '',
      status: item.status || 'UPCOMING'
    });
    setModalOpen(true);
  };

  const handleOpenTakeModal = (item) => {
    setTargetAssessment(item);
    setStudentAnswers({});
    setTakeModalOpen(true);
  };

  const handleStudentSubmitAnswers = (e) => {
    e.preventDefault();
    const scoreVal = Math.floor(targetAssessment.totalMarks * 0.9);
    const newCompleted = {
      ...completedAssessments,
      [targetAssessment.id]: {
        completedAt: new Date().toISOString().split('T')[0],
        score: scoreVal,
        totalMarks: targetAssessment.totalMarks
      }
    };
    setCompletedAssessments(newCompleted);
    localStorage.setItem(`spt_completed_assessments_${studentId}`, JSON.stringify(newCompleted));

    toast.success(`Assessment submitted! Score: ${scoreVal} / ${targetAssessment.totalMarks} pts 🎉`);
    setTakeModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) {
      toast.error('Please enter Title and Subject.');
      return;
    }
    setSubmitting(true);

    const payload = {
      trainerId: formData.trainerId || trainerId,
      batchId: formData.batchId || batchId,
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim() || 'Assessment instructions.',
      totalMarks: Number(formData.totalMarks) || 50,
      durationInMinutes: Number(formData.durationInMinutes) || 60,
      assessmentDate: formData.assessmentDate || new Date().toISOString().split('T')[0],
      status: formData.status || 'UPCOMING'
    };

    try {
      if (editingId) {
        await updateAssessment(editingId, payload);
        toast.success('Assessment updated successfully!');
      } else {
        await createAssessment(payload);
        toast.success('Assessment created successfully!');
      }
      fetchAssessments();
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await deleteAssessment(id);
      toast.success('Assessment deleted successfully!');
      fetchAssessments();
    } catch (err) {
      toast.error('Failed to delete assessment');
    }
  };

  // Dynamic status computation based on date and completion
  const getComputedStatus = (item) => {
    const isDone = !!completedAssessments[item.id];
    if (isDone) return 'COMPLETED';

    const todayStr = new Date().toISOString().split('T')[0];
    const assDateStr = item.assessmentDate;

    if (item.status === 'COMPLETED') return 'COMPLETED';
    if (item.status === 'ONGOING') return 'ONGOING';
    if (item.status === 'UPCOMING') return 'UPCOMING';

    if (!assDateStr) return 'UPCOMING';
    if (assDateStr > todayStr) return 'UPCOMING';
    if (assDateStr === todayStr) return 'ONGOING';
    return 'COMPLETED';
  };

  const filtered = assessments.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{isStudent ? 'My Academic Assessments' : 'Assessment & Test Management'}</h1>
          <p className="page-subtitle">
            {isStudent
              ? 'View scheduled monthly assessments and take your active evaluations.'
              : 'Schedule quizzes, monthly exams, and evaluate student technical skills.'}
          </p>
        </div>

        {/* READ ONLY BATCH DISPLAY FOR STUDENT */}
        {isStudent ? (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-100/90 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-2xs select-none">
            <span className="text-gray-500 font-medium">Assigned Batch:</span>
            <span className="font-mono text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-extrabold">{batchId}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-200/80 px-1.5 py-0.5 rounded">READ ONLY</span>
          </div>
        ) : (
          <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200 font-bold">
            <Plus size={18} />
            <span>New Assessment</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 text-xs"
          />
        </div>

        {/* Trainer Batch Input (Faculty only) */}
        {!isStudent && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Batch ID:</span>
            <input
              type="text"
              value={batchId}
              onChange={(e) => fetchAssessments()}
              placeholder="Batch ID..."
              className="form-input text-xs font-mono font-bold text-red-700 bg-red-50/50 border-red-200 w-36"
            />
          </div>
        )}
      </div>

      {/* UPDATED TABLE: TITLE | SUBJECT | TOTAL MARKS | DURATION | MONTHLY ASSESSMENT DATE | STATUS | ACTIONS */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>TITLE</th>
                <th>SUBJECT</th>
                <th>TOTAL MARKS</th>
                <th>DURATION</th>
                <th>MONTHLY ASSESSMENT DATE</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="spinner w-8 h-8 border-red-600 mx-auto" />
                    <p className="text-xs text-gray-400 mt-2">Loading academic assessments...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item) => {
                  const computedStatus = getComputedStatus(item);
                  const isDone = !!completedAssessments[item.id] || computedStatus === 'COMPLETED';

                  return (
                    <tr key={item.id}>
                      {/* TITLE */}
                      <td>
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                      </td>

                      {/* SUBJECT */}
                      <td><span className="badge-blue font-bold">{item.subject}</span></td>

                      {/* TOTAL MARKS */}
                      <td className="font-bold text-gray-900">{item.totalMarks} pts</td>

                      {/* DURATION */}
                      <td>
                        <span className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                          <Clock size={13} className="text-red-500" />
                          {item.durationInMinutes} mins
                        </span>
                      </td>

                      {/* MONTHLY ASSESSMENT DATE */}
                      <td className="text-xs font-bold text-gray-800">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-blue-600" />
                          {item.assessmentDate ? new Date(item.assessmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Scheduled'}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        {computedStatus === 'ONGOING' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" /> ONGOING
                          </span>
                        )}
                        {computedStatus === 'UPCOMING' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                            <Clock size={12} /> UPCOMING
                          </span>
                        )}
                        {computedStatus === 'COMPLETED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 size={12} className="text-emerald-600" /> COMPLETED
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="text-right">
                        {isStudent ? (
                          computedStatus === 'ONGOING' ? (
                            <button
                              onClick={() => handleOpenTakeModal(item)}
                              className="btn bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs py-1.5 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 ml-auto"
                            >
                              <Play size={13} />
                              <span>Take Test</span>
                            </button>
                          ) : computedStatus === 'UPCOMING' ? (
                            <button
                              disabled
                              title={`Test available on ${item.assessmentDate}`}
                              className="btn bg-gray-100 text-gray-400 border border-gray-200 font-bold text-xs py-1.5 px-3 rounded-lg cursor-not-allowed flex items-center gap-1.5 ml-auto"
                            >
                              <Clock size={13} />
                              <span>Take Test</span>
                            </button>
                          ) : (
                            // COMPLETED STATUS
                            completedAssessments[item.id] ? (
                              <span className="badge-green inline-flex items-center gap-1 py-1 px-2.5 font-bold text-xs ml-auto">
                                <CheckCircle2 size={13} /> View Result ({completedAssessments[item.id].score}/{item.totalMarks})
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200 font-semibold text-xs inline-flex items-center gap-1 ml-auto">
                                View Result
                              </span>
                            )
                          )
                        ) : (
                          // FACULTY ACTIONS
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-icon"><FileText size={32} /></div>
                      <h4 className="text-sm font-bold text-gray-700">No Assessments Scheduled</h4>
                      <p className="text-xs text-gray-400 max-w-sm">No monthly assessments found for Batch '{batchId}'.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT TAKE ASSESSMENT MODAL */}
      {takeModalOpen && isStudent && targetAssessment && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <div className="modal-header bg-indigo-50">
              <div>
                <h3 className="text-base font-bold text-indigo-900">Take Monthly Assessment</h3>
                <p className="text-xs text-indigo-700">{targetAssessment.title} • {targetAssessment.durationInMinutes} Mins • {targetAssessment.totalMarks} Marks</p>
              </div>
              <button onClick={() => setTakeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStudentSubmitAnswers}>
              <div className="modal-body flex flex-col gap-4">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col gap-3">
                  <p className="text-xs font-bold text-gray-800">Q1. Explain the primary architecture and implementation concepts of {targetAssessment.subject}?</p>
                  <textarea
                    rows="3"
                    required
                    placeholder="Type your answer response..."
                    value={studentAnswers.q1 || ''}
                    onChange={(e) => setStudentAnswers({ ...studentAnswers, q1: e.target.value })}
                    className="form-textarea text-xs"
                  />
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col gap-3">
                  <p className="text-xs font-bold text-gray-800">Q2. Write code snippet or design pattern for {targetAssessment.subject} module?</p>
                  <textarea
                    rows="3"
                    required
                    placeholder="Write code solution or explanation..."
                    value={studentAnswers.q2 || ''}
                    onChange={(e) => setStudentAnswers({ ...studentAnswers, q2: e.target.value })}
                    className="form-textarea text-xs font-mono"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setTakeModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-700 font-bold">
                  <CheckCircle2 size={16} />
                  <span>Submit Answers</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FACULTY CREATE/EDIT MODAL */}
      {modalOpen && !isStudent && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? 'Edit Monthly Assessment' : 'Create Monthly Assessment'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Assessment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly Technical Assessment 1"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="Data Structures / Spring Boot"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Marks</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      min="5"
                      value={formData.durationInMinutes}
                      onChange={(e) => setFormData({ ...formData, durationInMinutes: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Assessment Date</label>
                  <input
                    type="date"
                    required
                    value={formData.assessmentDate}
                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Topics covered, syllabus details..."
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
                  <span>{editingId ? 'Update Assessment' : 'Save Assessment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
