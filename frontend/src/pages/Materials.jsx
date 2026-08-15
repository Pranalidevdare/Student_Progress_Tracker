import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMaterialsByBatch,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialFile
} from '../api/materialApi';
import { uploadFile } from '../api/fileApi';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Upload,
  FileText,
  FileCode,
  Image as ImageIcon,
  Presentation,
  Paperclip,
  ExternalLink,
  X,
  Check,
  Lock,
  AlertCircle,
  Download,
  Eye,
  FileCheck,
  Search,
  Filter,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';

export default function Materials() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const trainerId = user?.id || user?.email || localStorage.getItem('trainerId') || 'TRN001';
  const defaultBatchId = user?.batchId || localStorage.getItem('batchId') || 'BATCH001';

  const [batchId, setBatchId] = useState(defaultBatchId);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [previewModal, setPreviewModal] = useState({ open: false, title: '', url: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Modal State for Trainer/Admin
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    trainerId: trainerId,
    batchId: defaultBatchId,
    title: '',
    description: '',
    subject: '',
    materialType: 'PDF',
    fileName: '',
    fileUrl: '',
    fileSize: null
  });

  useEffect(() => {
    fetchMaterials();
  }, [batchId]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await getMaterialsByBatch(batchId);
      if (res.data && Array.isArray(res.data)) {
        setMaterials(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch materials from backend', err);
      toast.error('Failed to load study materials from server.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Auto Detect Material Type & Validate File
  const processSelectedFile = (file) => {
    setValidationError('');
    if (!file) return false;

    // 1. File size check (Max 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const err = 'File size exceeds maximum limit of 25 MB.';
      setValidationError(err);
      toast.error(err);
      return false;
    }

    // 2. Format check
    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'txt', 'zip'];
    if (!allowedExts.includes(ext)) {
      const err = 'Unsupported file format. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG.';
      setValidationError(err);
      toast.error(err);
      return false;
    }

    // 3. Auto detect Material Type
    let detectedType = 'PDF';
    if (['doc', 'docx', 'txt'].includes(ext)) detectedType = 'DOC';
    else if (['ppt', 'pptx'].includes(ext)) detectedType = 'PPT';
    else if (['png', 'jpg', 'jpeg'].includes(ext)) detectedType = 'IMAGE';

    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      fileName: file.name,
      materialType: detectedType,
      fileSize: formatBytes(file.size)
    }));

    return true;
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setValidationError('');
    setFormData(prev => ({
      ...prev,
      fileName: '',
      fileUrl: '',
      fileSize: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Modal Open Handlers
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setSelectedFile(null);
    setValidationError('');
    setUploadProgress(0);
    setFormData({
      trainerId,
      batchId,
      title: '',
      description: '',
      subject: '',
      materialType: 'PDF',
      fileName: '',
      fileUrl: '',
      fileSize: null
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setSelectedFile(null);
    setValidationError('');
    setUploadProgress(0);
    setFormData({
      trainerId: item.trainerId || trainerId,
      batchId: item.batchId || batchId,
      title: item.title || '',
      description: item.description || '',
      subject: item.subject || '',
      materialType: item.materialType || 'PDF',
      fileName: item.fileName || '',
      fileUrl: item.fileUrl || '',
      fileSize: item.fileSize || null
    });
    setModalOpen(true);
  };

  // Form Submit Handler with Backend Validation & Mandatory File Check
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // MANDATORY FIELD VALIDATIONS
    if (!formData.title || !formData.title.trim()) {
      const err = 'Resource Title is required.';
      setValidationError(err);
      toast.error(err);
      return;
    }

    if (!formData.subject || !formData.subject.trim()) {
      const err = 'Subject is required.';
      setValidationError(err);
      toast.error(err);
      return;
    }

    // MANDATORY FILE REQUIREMENT CHECK
    if (!selectedFile && !formData.fileUrl) {
      const err = 'Please select a file to upload.';
      setValidationError(err);
      toast.error(err);
      return;
    }

    setSubmitting(true);
    let finalFileUrl = formData.fileUrl;
    let finalFileName = formData.fileName;

    try {
      // Step 1: Upload file to backend server if a new file was selected
      if (selectedFile) {
        setUploadingFile(true);
        setUploadProgress(30);

        const uploadRes = await uploadFile(selectedFile);
        setUploadProgress(80);

        if (uploadRes.data && uploadRes.data.fileUrl) {
          finalFileUrl = uploadRes.data.fileUrl;
          finalFileName = uploadRes.data.fileName || selectedFile.name;
        } else {
          throw new Error('File upload failed on server.');
        }
      }

      setUploadProgress(90);

      // Step 2: Save Material Metadata to MongoDB
      const payload = {
        ...formData,
        fileUrl: finalFileUrl,
        fileName: finalFileName
      };

      if (editingId) {
        await updateMaterial(editingId, payload);
        toast.success('Study material updated successfully! ✨');
      } else {
        await uploadMaterial(payload);
        toast.success('Study material uploaded successfully! 🚀');
      }

      setUploadProgress(100);
      setModalOpen(false);
      fetchMaterials();
    } catch (err) {
      console.error('Upload Error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to upload material. Please try again.';
      setValidationError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      await deleteMaterial(id);
      toast.success('Study material deleted successfully.');
      fetchMaterials();
    } catch (err) {
      console.error('Delete Error:', err);
      toast.error('Failed to delete material.');
    }
  };

  // Dedicated Material View Handler
  const handleViewFile = async (item) => {
    if (!item?.id) {
      toast.error('Unable to open this material. Invalid material ID.');
      return;
    }

    const matType = String(item.materialType || '').toUpperCase();
    const fileName = String(item.fileName || '').toLowerCase();
    const isDocOrPpt = matType.includes('DOC') || matType.includes('WORD') || matType.includes('PPT') ||
                       matType.includes('PRESENTATION') || fileName.endsWith('.doc') || fileName.endsWith('.docx') ||
                       fileName.endsWith('.ppt') || fileName.endsWith('.pptx') || fileName.endsWith('.zip');

    if (isDocOrPpt) {
      toast('Preview is not available for this document format. Please click Download to view it.', {
        icon: 'ℹ️',
        duration: 4500,
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
          border: '1px solid #fed7d7'
        }
      });
      return;
    }

    setViewingId(item.id);
    try {
      const response = await getMaterialFile(item.id, 'view');
      const blob = response.data;
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blobUrl = window.URL.createObjectURL(blob);

      if (contentType.includes('image') || matType.includes('IMAGE') || fileName.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
        setPreviewModal({
          open: true,
          title: item.title || item.fileName || 'Image Preview',
          url: blobUrl,
          type: 'IMAGE'
        });
      } else if (contentType.includes('pdf') || matType.includes('PDF') || fileName.endsWith('.pdf')) {
        window.open(blobUrl, '_blank');
      } else if (contentType.includes('text') || fileName.endsWith('.txt')) {
        window.open(blobUrl, '_blank');
      } else {
        toast('Preview is not available for this file type. Please click Download.', { icon: 'ℹ️' });
      }
    } catch (err) {
      console.error('File View Error:', err);
      if (err.response?.status === 403) {
        toast.error('You are not authorized to view this material.');
      } else if (err.response?.status === 404) {
        toast.error('Material file not found on server.');
      } else {
        toast.error('Unable to preview this material. Please try downloading it.');
      }
    } finally {
      setViewingId(null);
    }
  };

  // Dedicated Material Download Handler
  const handleDownloadFile = async (item) => {
    if (!item?.id) {
      toast.error('Unable to download this material. Invalid material ID.');
      return;
    }

    setDownloadingId(item.id);
    try {
      const response = await getMaterialFile(item.id, 'download');
      const blob = response.data;
      const disposition = response.headers['content-disposition'] || '';

      let filename = item.fileName || 'study_material';
      if (disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error('File Download Error:', err);
      if (err.response?.status === 403) {
        toast.error('You are not authorized to download this material.');
      } else if (err.response?.status === 404) {
        toast.error('Material file not found on server.');
      } else {
        toast.error('Unable to download this material. Please try again.');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getTypeBadge = (type) => {
    const t = String(type || 'PDF').toUpperCase();
    switch (t) {
      case 'PDF':
        return { icon: <FileText size={16} className="text-red-600" />, bg: 'bg-red-50 text-red-700 border-red-100', label: 'PDF Document' };
      case 'DOC':
      case 'DOCUMENT':
        return { icon: <FileText size={16} className="text-blue-600" />, bg: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Word Document' };
      case 'PPT':
      case 'PRESENTATION':
        return { icon: <Presentation size={16} className="text-amber-600" />, bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'PPT Presentation' };
      case 'IMAGE':
        return { icon: <ImageIcon size={16} className="text-emerald-600" />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Image File' };
      default:
        return { icon: <FileText size={16} className="text-gray-600" />, bg: 'bg-gray-50 text-gray-700 border-gray-100', label: 'Resource' };
    }
  };

  // Filter & Search Logic
  const filteredMaterials = materials.filter(m => {
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term || (
      m.title?.toLowerCase().includes(term) ||
      m.subject?.toLowerCase().includes(term) ||
      m.description?.toLowerCase().includes(term)
    );
    const matchesSubject = subjectFilter === 'ALL' || m.subject?.toUpperCase() === subjectFilter.toUpperCase();
    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = Array.from(new Set(materials.map(m => m.subject).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <BookOpen size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Course & Study Materials</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isStudent
                ? 'Access official lecture notes, PDFs, presentations, and study resources shared by faculty'
                : 'Upload PDFs, documents, presentations, and images for your assigned batch'}
            </p>
          </div>
        </div>

        {isStudent ? (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs">
            <Lock size={14} className="text-slate-500" />
            <span>Read-Only Resources</span>
          </div>
        ) : (
          <button
            onClick={handleOpenCreateModal}
            className="btn-primary shadow-md shadow-red-200 font-bold text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Upload New Material</span>
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search study material by title, subject or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white"
            >
              <option value="ALL">All Subjects</option>
              {uniqueSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchMaterials}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
            title="Refresh List"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* MATERIALS CARDS GRID */}
      {loading ? (
        <LoadingState message="Loading study materials from server..." />
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((item) => {
            const badgeInfo = getTypeBadge(item.materialType);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2.5 rounded-xl border ${badgeInfo.bg} flex items-center justify-center flex-shrink-0`}>
                      {badgeInfo.icon}
                    </div>

                    <span className="badge-blue font-extrabold text-[11px] px-2.5 py-0.5">
                      {item.subject}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  {item.fileName && (
                    <div className="p-2 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-[11px] text-gray-600">
                      <span className="font-mono truncate max-w-[180px]" title={item.fileName}>
                        📄 {item.fileName}
                      </span>
                      <span className="font-bold text-gray-400 uppercase text-[10px]">{item.materialType || 'PDF'}</span>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    {/* VIEW BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleViewFile(item)}
                      disabled={viewingId === item.id || downloadingId === item.id}
                      className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 bg-white hover:bg-red-50 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition disabled:opacity-50 cursor-pointer"
                      title="View / Preview Material"
                    >
                      {viewingId === item.id ? (
                        <div className="spinner border-red-600 border-t-transparent w-3.5 h-3.5" />
                      ) : (
                        <Eye size={13} className="text-red-600" />
                      )}
                      <span>{viewingId === item.id ? 'Opening...' : 'View'}</span>
                    </button>

                    {/* DOWNLOAD BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(item)}
                      disabled={downloadingId === item.id || viewingId === item.id}
                      className="btn-primary text-[11px] font-bold py-1.5 px-3 flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                      title="Download Original File"
                    >
                      {downloadingId === item.id ? (
                        <div className="spinner border-white border-t-transparent w-3.5 h-3.5" />
                      ) : (
                        <Download size={13} />
                      )}
                      <span>{downloadingId === item.id ? 'Downloading...' : 'Download'}</span>
                    </button>
                  </div>

                  {!isStudent && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Material"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Material"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No study materials yet"
          description="Upload PDFs, documents, presentations, or images for your assigned batch."
          actionLabel={!isStudent ? "Upload Material" : undefined}
          onAction={!isStudent ? handleOpenCreateModal : undefined}
        />
      )}

      {/* REDESIGNED UPLOAD NEW MATERIAL MODAL */}
      {modalOpen && !isStudent && (
        <div className="modal-backdrop">
          <div className="modal max-w-xl w-full">
            {/* MODAL HEADER */}
            <div className="modal-header border-b pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingId ? 'Edit Study Material' : 'Upload New Material'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Share study resources with your assigned batch
                  </p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-6 flex flex-col gap-4 text-xs">
                {/* VALIDATION ERROR ALERT */}
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* RESOURCE TITLE */}
                <div className="form-group">
                  <label className="form-label font-bold text-gray-800">Resource Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter resource title (e.g. Microservices Architecture Guide)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>

                {/* SUBJECT & MATERIAL TYPE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label font-bold text-gray-800">Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="Select / enter subject (e.g. Java, React, DBMS)"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input text-xs"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label font-bold text-gray-800">Material Type *</label>
                    <select
                      value={formData.materialType}
                      onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                      className="form-select text-xs font-semibold"
                    >
                      <option value="PDF">📄 PDF Document</option>
                      <option value="DOC">📝 Word / DOC File</option>
                      <option value="PPT">📊 PPT Presentation</option>
                      <option value="IMAGE">🖼️ Image File</option>
                    </select>
                  </div>
                </div>

                {/* FILE UPLOAD DROP ZONE (MANDATORY FILE AREA) */}
                <div className="form-group">
                  <label className="form-label font-bold text-gray-800 flex items-center justify-between">
                    <span>File Upload * <strong className="text-red-600 font-normal">(Compulsory)</strong></span>
                    <span className="text-[11px] text-gray-400 font-normal">Max size: 25 MB</span>
                  </label>

                  {!selectedFile && !formData.fileUrl ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                        isDragging
                          ? 'border-red-500 bg-red-50/80 scale-[1.01]'
                          : 'border-gray-300 bg-gray-50/70 hover:border-red-400 hover:bg-red-50/30'
                      }`}
                    >
                      <div className="p-3 bg-red-100/80 text-red-600 rounded-full">
                        <Upload size={24} />
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 text-xs">
                          📄 Drag & drop your file here
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          or <span className="text-red-600 font-bold underline">Choose File</span> from computer
                        </p>
                      </div>

                      <div className="text-[10px] text-gray-400 font-medium flex flex-col gap-0.5 pt-1 border-t border-gray-200/60 w-full max-w-xs">
                        <span>Supported formats: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG</span>
                        <span>Maximum file size: 25 MB</span>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.zip"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    /* SELECTED FILE DISPLAY CARD */
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl flex-shrink-0">
                          <FileCheck size={22} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 truncate text-xs" title={formData.fileName || selectedFile?.name}>
                            {formData.fileName || selectedFile?.name}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-2 mt-0.5">
                            <span className="badge-green text-[10px] px-1.5 py-0.2 font-extrabold">{formData.materialType}</span>
                            <span>{formData.fileSize || formatBytes(selectedFile?.size)}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveSelectedFile}
                        className="btn-outline text-[11px] font-bold py-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                      >
                        Remove / Replace File
                      </button>
                    </div>
                  )}
                </div>

                {/* UPLOAD PROGRESS BAR */}
                {(submitting || uploadingFile) && uploadProgress > 0 && (
                  <div className="form-group flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                      <span>Uploading to server...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div
                        className="h-full bg-red-600 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* DESCRIPTION */}
                <div className="form-group">
                  <label className="form-label font-bold text-gray-800">Description (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Short summary of topics covered in this study resource..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea text-xs"
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline font-bold text-xs py-2 px-4"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || uploadingFile || (!selectedFile && !formData.fileUrl)}
                  className="btn-primary font-bold text-xs py-2 px-4 shadow-md shadow-red-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="spinner border-white border-t-transparent w-4 h-4" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>{editingId ? 'Update Material' : 'Upload Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewModal.open && (
        <div className="modal-backdrop" onClick={() => setPreviewModal({ open: false, title: '', url: '', type: '' })}>
          <div
            className="modal max-w-3xl overflow-hidden p-0 bg-white rounded-2xl shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 truncate max-w-md">{previewModal.title}</h2>
                  <p className="text-[11px] text-gray-500 font-medium">Image Preview</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModal({ open: false, title: '', url: '', type: '' })}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 bg-gray-50 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewModal.url}
                alt={previewModal.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm border border-gray-200"
              />
            </div>

            <div className="modal-footer px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium">Click outside or close to dismiss</span>
              <button
                type="button"
                onClick={() => setPreviewModal({ open: false, title: '', url: '', type: '' })}
                className="btn-outline font-bold text-xs py-1.5 px-4"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
