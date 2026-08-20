import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getStudentAssignmentsByBatch,
  getAssignmentsByBatch,
  submitAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../api/assignmentApi';
import { uploadFile } from '../api/fileApi';
import {
  Plus, Trash2, Search, FileText, Upload, Paperclip, ExternalLink,
  X, Check, Clock, Calendar, Award, ArrowUpDown, ChevronRight,
  FileCheck, CheckCircle, ShieldAlert, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Assignments() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const studentId = user?.studentId || user?.id || user?.email || '';
  const trainerId = user?.id || localStorage.getItem('trainerId') || '';
  const batchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || '';

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DUE_NEAREST');

  // Modal State for View Assignment / Submit Assignment (STUDENT)
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submissionRemarks, setSubmissionRemarks] = useState('');
  const [uploading, setUploading] = useState(false);

  // Modal State for Trainer Create/Edit
  const [trainerModalOpen, setTrainerModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [formData, setFormData] = useState({
    trainerId: trainerId,
    batchId: batchId,
    title: '',
    description: '',
    subject: '',
    totalMarks: 100,
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    attachmentUrl: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchAssignments();
  }, [studentId, batchId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      console.log("Student batchId:", batchId);
      if (isStudent) {
        const res = await getStudentAssignmentsByBatch(batchId);
        console.log("API response status:", res.status);
        console.log("API response data:", res.data);
        if (res.data && Array.isArray(res.data)) {
          setAssignments(res.data);
          console.log("Number of assignments received by React:", res.data.length);
        } else {
          setAssignments([]);
        }
      } else {
        const res = await getAssignmentsByBatch(batchId);
        if (res.data && Array.isArray(res.data)) {
          setAssignments(res.data);
        } else {
          setAssignments([]);
        }
      }
    } catch (err) {
      console.error('Error fetching assignments from backend API:', err);
      toast.error('Unable to load assignments. Please try again.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const isPendingOrActive = (status) => !status || status === 'PENDING' || status === 'ACTIVE';

  // --- METRIC COMPUTATIONS (Real Data Only) ---
  const totalCount = assignments.length;
  const pendingCount = assignments.filter(a => isPendingOrActive(a.status)).length;
  const submittedCount = assignments.filter(a => a.status === 'SUBMITTED').length;
  const evaluatedCount = assignments.filter(a => a.status === 'EVALUATED').length;
  const overdueCount = assignments.filter(a => a.status === 'OVERDUE').length;
  const completionPct = totalCount > 0 ? Math.round(((submittedCount + evaluatedCount) / totalCount) * 100) : 0;

  const uniqueSubjects = Array.from(new Set(assignments.map(a => a.subject).filter(Boolean)));

  let filtered = assignments.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL'
      || (statusFilter === 'PENDING' && isPendingOrActive(item.status))
      || item.status === statusFilter;
    const matchesSubject = subjectFilter === 'ALL' || item.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'DUE_NEAREST') {
      return new Date(a.dueDate || '2099-12-31') - new Date(b.dueDate || '2099-12-31');
    }
    if (sortBy === 'DUE_LATEST') {
      return new Date(b.dueDate || '1970-01-01') - new Date(a.dueDate || '1970-01-01');
    }
    if (sortBy === 'RECENT') {
      return new Date(b.assignedDate || '1970-01-01') - new Date(a.assignedDate || '1970-01-01');
    }
    return 0;
  });

  const getDeadlineBadge = (dueDateStr, status) => {
    if (status === 'SUBMITTED' || status === 'EVALUATED') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">Submitted</span>;
    }
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || status === 'OVERDUE') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">Overdue ({Math.abs(diffDays)}d ago)</span>;
    }
    if (diffDays === 0) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Due Today</span>;
    }
    if (diffDays <= 3) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">Due in {diffDays} days</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Due in {diffDays} days</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'EVALUATED') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit"><CheckCircle size={12} /> Evaluated</span>;
    }
    if (status === 'SUBMITTED') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 flex items-center gap-1 w-fit"><FileCheck size={12} /> Submitted</span>;
    }
    if (status === 'OVERDUE') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 flex items-center gap-1 w-fit"><ShieldAlert size={12} /> Overdue</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit"><Clock size={12} /> Active / Pending</span>;
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      trainerId: trainerId,
      batchId: batchId,
      title: '',
      description: '',
      subject: '',
      totalMarks: 100,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      attachmentUrl: '',
      status: 'ACTIVE'
    });
    setTrainerModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      trainerId: item.trainerId || trainerId,
      batchId: item.batchId || batchId,
      title: item.title || '',
      description: item.description || '',
      subject: item.subject || '',
      totalMarks: item.totalMarks || 100,
      assignedDate: item.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: item.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      attachmentUrl: item.attachmentUrl || '',
      status: item.status || 'ACTIVE'
    });
    setTrainerModalOpen(true);
  };

  const handleTrainerSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Assignment title is required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateAssignment(editingId, formData);
        toast.success('Assignment updated successfully!');
      } else {
        await createAssignment(formData);
        toast.success('Assignment created successfully!');
      }
      setTrainerModalOpen(false);
      fetchAssignments();
    } catch (err) {
      console.error('Failed to save assignment:', err);
      toast.error(err.response?.data?.message || 'Failed to save assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrainerDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      toast.success('Assignment deleted successfully!');
      fetchAssignments();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      toast.error('Failed to delete assignment.');
    }
  };

  const handleTrainerFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const res = await uploadFile(file);
      if (res.data?.fileUrl) {
        setFormData(prev => ({ ...prev, attachmentUrl: res.data.fileUrl }));
        toast.success('File uploaded and attached successfully!');
      }
    } catch (err) {
      console.error('Attachment upload failed:', err);
      toast.error('File upload failed. Please check backend.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleOpenViewModal = (item) => {
    setSelectedAssignment(item);
    setSelectedFile(null);
    setFileError('');
    setSubmissionRemarks('');
    setViewModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds 25 MB limit.');
      setSelectedFile(null);
      return;
    }
    setFileError('');
    setSelectedFile(file);
  };

  const handleStudentUploadSubmission = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    setUploading(true);
    try {
      const uploadRes = await uploadFile(selectedFile);
      const fileUrl = uploadRes.data?.fileUrl || '';

      await submitAssignment({
        assignmentId: selectedAssignment.id,
        studentId: studentId,
        batchId: batchId,
        fileUrl: fileUrl,
        fileName: selectedFile.name,
        remarks: submissionRemarks,
        submissionDate: new Date().toISOString()
      });

      toast.success('Assignment submitted successfully!');
      setViewModalOpen(false);
      fetchAssignments();
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error(err.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{isStudent ? 'My Assignments' : 'Assignment Management'}</h1>
          <p className="page-subtitle">
            {isStudent
              ? 'View course assignments, track deadlines, and submit your solution files.'
              : 'Create coursework assignments, manage deadlines, and evaluate student submissions.'}
          </p>
        </div>

        {!isStudent && (
          <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200 font-bold">
            <Plus size={18} />
            <span>New Assignment</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-gray-600 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total</span>
          <p className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">{totalCount}</p>
        </div>

        <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-amber-500 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Pending / Active</span>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-900 mt-1">{pendingCount}</p>
        </div>

        <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-blue-600 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Submitted</span>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-900 mt-1">{submittedCount}</p>
        </div>

        <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-emerald-600 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Evaluated</span>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-1">{evaluatedCount}</p>
        </div>

        <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-red-600 shadow-2xs">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Overdue</span>
          <p className="text-xl sm:text-2xl font-extrabold text-red-900 mt-1">{overdueCount}</p>
        </div>

        <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-purple-600 shadow-2xs">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Completion</span>
          <p className="text-xl sm:text-2xl font-extrabold text-purple-900 mt-1">{completionPct}%</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by assignment title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 p-1 rounded-xl text-xs">
            {['ALL', 'PENDING', 'SUBMITTED', 'EVALUATED', 'OVERDUE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                  statusFilter === st
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {uniqueSubjects.length > 0 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="form-input text-xs w-auto border-gray-200 py-1.5"
            >
              <option value="ALL">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input text-xs w-auto border-gray-200 py-1.5 font-medium"
            >
              <option value="DUE_NEAREST">Due Date (Nearest)</option>
              <option value="DUE_LATEST">Due Date (Latest)</option>
              <option value="RECENT">Recently Assigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* ASSIGNMENT LIST */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="spinner w-8 h-8 border-red-600 mx-auto" />
          <p className="text-xs text-gray-400 mt-3">Loading coursework assignments...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card p-5 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-blue-600"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="badge-blue text-[10px] font-bold">{item.subject || 'General'}</span>
                  {getDeadlineBadge(item.dueDate, item.status)}
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description || 'Coursework assignment details.'}</p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-gray-400" /> Assigned: {item.assignedDate || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1 text-red-700 font-bold">
                    <Clock size={13} /> Due: {item.dueDate || 'Open'}
                  </span>
                  <span className="flex items-center gap-1 text-gray-700 font-bold">
                    <Award size={13} className="text-amber-500" /> Max Marks: {item.totalMarks || 100} pts
                  </span>
                </div>
              </div>

              <div className="flex items-center md:flex-col md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0">
                {!isStudent ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTrainerDelete(item.id)}
                      className="btn-outline py-1.5 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenViewModal(item)}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>View Assignment</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <FileText size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">No assignments assigned yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL' || subjectFilter !== 'ALL'
              ? 'No assignments match your selected search or filter criteria.'
              : `There are currently no assignments posted for Batch '${batchId}'.`}
          </p>
        </div>
      )}

      {/* STUDENT VIEW ASSIGNMENT MODAL */}
      {viewModalOpen && selectedAssignment && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <div className="modal-header bg-gradient-to-r from-blue-50 to-indigo-50/60 pb-4 border-b border-blue-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-blue text-[10px] font-bold">{selectedAssignment.subject || 'General'}</span>
                  {getStatusBadge(selectedAssignment.status)}
                </div>
                <h2 className="text-lg font-extrabold text-gray-900">{selectedAssignment.title}</h2>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body space-y-6">
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">Assignment Details</h3>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedAssignment.description || 'No detailed instructions provided.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-gray-200/80">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Trainer</p>
                    <p className="font-bold text-gray-800">{selectedAssignment.trainerName || 'Technical Trainer'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned Date</p>
                    <p className="font-bold text-gray-800">{selectedAssignment.assignedDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Due Date</p>
                    <p className="font-bold text-red-700">{selectedAssignment.dueDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Max Marks</p>
                    <p className="font-bold text-gray-800">{selectedAssignment.totalMarks || 100} Points</p>
                  </div>
                </div>

                {selectedAssignment.attachmentUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedAssignment.attachmentUrl.startsWith('/') ? `http://localhost:8080${selectedAssignment.attachmentUrl}` : selectedAssignment.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-100/60 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition"
                    >
                      <Paperclip size={14} />
                      <span>Download Assignment Question File</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* UPLOAD FORM INSIDE VIEW ASSIGNMENT MODAL */}
              <form onSubmit={handleStudentUploadSubmission} className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">
                    Submit Your Assignment
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Choose Solution File (PDF, DOCX, ZIP, PNG, Code)
                    </label>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer inline-flex items-center gap-2 w-fit">
                        <Upload size={14} />
                        <span>Select File</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.txt,.js,.java,.py"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {selectedFile && (
                        <div className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 flex-1">
                          <span className="truncate">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {fileError && (
                      <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {fileError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Submission Remarks / Student Notes (Optional)
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Add comments or notes for your trainer..."
                      value={submissionRemarks}
                      onChange={(e) => setSubmissionRemarks(e.target.value)}
                      className="form-textarea text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setViewModalOpen(false)}
                    className="btn-outline py-2 px-4 text-xs font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 text-xs rounded-xl shadow-md disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="spinner border-white border-t-transparent w-4 h-4" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span>{uploading ? 'Uploading...' : 'Upload & Submit Assignment'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FACULTY CREATE/EDIT MODAL */}
      {trainerModalOpen && !isStudent && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <button onClick={() => setTrainerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTrainerSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java Collections Practice"
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
                      placeholder="Java / DBMS / React"
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
                    <label className="form-label">Assigned Date</label>
                    <input
                      type="date"
                      required
                      value={formData.assignedDate}
                      onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Provide details and instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="form-label font-bold text-gray-800">Task File Attachment</label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="btn-secondary cursor-pointer py-2 px-3 text-xs flex items-center gap-2">
                      {uploadingAttachment ? <div className="spinner border-red-600 w-4 h-4" /> : <Upload size={16} />}
                      <span>{uploadingAttachment ? 'Uploading...' : 'Choose File'}</span>
                      <input type="file" onChange={handleTrainerFileUpload} disabled={uploadingAttachment} className="hidden" />
                    </label>
                    {formData.attachmentUrl && (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg">File Attached</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setTrainerModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={submitting || uploadingAttachment} className="btn-primary font-bold">
                  <span>{editingId ? 'Update Assignment' : 'Create Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
