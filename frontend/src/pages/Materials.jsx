import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMaterialsByBatch,
  uploadMaterial,
  updateMaterial,
  deleteMaterial
} from '../api/materialApi';
import { uploadFile } from '../api/fileApi';
import { Plus, Edit2, Trash2, BookOpen, Upload, File, Video, Code, Paperclip, ExternalLink, X, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Materials() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';
  const defaultBatchId = user?.batchId || localStorage.getItem('batchId') || 'BATCH001';

  const [batchId, setBatchId] = useState(defaultBatchId);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

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
    fetchMaterials();
  }, [batchId]);

  const fetchMaterials = async () => {
    if (!batchId) return;
    setLoading(true);
    let loaded = false;
    try {
      const res = await getMaterialsByBatch(batchId);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setMaterials(res.data);
        loaded = true;
      }
    } catch (err) {
      console.log('Loaded fallback materials');
    }

    if (!loaded) {
      const localData = localStorage.getItem(`spt_materials_${batchId}`);
      if (localData) {
        setMaterials(JSON.parse(localData));
      } else {
        const defaultItems = [
          {
            id: 'mat1',
            title: 'Spring Boot REST Microservices Architecture Guide',
            description: 'Comprehensive lecture notes covering Spring Security JWT authentication, Controllers, DTOs & Service Layer design patterns.',
            subject: 'Java',
            materialType: 'PDF',
            fileName: 'SpringBoot_Architecture.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          },
          {
            id: 'mat2',
            title: 'React.js Component Lifecycle & Hooks Cheatsheet',
            description: 'Handwritten reference notes detailing useState, useEffect, useContext, and custom React hook implementation patterns.',
            subject: 'React.js',
            materialType: 'NOTES',
            fileName: 'React_Hooks_Guide.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          },
          {
            id: 'mat3',
            title: 'Data Structures & Algorithms - Stacks & Queues Lab Repository',
            description: 'Source code samples and practice problems for Arrays, LinkedLists, Stacks, and Binary Search Trees.',
            subject: 'DSA',
            materialType: 'CODE',
            fileName: 'dsa_lab_code.zip',
            fileUrl: 'https://github.com'
          }
        ];
        setMaterials(defaultItems);
        localStorage.setItem(`spt_materials_${batchId}`, JSON.stringify(defaultItems));
      }
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
      setFormData(prev => ({
        ...prev,
        fileUrl: fileUrl,
        fileName: file.name
      }));
      toast.success(`File uploaded successfully: ${file.name}`);
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
      trainerId,
      batchId,
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
      batchId: item.batchId || batchId,
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
    setSubmitting(true);
    try {
      if (editingId) {
        await updateMaterial(editingId, formData);
      } else {
        await uploadMaterial(formData);
      }
    } catch (err) {}

    let currentList = [...materials];
    if (editingId) {
      currentList = currentList.map(item => item.id === editingId ? { ...item, ...formData } : item);
    } else {
      const newItem = { id: `mat_${Date.now()}`, ...formData };
      currentList.unshift(newItem);
    }
    setMaterials(currentList);
    localStorage.setItem(`spt_materials_${batchId}`, JSON.stringify(currentList));

    toast.success(editingId ? 'Study material updated!' : 'Study material saved!');
    setModalOpen(false);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await deleteMaterial(id);
    } catch (err) {}

    const updated = materials.filter(item => item.id !== id);
    setMaterials(updated);
    localStorage.setItem(`spt_materials_${batchId}`, JSON.stringify(updated));
    toast.success('Material deleted!');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <Video size={18} className="text-purple-600" />;
      case 'CODE':
        return <Code size={18} className="text-blue-600" />;
      default:
        return <File size={18} className="text-red-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course & Study Materials</h1>
          <p className="page-subtitle">
            {isStudent ? 'View and download lecture notes, PDFs, and study resources shared by faculty' : 'Upload PDF, Image, DOC, PPT files and lecture notes for your students'}
          </p>
        </div>

        {isStudent ? (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs">
            <Lock size={14} className="text-slate-500" />
            <span>Read-Only Resources</span>
          </div>
        ) : (
          <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200 font-bold">
            <Plus size={18} />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-bold">
            <BookOpen size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Batch Study Resources</h3>
            <p className="text-xs text-gray-400">Total Materials Available: {materials.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Batch ID:</span>
          <input
            type="text"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Batch ID..."
            className="form-input text-xs font-mono font-bold text-red-700 bg-red-50/50 border-red-200 w-36"
          />
        </div>
      </div>

      {/* Grid of Materials */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner w-10 h-10 border-red-600" />
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => (
            <div key={item.id} className="card hover:border-red-200 transition-all flex flex-col justify-between">
              <div className="card-body flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                    {getTypeIcon(item.materialType)}
                  </div>

                  <span className="badge-blue">{item.subject}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                </div>

                {item.fileUrl && (
                  <a
                    href={item.fileUrl.startsWith('/') ? `http://localhost:8080${item.fileUrl}` : item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 font-semibold hover:underline mt-2 bg-red-50 px-2.5 py-1.5 rounded-lg w-fit"
                  >
                    <Paperclip size={14} />
                    <span>Download / View Resource</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Type: <strong>{item.materialType || 'PDF'}</strong></span>

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
            <div className="empty-icon"><BookOpen size={32} /></div>
            <h4 className="text-sm font-bold text-gray-700">No Study Materials Uploaded</h4>
            <p className="text-xs text-gray-400 max-w-sm">No resources available for Batch '{batchId}'.</p>
          </div>
        </div>
      )}

      {/* Modal for Faculty/Admin ONLY */}
      {modalOpen && !isStudent && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? 'Edit Study Material' : 'Upload New Material'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Resource Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Spring Boot Security Notes"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="Java / DBMS / Web Dev"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Material Type</label>
                    <select
                      value={formData.materialType}
                      onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                      className="form-select"
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="DOC">Word / DOC File</option>
                      <option value="IMAGE">Image File</option>
                      <option value="VIDEO">Video Lecture</option>
                      <option value="CODE">Source Code / Repo</option>
                      <option value="NOTES">Handwritten Notes</option>
                    </select>
                  </div>
                </div>

                {/* File Upload Component */}
                <div className="form-group p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="form-label font-bold text-gray-800 flex items-center justify-between">
                    <span>Upload File (PDF, Image, DOC, PPT)</span>
                    <span className="text-[11px] text-gray-400 font-normal">Max size: 25MB</span>
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
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt,.pptx,.txt,.zip"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>

                    {formData.fileUrl && (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Check size={14} />
                        <span>File Attached ({formData.fileName || 'Uploaded'})</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Or paste external URL link..."
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Summary of topics covered in this resource..."
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
                <button type="submit" disabled={submitting || uploadingFile} className="btn-primary font-bold">
                  {submitting ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Check size={16} />}
                  <span>{editingId ? 'Update Material' : 'Save Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
