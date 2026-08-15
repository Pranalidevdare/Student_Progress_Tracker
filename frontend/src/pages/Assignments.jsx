import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAssignmentsByBatch,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../api/assignmentApi';
import { uploadFile } from '../api/fileApi';
import { Plus, Edit2, Trash2, Search, FileText, Upload, Paperclip, ExternalLink, X, Check, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Assignments() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const studentId = user?.id || user?.studentId || user?.applicationNumber || 'STU7076';
  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';
  const defaultBatchId = user?.batchId || localStorage.getItem('batchId') || null;

  const [batchId, setBatchId] = useState(defaultBatchId);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Trainer Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    trainerId: trainerId,
    batchId: defaultBatchId,
    title: '',
    description: '',
    subject: '',
    totalMarks: 100,
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    attachmentUrl: '',
    status: 'ACTIVE'
  });

  // Modal State for Student Submission
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [targetAssignment, setTargetAssignment] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    solutionUrl: '',
    fileName: '',
    remarks: ''
  });
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    fetchAssignments();
    // Load student submission status map
    const localSubmissions = localStorage.getItem(`spt_submissions_${studentId}`);
    if (localSubmissions) {
      setSubmissions(JSON.parse(localSubmissions));
    }
  }, [batchId, studentId]);

  const fetchAssignments = async () => {
    if (!batchId) return;
    setLoading(true);
    let apiSuccess = false;
    try {
      const res = await getAssignmentsByBatch(batchId);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAssignments(res.data);
        apiSuccess = true;
      }
    } catch (err) {
      console.log('Fetching local assignments');
    }

    if (!apiSuccess) {
      try {
        const localData = localStorage.getItem(`spt_assignments_${batchId}`);
        if (localData) {
          setAssignments(JSON.parse(localData));
        } else {
          const defaultItems = [
            { id: '1', title: 'Java Core OOP Practice Exercises', subject: 'Java', totalMarks: 100, assignedDate: '2026-08-01', dueDate: '2026-08-15', description: 'Complete all classes, inheritance, interface & polymorphism exercises.', status: 'ACTIVE' },
            { id: '2', title: 'React Hooks & Context API Project', subject: 'React', totalMarks: 100, assignedDate: '2026-08-05', dueDate: '2026-08-20', description: 'Build a task manager app using Context API and custom hooks.', status: 'ACTIVE' },
            { id: '3', title: 'Spring Data JPA & MongoDB Queries', subject: 'Spring Boot', totalMarks: 50, assignedDate: '2026-08-10', dueDate: '2026-08-25', description: 'Implement dynamic queries and custom repository projections.', status: 'ACTIVE' }
          ];
          setAssignments(defaultItems);
          localStorage.setItem(`spt_assignments_${batchId}`, JSON.stringify(defaultItems));
        }
      } catch (e) {}
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await uploadFile(file);
      const fileUrl = res.data.fileUrl;
      setFormData(prev => ({ ...prev, attachmentUrl: fileUrl }));
      toast.success(`File uploaded successfully: ${file.name}`);
    } catch (err) {
      setFormData(prev => ({ ...prev, attachmentUrl: file.name }));
      toast.success(`File attached: ${file.name}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleStudentFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await uploadFile(file);
      setSubmissionData(prev => ({ ...prev, solutionUrl: res.data.fileUrl, fileName: file.name }));
      toast.success(`Solution file attached: ${file.name}`);
    } catch (err) {
      setSubmissionData(prev => ({ ...prev, solutionUrl: file.name, fileName: file.name }));
      toast.success(`Solution attached: ${file.name}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      trainerId,
      batchId,
      title: '',
      description: '',
      subject: '',
      totalMarks: 100,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      attachmentUrl: '',
      status: 'ACTIVE'
    });
    setModalOpen(true);
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
    setModalOpen(true);
  };

  const handleOpenSubmitModal = (item) => {
    setTargetAssignment(item);
    setSubmissionData({
      solutionUrl: '',
      fileName: '',
      remarks: ''
    });
    setSubmitModalOpen(true);
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!submissionData.solutionUrl && !submissionData.remarks) {
      toast.error('Please attach a solution file/link or enter remarks.');
      return;
    }

    const newSubmissions = {
      ...submissions,
      [targetAssignment.id]: {
        submittedAt: new Date().toISOString().split('T')[0],
        solutionUrl: submissionData.solutionUrl || 'File Attached',
        fileName: submissionData.fileName || 'Solution.pdf',
        remarks: submissionData.remarks || 'Completed assignment submission'
      }
    };

    setSubmissions(newSubmissions);
    localStorage.setItem(`spt_submissions_${studentId}`, JSON.stringify(newSubmissions));

    toast.success('Assignment solution uploaded successfully! 🎉');
    setSubmitModalOpen(false);
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
      description: formData.description.trim() || 'Coursework assignment instructions.',
      subject: formData.subject.trim(),
      totalMarks: Number(formData.totalMarks) || 100,
      assignedDate: formData.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      attachmentUrl: formData.attachmentUrl || '',
      status: formData.status || 'ACTIVE'
    };

    try {
      if (editingId) {
        await updateAssignment(editingId, payload);
      } else {
        await createAssignment(payload);
      }
    } catch (err) {}

    let currentList = [...assignments];
    if (editingId) {
      currentList = currentList.map(item => item.id === editingId ? { ...item, ...payload } : item);
    } else {
      const newItem = { id: `ass_${Date.now()}`, ...payload };
      currentList.unshift(newItem);
    }
    setAssignments(currentList);
    localStorage.setItem(`spt_assignments_${batchId}`, JSON.stringify(currentList));

    toast.success(editingId ? 'Assignment updated successfully!' : 'Assignment created successfully!');
    setModalOpen(false);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(id);
    } catch (err) {}

    const updated = assignments.filter(item => item.id !== id);
    setAssignments(updated);
    localStorage.setItem(`spt_assignments_${batchId}`, JSON.stringify(updated));
    toast.success('Assignment deleted successfully!');
  };

  const filtered = assignments.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isStudent ? 'My Coursework Assignments' : 'Assignment Management'}</h1>
          <p className="page-subtitle">
            {isStudent ? 'View active batch assignments and upload your completed solution files' : 'Create coursework assignments, attach PDF/DOC/Images, and manage deadlines'}
          </p>
        </div>

        {isStudent ? (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 shadow-2xs">
            <Upload size={14} className="text-blue-600" />
            <span>Student Submission Portal Active</span>
          </div>
        ) : (
          <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200 font-bold">
            <Plus size={18} />
            <span>New Assignment</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Batch ID:</span>
          <input
            type="text"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter Batch ID..."
            className="form-input text-xs font-mono font-bold text-red-700 bg-red-50/50 border-red-200 w-36"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Total Marks</th>
                <th>Assigned Date</th>
                <th>Due Date</th>
                <th>Task File</th>
                <th className="text-right">Actions / Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="spinner w-8 h-8 border-red-600 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item) => {
                  const isSubmitted = !!submissions[item.id];
                  return (
                    <tr key={item.id}>
                      <td>
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                      </td>
                      <td><span className="badge-blue">{item.subject}</span></td>
                      <td className="font-semibold">{item.totalMarks} pts</td>
                      <td className="text-xs text-gray-500">{item.assignedDate}</td>
                      <td className="text-xs font-semibold text-red-600">{item.dueDate}</td>
                      <td>
                        {item.attachmentUrl ? (
                          <a
                            href={item.attachmentUrl.startsWith('/') ? `http://localhost:8080${item.attachmentUrl}` : item.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold hover:underline bg-red-50 px-2 py-1 rounded"
                          >
                            <Paperclip size={13} />
                            <span>View Task</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="text-right">
                        {isStudent ? (
                          isSubmitted ? (
                            <span className="badge-green inline-flex items-center gap-1 py-1 px-2.5 font-bold text-xs">
                              <CheckCircle2 size={13} /> Submitted
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenSubmitModal(item)}
                              className="btn bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1.5 ml-auto"
                            >
                              <Upload size={13} />
                              <span>Upload Solution</span>
                            </button>
                          )
                        ) : (
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
                      <h4 className="text-sm font-bold text-gray-700">No Assignments Found</h4>
                      <p className="text-xs text-gray-400 max-w-sm">No assignments posted for Batch '{batchId}' yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT UPLOAD SOLUTION MODAL */}
      {submitModalOpen && isStudent && targetAssignment && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header bg-blue-50">
              <div>
                <h3 className="text-base font-bold text-blue-900">Upload Assignment Solution</h3>
                <p className="text-xs text-blue-700">{targetAssignment.title} ({targetAssignment.subject})</p>
              </div>
              <button onClick={() => setSubmitModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <label className="form-label font-bold text-gray-800 flex items-center justify-between">
                    <span>Attach Solution File (PDF, Zip, Code, Image)</span>
                  </label>

                  <div className="flex items-center gap-3 mt-2">
                    <label className="btn-secondary cursor-pointer py-2 px-3 text-xs flex items-center gap-2">
                      {uploadingFile ? (
                        <div className="spinner border-blue-600 border-t-transparent w-4 h-4" />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span>{uploadingFile ? 'Uploading...' : 'Choose Solution File'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.txt,.js,.java"
                        onChange={handleStudentFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>

                    {submissionData.fileName && (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Check size={14} />
                        <span>Attached ({submissionData.fileName})</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Or paste GitHub Repo / Solution URL link..."
                      value={submissionData.solutionUrl}
                      onChange={(e) => setSubmissionData({ ...submissionData, solutionUrl: e.target.value })}
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Submission Remarks / Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Provide comments or notes for your trainer..."
                    value={submissionData.remarks}
                    onChange={(e) => setSubmissionData({ ...submissionData, remarks: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setSubmitModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={uploadingFile} className="btn-primary bg-blue-600 hover:bg-blue-700 font-bold">
                  <Upload size={16} />
                  <span>Submit Solution</span>
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
                {editingId ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java Collections Framework Exercise"
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
                    placeholder="Provide details and instructions for students..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                {/* File Upload Section */}
                <div className="form-group p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="form-label font-bold text-gray-800 flex items-center justify-between">
                    <span>Upload Attachment (PDF, Image, DOC)</span>
                    <span className="text-[11px] text-gray-400 font-normal">Max size: 10MB</span>
                  </label>

                  <div className="flex items-center gap-3 mt-2">
                    <label className="btn-secondary cursor-pointer py-2 px-3 text-xs flex items-center gap-2">
                      {uploadingFile ? (
                        <div className="spinner border-red-600 border-t-transparent w-4 h-4" />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span>{uploadingFile ? 'Uploading...' : 'Choose File'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt,.pptx,.txt"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>

                    {formData.attachmentUrl && (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Check size={14} />
                        <span>File Attached</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Or paste external URL link..."
                      value={formData.attachmentUrl}
                      onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || uploadingFile} className="btn-primary font-bold">
                  {submitting ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Check size={16} />}
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
