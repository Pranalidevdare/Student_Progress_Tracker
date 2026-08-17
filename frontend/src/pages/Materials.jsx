import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMaterialsByBatch,
  uploadMaterial,
  updateMaterial,
  deleteMaterial
} from '../api/materialApi';
import { uploadFile } from '../api/fileApi';
import api from '../api/axios';
import { Plus, Edit2, Trash2, BookOpen, Upload, File, Video, Code, Paperclip, ExternalLink, X, Check, Lock, RefreshCw, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Materials() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const trainerId = user?.id || localStorage.getItem('trainerId') || '';
  const defaultBatchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || '';

  const [batchId, setBatchId] = useState(defaultBatchId);
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Modal State for Faculty/Admin only
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
    materialType: 'PDF',
    fileName: '',
    fileUrl: ''
  });

  useEffect(() => {
    if (!isStudent) {
      api.get('/batches/active')
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setBatches(res.data);
            if (!batchId) {
              setBatchId(res.data[0].id || res.data[0].batchName || '');
            }
          }
        })
        .catch(() => {});
    }
  }, [isStudent]);

  useEffect(() => {
    fetchMaterials();
  }, [batchId]);

  const fetchMaterials = async () => {
    if (!batchId && !isStudent) {
      setMaterials([]);
      return;
    }
    setLoading(true);
    setHasError(false);
    try {
      const activeBatch = batchId || defaultBatchId || 'BATCH001';
      const res = await getMaterialsByBatch(activeBatch);
      if (res && res.data && Array.isArray(res.data)) {
        setMaterials(res.data);
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error('Failed to load study materials:', err);
      if (err.response?.status === 404) {
        setMaterials([]);
      } else {
        setHasError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await uploadFile(file);
      const fileUrl = res.data.fileUrl || res.data.url;
      setFormData(prev => ({
        ...prev,
        fileUrl: fileUrl,
        fileName: file.name
      }));
      toast.success(`File uploaded: ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error('File upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      trainerId: trainerId || user?.id || '',
      batchId: batchId || defaultBatchId || '',
      title: '',
      description: '',
      subject: '',
      materialType: 'PDF',
      fileName: '',
      fileUrl: ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      trainerId: item.trainerId || trainerId,
      batchId: item.batchId || batchId || defaultBatchId,
      title: item.title || '',
      description: item.description || '',
      subject: item.subject || '',
      materialType: item.materialType || 'PDF',
      fileName: item.fileName || '',
      fileUrl: item.fileUrl || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) {
      toast.error('Title and Subject are required');
      return;
    }
    setSubmitting(true);

    const payload = {
      trainerId: formData.trainerId || trainerId,
      trainerName: user?.fullName || 'Faculty Trainer',
      batchId: formData.batchId || batchId || defaultBatchId,
      title: formData.title.trim(),
      description: formData.description.trim() || 'Course study material',
      subject: formData.subject.trim(),
      materialType: formData.materialType,
      fileName: formData.fileName,
      fileUrl: formData.fileUrl
    };

    try {
      if (editingId) {
        await updateMaterial(editingId, payload);
        toast.success('Study material updated');
      } else {
        await uploadMaterial(payload);
        toast.success('Study material uploaded successfully');
      }
      setModalOpen(false);
      fetchMaterials();
    } catch (err) {
      console.error('Failed to save study material:', err);
      toast.error(err.response?.data?.message || 'Failed to save material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      await deleteMaterial(id);
      toast.success('Study material deleted');
      fetchMaterials();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete study material');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <Video size={18} className="text-rose-600" />;
      case 'CODE':
        return <Code size={18} className="text-emerald-600" />;
      case 'NOTES':
        return <File size={18} className="text-amber-600" />;
      default:
        return <BookOpen size={18} className="text-purple-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{isStudent ? 'Course Study Materials' : 'Study Materials Repository'}</h1>
          <p className="page-subtitle">
            {isStudent ? 'Access lecture notes, source code, and reference materials uploaded by faculty' : 'Upload and organize syllabus materials and reference guides for your batch'}
          </p>
        </div>

        {isStudent ? (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200">
            <Lock size={14} className="text-slate-500" />
            <span>Read-Only Access</span>
          </div>
        ) : (
          <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200 font-bold">
            <Plus size={18} />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      {/* Batch Header Bar */}
      {!isStudent && batches.length > 0 && (
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">Filter by Batch:</span>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="form-input py-1 text-xs font-mono font-bold"
            >
              {batches.map(b => (
                <option key={b.id || b.batchName} value={b.id || b.batchName}>
                  {b.batchName || b.id}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-400">Total Materials: {materials.length}</span>
        </div>
      )}

      {/* Grid of Materials */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="spinner w-8 h-8 border-red-600 mx-auto" />
          <p className="text-xs text-gray-400 mt-3 font-semibold">Loading study materials...</p>
        </div>
      ) : hasError ? (
        <div className="card p-12 text-center bg-red-50/40 border border-red-200 space-y-3">
          <ShieldAlert size={24} className="text-red-600 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">Unable to load materials</h3>
          <p className="text-xs text-red-700">Please check your network and try again.</p>
          <button onClick={fetchMaterials} className="btn bg-red-600 text-white text-xs font-bold px-4 py-2 mx-auto flex items-center gap-1.5 shadow">
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item, idx) => (
            <div key={item.id || idx} className="card flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="card-body space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0">
                    {getTypeIcon(item.materialType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {item.subject || 'General'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2">{item.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                  {item.description || 'No description provided.'}
                </p>

                {item.fileName && (
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 text-xs font-mono text-gray-600 truncate">
                    <Paperclip size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{item.fileName}</span>
                  </div>
                )}
              </div>

              <div className="card-footer bg-gray-50/50 flex items-center justify-between p-3 border-t border-gray-100 text-xs">
                {item.fileUrl ? (
                  <a
                    href={item.fileUrl.startsWith('http') ? item.fileUrl : `http://localhost:8080${item.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Download / Open</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="text-gray-400 italic">No attachment</span>
                )}

                {!isStudent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 space-y-3">
          <BookOpen size={28} className="text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No Study Materials Available</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {isStudent
              ? 'No study materials have been uploaded for your batch yet.'
              : 'No materials uploaded for this batch. Click "Upload Material" to share guides and code samples.'}
          </p>
        </div>
      )}

      {/* Modal for Create / Edit Material */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-md">
            <div className="modal-header">
              <h3 className="text-sm font-bold text-gray-900">
                {editingId ? 'Edit Study Material' : 'Upload Study Material'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="form-group">
                <label className="form-label">Material Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Spring Boot REST Architecture Guide"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Topic</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Java, React, DSA, SQL"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Material Type</label>
                <select
                  value={formData.materialType}
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                  className="form-input"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="NOTES">Lecture Notes</option>
                  <option value="CODE">Source Code Repository</option>
                  <option value="VIDEO">Video Tutorial / Recording</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of the study material..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload File Attachment</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="form-input text-xs"
                />
                {uploadingFile && <p className="text-[11px] text-purple-600 mt-1">Uploading file...</p>}
                {formData.fileName && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Attached: {formData.fileName}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn bg-gray-100 text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : editingId ? 'Update Material' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
