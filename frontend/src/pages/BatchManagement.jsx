import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import batchApi from '../api/batchApi';
import {
  Layers, Plus, Search, Users, UserCheck, BookOpen,
  Calendar, CheckCircle2, ShieldAlert, X, RefreshCw,
  ExternalLink, Eye, Award, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BatchManagement() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isAdmin = roleStr.includes('ADMIN');
  const isTrainer = roleStr.includes('TRAINER');

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Form State for Batch Creation (Admin)
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [loadingEligibleApps, setLoadingEligibleApps] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [appSearch, setAppSearch] = useState('');

  const [batchForm, setBatchForm] = useState({
    batchName: '',
    courseName: 'Java Full Stack Development',
    technicalTrainerId: '',
    softSkillsTrainerId: '',
    capacity: 30,
    selectedAppIds: []
  });

  const courseOptions = [
    'Java Full Stack Development',
    'MERN Full Stack Development',
    'Python Full Stack & Data Science',
    'Cloud Computing & DevOps',
    'Software Testing & QA'
  ];

  useEffect(() => {
    fetchBatches();
  }, [user]);

  const fetchBatches = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (isAdmin) {
        res = await batchApi.getAllBatches();
      } else {
        res = await batchApi.getMyBatches();
      }
      setBatches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load batches:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load batches from server. Please try again.'
      );
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal & Load Eligible (SELECTED) candidates and trainers
  const handleOpenCreateModal = async () => {
    setCreateModalOpen(true);
    setFormError('');
    setLoadingEligibleApps(true);
    setBatchForm({
      batchName: '',
      courseName: 'Java Full Stack Development',
      technicalTrainerId: '',
      softSkillsTrainerId: '',
      capacity: 30,
      selectedAppIds: []
    });

    try {
      const [apps, trainerList] = await Promise.all([
        batchApi.getSelectedApplications(),
        batchApi.getTrainers()
      ]);
      setSelectedApplications(apps);
      setTrainers(trainerList);

      // Pre-select first available technical and soft-skills trainer if available
      const techTrainers = trainerList.filter(t => t.trainerType === 'TECHNICAL' || !t.trainerType);
      const softTrainers = trainerList.filter(t => t.trainerType === 'SOFT_SKILLS');

      setBatchForm(prev => ({
        ...prev,
        technicalTrainerId: techTrainers.length > 0 ? techTrainers[0].id : (trainerList[0]?.id || ''),
        softSkillsTrainerId: softTrainers.length > 0 ? softTrainers[0].id : (trainerList[1]?.id || trainerList[0]?.id || '')
      }));
    } catch (err) {
      console.error('Failed to load eligible candidates or trainers:', err);
      toast.error('Failed to load eligible candidates list.');
    } finally {
      setLoadingEligibleApps(false);
    }
  };

  // Toggle candidate selection
  const toggleAppSelection = (id) => {
    setBatchForm(prev => {
      const exists = prev.selectedAppIds.includes(id);
      const updated = exists
        ? prev.selectedAppIds.filter(item => item !== id)
        : [...prev.selectedAppIds, id];
      return { ...prev, selectedAppIds: updated };
    });
  };

  // Select all filtered eligible candidates
  const toggleSelectAllEligible = (list) => {
    setBatchForm(prev => {
      const allSelected = list.every(item => prev.selectedAppIds.includes(item.id));
      if (allSelected) {
        return {
          ...prev,
          selectedAppIds: prev.selectedAppIds.filter(id => !list.some(item => item.id === id))
        };
      } else {
        const newIds = Array.from(new Set([...prev.selectedAppIds, ...list.map(item => item.id)]));
        return { ...prev, selectedAppIds: newIds };
      }
    });
  };

  // Submit Create Batch Form
  const handleCreateBatchSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { batchName, courseName, technicalTrainerId, softSkillsTrainerId, capacity, selectedAppIds } = batchForm;

    // Validation Rules
    if (!batchName.trim()) {
      setFormError('Batch Name is required.');
      return;
    }
    if (!courseName.trim()) {
      setFormError('Course Name is required.');
      return;
    }
    if (!technicalTrainerId) {
      setFormError('Please select a Technical Trainer.');
      return;
    }
    if (!softSkillsTrainerId) {
      setFormError('Please select a Soft Skills Trainer.');
      return;
    }
    if (technicalTrainerId === softSkillsTrainerId) {
      setFormError('Technical Trainer and Soft Skills Trainer cannot be the same person.');
      return;
    }
    if (!capacity || Number(capacity) <= 0) {
      setFormError('Capacity must be a positive number greater than 0.');
      return;
    }
    if (selectedAppIds.length === 0) {
      setFormError('Please select at least one eligible candidate (status SELECTED) for this batch.');
      return;
    }
    if (selectedAppIds.length > Number(capacity)) {
      setFormError(`Batch capacity (${capacity}) cannot be less than the number of selected students (${selectedAppIds.length}).`);
      return;
    }

    setSubmitting(true);
    try {
      await batchApi.createBatch({
        batchName: batchName.trim(),
        courseName: courseName.trim(),
        technicalTrainerId,
        softSkillsTrainerId,
        capacity: Number(capacity),
        applicationIds: selectedAppIds
      });

      toast.success('Batch created successfully.');
      setCreateModalOpen(false);
      await fetchBatches();
    } catch (err) {
      console.error('Create batch failed:', err);
      setFormError(
        err.response?.data?.message ||
        'Failed to create batch. Please check your inputs and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // View Batch Details & Student Roster
  const handleViewBatchDetails = async (batch) => {
    setSelectedBatch(batch);
    setDetailsModalOpen(true);
    setStudentsLoading(true);
    setBatchStudents([]);

    try {
      const res = await batchApi.getBatchStudents(batch.id || batch.batchName);
      setBatchStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load batch students:', err);
      setBatchStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const filteredBatches = batches.filter(b => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      (b.batchName && b.batchName.toLowerCase().includes(term)) ||
      (b.courseName && b.courseName.toLowerCase().includes(term)) ||
      (b.technicalTrainerName && b.technicalTrainerName.toLowerCase().includes(term)) ||
      (b.softSkillsTrainerName && b.softSkillsTrainerName.toLowerCase().includes(term)) ||
      (b.id && b.id.toLowerCase().includes(term))
    );
  });

  const filteredEligibleApps = selectedApplications.filter(app => {
    const term = appSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (app.fullName && app.fullName.toLowerCase().includes(term)) ||
      (app.applicationNumber && app.applicationNumber.toLowerCase().includes(term)) ||
      (app.email && app.email.toLowerCase().includes(term)) ||
      (app.collegeName && app.collegeName.toLowerCase().includes(term))
    );
  });

  // Trainer separation
  const technicalTrainers = trainers.filter(t => t.trainerType === 'TECHNICAL' || !t.trainerType);
  const softSkillsTrainers = trainers.filter(t => t.trainerType === 'SOFT_SKILLS' || !t.trainerType);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Layers size={14} /> {isAdmin ? 'Batch Management System' : 'Assigned Faculty Batches'}
          </span>
          <h1 className="text-2xl font-extrabold mt-2">
            {isAdmin ? 'Batch Management' : 'My Batches'}
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            {isAdmin
              ? 'Create new cohorts, assign technical & soft skills trainers, manage capacities, and enroll selected candidates.'
              : 'View your assigned cohorts, monitor batch capacity, and inspect complete student rosters.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBatches}
            className="btn bg-white/10 text-white hover:bg-white/20 text-xs py-2 px-3 rounded-xl flex items-center gap-1 font-bold"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="btn bg-red-600 text-white hover:bg-red-700 text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-red-900/30 flex items-center gap-2"
            >
              <Plus size={16} /> + Create New Batch
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search batch name, course, trainer, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 py-2 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
            <span>Total Batches: <strong className="text-gray-900">{filteredBatches.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Batches Display */}
      {loading ? (
        <div className="card p-12 flex flex-col items-center justify-center gap-3">
          <div className="spinner w-8 h-8 border-red-600" />
          <p className="text-xs text-gray-500 font-semibold">Loading batches...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center bg-red-50/40 border border-red-200 max-w-md mx-auto space-y-3">
          <ShieldAlert size={28} className="text-red-600 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">Unable to load batches.</h3>
          <p className="text-xs text-red-700">{error}</p>
          <button onClick={fetchBatches} className="btn bg-red-600 text-white text-xs font-bold px-4 py-2 mx-auto">
            Try Again
          </button>
        </div>
      ) : filteredBatches.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="card-header border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">
              {isAdmin ? 'Available Batches' : 'My Assigned Batches'}
            </h3>
            <span className="text-xs text-gray-400 font-mono">Live Database Records</span>
          </div>

          <div className="card-body p-0 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Batch Name</th>
                  <th>Batch ID</th>
                  <th>Course Name</th>
                  <th>Technical Trainer</th>
                  <th>Soft Skills Trainer</th>
                  <th className="text-center">Capacity</th>
                  <th className="text-center">Students</th>
                  <th className="text-center">Available Seats</th>
                  {isTrainer && <th>My Assignment</th>}
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => {
                  const enrolled = batch.enrolledCount ?? 0;
                  const capacity = batch.capacity ?? 30;
                  const available = batch.availableSeats ?? Math.max(0, capacity - enrolled);
                  const isFull = available === 0;

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="font-bold text-gray-900 text-xs">
                        <button
                          onClick={() => handleViewBatchDetails(batch)}
                          className="hover:text-red-600 hover:underline text-left font-bold"
                        >
                          {batch.batchName}
                        </button>
                      </td>
                      <td className="font-mono text-[11px] text-gray-500 font-semibold">
                        {batch.id?.length > 10 ? `${batch.id.substring(0, 8)}...` : batch.id}
                      </td>
                      <td className="text-xs text-gray-700 font-medium">
                        {batch.courseName || 'General Program'}
                      </td>
                      <td className="text-xs font-medium text-blue-800">
                        {batch.technicalTrainerName || 'Not Assigned'}
                      </td>
                      <td className="text-xs font-medium text-purple-800">
                        {batch.softSkillsTrainerName || 'Not Assigned'}
                      </td>
                      <td className="text-center text-xs font-bold text-gray-700">
                        {capacity}
                      </td>
                      <td className="text-center text-xs font-extrabold text-emerald-700">
                        {enrolled}
                      </td>
                      <td className="text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isFull ? 'bg-red-100 text-red-700 font-extrabold' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isFull ? 'Batch Full' : available}
                        </span>
                      </td>
                      {isTrainer && (
                        <td>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                            {batch.trainerRole || 'Faculty Trainer'}
                          </span>
                        </td>
                      )}
                      <td>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {batch.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleViewBatchDetails(batch)}
                          className="btn-outline text-xs py-1 px-3 flex items-center gap-1 ml-auto text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye size={13} />
                          <span>View Students</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center text-gray-400 space-y-3">
          <Layers size={36} className="mx-auto text-gray-300" />
          <h3 className="text-sm font-bold text-gray-700">
            {isAdmin ? 'No batches created yet.' : 'No batches assigned yet.'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {isAdmin
              ? 'Create your first batch using "+ Create New Batch" to enroll selected candidates.'
              : 'Your assigned cohorts will appear here once registered by administration.'}
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="btn-primary text-xs font-bold py-2 px-4 mx-auto"
            >
              + Create New Batch
            </button>
          )}
        </div>
      )}

      {/* CREATE NEW BATCH MODAL (ADMIN ONLY) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8 transform transition-all">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-600 text-white">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Create New Batch</h3>
                  <p className="text-xs text-gray-500">Configure batch details and enroll candidates with status SELECTED</p>
                </div>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Batch Name & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Batch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java Full Stack Batch A"
                    value={batchForm.batchName}
                    onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                    className="form-input text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={batchForm.courseName}
                    onChange={(e) => setBatchForm({ ...batchForm, courseName: e.target.value })}
                    className="form-input text-xs w-full font-medium"
                  >
                    {courseOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trainers Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Select Technical Trainer <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={batchForm.technicalTrainerId}
                    onChange={(e) => setBatchForm({ ...batchForm, technicalTrainerId: e.target.value })}
                    className="form-input text-xs w-full"
                  >
                    <option value="">-- Choose Technical Trainer --</option>
                    {technicalTrainers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email} ({t.trainerType || 'Technical'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Select Soft Skills Trainer <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={batchForm.softSkillsTrainerId}
                    onChange={(e) => setBatchForm({ ...batchForm, softSkillsTrainerId: e.target.value })}
                    className="form-input text-xs w-full"
                  >
                    <option value="">-- Choose Soft Skills Trainer --</option>
                    {softSkillsTrainers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email} ({t.trainerType || 'Soft Skills'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch Capacity */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Batch Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={batchForm.capacity}
                  onChange={(e) => setBatchForm({ ...batchForm, capacity: e.target.value })}
                  className="form-input text-xs w-full sm:w-40 font-bold"
                />
              </div>

              {/* Select Eligible Candidates (Status = SELECTED) */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Select Students / Applications (Status: SELECTED only)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Candidates must have passed all rounds and hold status <strong>SELECTED</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search applicant..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="form-input text-[11px] py-1 px-2.5 w-full sm:w-44"
                    />
                  </div>
                </div>

                {/* Selection Capacity Feedback Banner */}
                <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between mb-2 ${
                  batchForm.selectedAppIds.length > Number(batchForm.capacity)
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span>
                    Selected: <strong>{batchForm.selectedAppIds.length}</strong> / Capacity: <strong>{batchForm.capacity}</strong>
                  </span>
                  <span>
                    {batchForm.selectedAppIds.length > Number(batchForm.capacity)
                      ? `Exceeds capacity by ${batchForm.selectedAppIds.length - Number(batchForm.capacity)}!`
                      : `Available seats remaining: ${Number(batchForm.capacity) - batchForm.selectedAppIds.length}`}
                  </span>
                </div>

                {/* Candidate Selection List */}
                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  {loadingEligibleApps ? (
                    <div className="p-6 text-center text-xs text-gray-500 flex justify-center items-center gap-2">
                      <div className="spinner w-4 h-4 border-red-600" />
                      <span>Loading eligible candidates...</span>
                    </div>
                  ) : filteredEligibleApps.length > 0 ? (
                    <table className="table w-full text-left">
                      <thead className="sticky top-0 bg-gray-50 shadow-2xs">
                        <tr>
                          <th className="w-10">
                            <input
                              type="checkbox"
                              checked={filteredEligibleApps.every(a => batchForm.selectedAppIds.includes(a.id))}
                              onChange={() => toggleSelectAllEligible(filteredEligibleApps)}
                            />
                          </th>
                          <th>Applicant ID</th>
                          <th>Student Name</th>
                          <th>College / Degree</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEligibleApps.map(app => {
                          const isSelected = batchForm.selectedAppIds.includes(app.id);
                          return (
                            <tr
                              key={app.id}
                              onClick={() => toggleAppSelection(app.id)}
                              className={`cursor-pointer transition-colors ${isSelected ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                />
                              </td>
                              <td className="font-mono text-xs font-bold text-red-600">
                                {app.applicationNumber || app.id}
                              </td>
                              <td className="text-xs font-semibold text-gray-900">
                                {app.fullName}
                              </td>
                              <td className="text-[11px] text-gray-500">
                                {app.collegeName || app.degree || 'Engineering'}
                              </td>
                              <td>
                                <span className="badge-green text-[10px] font-bold">
                                  SELECTED
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No eligible candidates with status <strong>SELECTED</strong> found. Please complete final candidate selections in the Selection tab.
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-outline text-xs font-bold py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-red-600 text-white hover:bg-red-700 text-xs font-bold py-2 px-5 rounded-xl shadow-md shadow-red-200 flex items-center gap-1.5"
                >
                  {submitting ? 'Creating Batch...' : 'Create Batch & Enroll Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH DETAILS & STUDENT ROSTER MODAL */}
      {detailsModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8 transform transition-all">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-gray-800 to-slate-800 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Batch Details
                </span>
                <h3 className="text-lg font-extrabold mt-1">{selectedBatch.batchName}</h3>
                <p className="text-xs text-gray-300 font-mono">ID: {selectedBatch.id}</p>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
              {/* Batch Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Course</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedBatch.courseName}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Technical Trainer</p>
                  <p className="text-xs font-bold text-blue-900 mt-0.5">{selectedBatch.technicalTrainerName || 'N/A'}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-[10px] font-bold text-purple-600 uppercase">Soft Skills Trainer</p>
                  <p className="text-xs font-bold text-purple-900 mt-0.5">{selectedBatch.softSkillsTrainerName || 'N/A'}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Enrolled / Capacity</p>
                  <p className="text-xs font-bold text-emerald-900 mt-0.5">
                    {selectedBatch.enrolledCount ?? batchStudents.length} / {selectedBatch.capacity ?? 30}
                  </p>
                </div>
              </div>

              {/* Students in this Batch */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-red-600" />
                    <h4 className="text-sm font-extrabold text-gray-900">Students in this Batch</h4>
                  </div>
                  <span className="badge-blue text-xs font-bold">
                    {batchStudents.length} Student{batchStudents.length === 1 ? '' : 's'}
                  </span>
                </div>

                {studentsLoading ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-2">
                    <div className="spinner w-6 h-6 border-red-600" />
                    <p className="text-xs text-gray-400">Loading student roster...</p>
                  </div>
                ) : batchStudents.length > 0 ? (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="table w-full text-left">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Student Name</th>
                          <th>Email & Mobile</th>
                          <th>College / Branch</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchStudents.map((stu, i) => (
                          <tr key={stu.id || i} className="hover:bg-slate-50">
                            <td className="font-mono text-xs font-bold text-red-600">
                              {stu.studentId || stu.id}
                            </td>
                            <td className="text-xs font-bold text-gray-900">
                              {stu.firstName} {stu.lastName}
                            </td>
                            <td className="text-xs text-gray-600 font-mono">
                              <div>{stu.email}</div>
                              <div className="text-[10px] text-gray-400">{stu.mobile || 'N/A'}</div>
                            </td>
                            <td className="text-xs text-gray-600">
                              <div>{stu.collegeName || 'ITEP Institute'}</div>
                              <div className="text-[10px] text-gray-400">{stu.branch || stu.degree || 'Full Stack'}</div>
                            </td>
                            <td>
                              <span className="badge-green text-[10px] font-bold">
                                {stu.active ? 'ACTIVE' : 'ENROLLED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-gray-400 border border-gray-200 border-dashed rounded-xl">
                    No students assigned to this batch yet.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="btn bg-gray-800 text-white hover:bg-gray-900 text-xs font-bold py-2 px-5 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
