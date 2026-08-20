import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { conductInterview, getTrainerInterviewCandidates } from '../api/interviewApi';
import { applicationApi } from '../api/apiServices';
import { Award, Search, CheckCircle2, Star, User, AlertCircle, Save, Check, X, Filter, RefreshCw, UserCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Interviews() {
  const { user } = useAuth();
  const trainerId = user?.id || user?.email || localStorage.getItem('trainerId') || '';
  const defaultBatchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || null;
  
  // Role & Trainer Type Detection
  const isAdmin = String(user?.role || '').toUpperCase().includes('ADMIN');
  const isSoftSkillTrainer = !isAdmin && (user?.trainerType === 'SOFT_SKILLS' || user?.role?.includes('HR'));
  const isTechnicalTrainer = !isAdmin && !isSoftSkillTrainer;

  // Active Stage locked strictly by role unless Admin
  const [activeStage, setActiveStage] = useState(
    isAdmin ? 'TECHNICAL' : (isSoftSkillTrainer ? 'SOFT_SKILL' : 'TECHNICAL')
  );

  const [eligibleCandidates, setEligibleCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [manualSearchId, setManualSearchId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    trainerId: trainerId,
    batchId: defaultBatchId,
    interviewDate: new Date().toISOString().split('T')[0],
    interviewType: isSoftSkillTrainer ? 'SOFT_SKILL' : 'TECHNICAL',
    technicalMarks: 35, // max 40
    problemSolvingMarks: 18, // max 20
    softSkillMarks: 18, // max 20
    communicationMarks: 18, // max 20
    behaviourMarks: 18, // max 20
    remarks: '',
    passStatus: 'PASS'
  });

  useEffect(() => {
    fetchEligibleQueue();
    const handleSync = () => fetchEligibleQueue();
    window.addEventListener('spt_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('spt_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [activeStage]);

  const fetchEligibleQueue = async () => {
    setLoadingCandidates(true);
    setHasError(false);
    try {
      // Use dedicated trainer interview endpoint authorized for TRAINER and ADMIN
      const res = await getTrainerInterviewCandidates(activeStage);
      const apps = Array.isArray(res.data) ? res.data : [];
      setAllCandidates(apps);

      // Filter candidates strictly ready for this interview stage
      let targetFiltered = [];
      if (activeStage === 'SOFT_SKILL') {
        targetFiltered = apps.filter(a =>
          a.status === 'TECHNICAL_INTERVIEW_PASSED' ||
          a.status === 'HR_INTERVIEW_SCHEDULED'
        );
      } else {
        targetFiltered = apps.filter(a =>
          a.status === 'DOCUMENTS_VERIFIED' ||
          a.status === 'TECHNICAL_INTERVIEW_SCHEDULED'
        );
      }

      setEligibleCandidates(targetFiltered);
    } catch (err) {
      console.error('Failed to load interview queue:', err);
      setHasError(true);
      setAllCandidates([]);
      setEligibleCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleSelectCandidate = (cand) => {
    setSelectedCandidate(cand);
    setFormData(prev => ({
      ...prev,
      studentId: cand.applicationNumber || cand.id,
      batchId: cand.assignedBatchId || defaultBatchId,
      remarks: `${activeStage === 'SOFT_SKILL' ? 'HR / Soft-Skill' : 'Technical'} Interview evaluation for ${cand.fullName}`
    }));
    toast.success(`Selected candidate: ${cand.fullName}`);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    const query = manualSearchId.trim().toLowerCase();
    if (!query) {
      toast.error('Please enter an Application Reference ID');
      return;
    }

    // First search in eligible queue
    const foundInQueue = eligibleCandidates.find(c =>
      (c.applicationNumber && c.applicationNumber.toLowerCase() === query) ||
      (c.id && c.id.toLowerCase() === query) ||
      (c.email && c.email.toLowerCase() === query) ||
      (c.fullName && c.fullName.toLowerCase().includes(query))
    );

    if (foundInQueue) {
      handleSelectCandidate(foundInQueue);
      return;
    }

    // Look up in all candidates to provide exact feedback
    const foundInAll = allCandidates.find(c =>
      (c.applicationNumber && c.applicationNumber.toLowerCase() === query) ||
      (c.id && c.id.toLowerCase() === query) ||
      (c.email && c.email.toLowerCase() === query) ||
      (c.fullName && c.fullName.toLowerCase().includes(query))
    );

    if (foundInAll) {
      if (activeStage === 'TECHNICAL') {
        if (foundInAll.status === 'TECHNICAL_INTERVIEW_PASSED' || foundInAll.status === 'TECHNICAL_INTERVIEW_FAILED') {
          toast.error(`Candidate ${foundInAll.fullName} has already completed Technical Interview (${foundInAll.status}).`);
        } else if (foundInAll.status !== 'DOCUMENTS_VERIFIED' && foundInAll.status !== 'TECHNICAL_INTERVIEW_SCHEDULED') {
          toast.error(`Candidate ${foundInAll.fullName} is not eligible for Technical Interview yet (Current status: ${foundInAll.status}). Documents must be verified first.`);
        } else {
          handleSelectCandidate(foundInAll);
        }
      } else {
        // SOFT_SKILL
        if (foundInAll.status === 'HR_INTERVIEW_PASSED' || foundInAll.status === 'HR_INTERVIEW_FAILED') {
          toast.error(`Candidate ${foundInAll.fullName} has already completed Soft-Skill/HR Interview (${foundInAll.status}).`);
        } else if (foundInAll.status !== 'TECHNICAL_INTERVIEW_PASSED' && foundInAll.status !== 'HR_INTERVIEW_SCHEDULED') {
          toast.error(`Candidate ${foundInAll.fullName} is not eligible for Soft-Skill/HR Interview yet (Current status: ${foundInAll.status}). Must pass Technical Interview first.`);
        } else {
          handleSelectCandidate(foundInAll);
        }
      }
    } else {
      toast.error(`No candidate found for reference "${manualSearchId}".`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast.error('Please select a candidate from the queue first.');
      return;
    }
    setSubmitting(true);

    const isPass = formData.passStatus === 'PASS';
    const isSoftSkillEval = activeStage === 'SOFT_SKILL';
    const nextStatus = isPass
      ? (isSoftSkillEval ? 'HR_INTERVIEW_PASSED' : 'TECHNICAL_INTERVIEW_PASSED')
      : (isSoftSkillEval ? 'HR_INTERVIEW_FAILED' : 'TECHNICAL_INTERVIEW_FAILED');

    const payload = {
      studentId: formData.studentId,
      trainerId: trainerId || user?.id || 'TRN101',
      batchId: formData.batchId || null,
      interviewDate: formData.interviewDate || new Date().toISOString().split('T')[0],
      interviewType: isSoftSkillEval ? 'SOFT_SKILL' : 'TECHNICAL',
      remarks: formData.remarks?.trim() || 'Interview evaluation recorded'
    };

    if (isSoftSkillEval) {
      if (isPass) {
        payload.softSkillMarks = Math.min(20, Math.max(12, Number(formData.softSkillMarks) || 15));
        payload.communicationMarks = Math.min(20, Math.max(12, Number(formData.communicationMarks) || 15));
        payload.behaviourMarks = Math.min(20, Math.max(12, Number(formData.behaviourMarks) || 15));
      } else {
        payload.softSkillMarks = Math.min(8, Number(formData.softSkillMarks) || 5);
        payload.communicationMarks = Math.min(8, Number(formData.communicationMarks) || 5);
        payload.behaviourMarks = Math.min(8, Number(formData.behaviourMarks) || 5);
      }
    } else {
      if (isPass) {
        payload.technicalMarks = Math.min(40, Math.max(25, Number(formData.technicalMarks) || 30));
        payload.problemSolvingMarks = Math.min(20, Math.max(12, Number(formData.problemSolvingMarks) || 15));
      } else {
        payload.technicalMarks = Math.min(15, Number(formData.technicalMarks) || 10);
        payload.problemSolvingMarks = Math.min(8, Number(formData.problemSolvingMarks) || 5);
      }
    }

    try {
      await conductInterview(payload);
      if (isAdmin && selectedCandidate?.id) {
        try {
          await applicationApi.updateStatus(selectedCandidate.id, nextStatus);
        } catch (e) {
          // Status updated by conductInterview in backend
        }
      }
      toast.success(`Interview Evaluation Saved! Candidate status updated to ${nextStatus}. 🎉`);
      setSelectedCandidate(null);
      fetchEligibleQueue();
    } catch (err) {
      console.error('Failed to submit interview evaluation:', err);
      toast.error(err.response?.data?.message || 'Failed to submit interview evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">
            {activeStage === 'SOFT_SKILL' ? 'Soft-Skill & HR Interview Portal' : 'Technical Interview Assessment Portal'}
          </h1>
          <p className="page-subtitle">
            {activeStage === 'SOFT_SKILL'
              ? 'Evaluating candidates who passed the Technical Interview stage'
              : 'Evaluating candidates whose documents have been verified by Admin'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stage switcher ONLY shown if user is Admin */}
          {isAdmin && (
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => { setActiveStage('TECHNICAL'); setSelectedCandidate(null); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeStage === 'TECHNICAL' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                1. Technical Interview
              </button>
              <button
                onClick={() => { setActiveStage('SOFT_SKILL'); setSelectedCandidate(null); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeStage === 'SOFT_SKILL' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                2. Soft-Skill / HR
              </button>
            </div>
          )}

          {/* Role badge for Trainer */}
          {!isAdmin && (
            <span className="badge-red text-xs px-3 py-2 font-bold uppercase tracking-wider">
              {isSoftSkillTrainer ? 'SOFT-SKILL & HR INTERVIEW MODULE' : 'TECHNICAL INTERVIEW MODULE'}
            </span>
          )}

          <button onClick={fetchEligibleQueue} className="btn bg-white border text-gray-700 hover:bg-gray-50 text-xs py-2 px-3 rounded-xl flex items-center gap-1 font-bold">
            <RefreshCw size={14} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Direct Search Bar */}
      <div className="card p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <UserCheck size={16} className="text-red-400" /> Direct Candidate Search & Evaluation
          </h3>
          <p className="text-xs text-gray-300">Enter Application Number (e.g. APP2026001) to select candidate</p>
        </div>

        <form onSubmit={handleManualSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="App Number (e.g. APP2026001)..."
            value={manualSearchId}
            onChange={(e) => setManualSearchId(e.target.value)}
            className="form-input text-xs text-gray-900 bg-white min-w-[200px]"
          />
          <button type="submit" className="btn-primary text-xs font-bold whitespace-nowrap">
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Eligible Candidate Queue */}
        <div className="card lg:col-span-1 flex flex-col">
          <div className="card-header border-b border-gray-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User size={16} className="text-red-600" /> Candidate Queue ({eligibleCandidates.length})
            </h3>
            <span className="text-[11px] text-gray-400 font-medium">Click to evaluate</span>
          </div>

          <div className="card-body p-3 flex-1 overflow-y-auto max-h-[500px]">
            {loadingCandidates ? (
              <div className="p-8 text-center">
                <div className="spinner w-6 h-6 border-red-600 mx-auto" />
                <p className="text-xs text-gray-400 mt-2">Loading candidates...</p>
              </div>
            ) : hasError ? (
              <div className="p-6 text-center text-red-600 space-y-2 text-xs">
                <ShieldAlert size={20} className="mx-auto" />
                <p>Failed to load interview queue</p>
                <button onClick={fetchEligibleQueue} className="text-red-700 font-bold underline">Retry</button>
              </div>
            ) : eligibleCandidates.length > 0 ? (
              <div className="space-y-2">
                {eligibleCandidates.map((cand, idx) => {
                  const isSelected = selectedCandidate?.id === cand.id || selectedCandidate?.applicationNumber === cand.applicationNumber;
                  return (
                    <div
                      key={cand.id || idx}
                      onClick={() => handleSelectCandidate(cand)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-50/90 border-red-300 shadow-sm'
                          : 'bg-white hover:bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-red-700">{cand.applicationNumber || cand.id}</span>
                        <span className="badge-blue text-[10px]">{cand.status || 'PENDING'}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mt-1">{cand.fullName}</h4>
                      <p className="text-[11px] text-gray-500">{cand.collegeName || cand.email}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs space-y-1">
                <User size={24} className="mx-auto text-gray-300 mb-1" />
                <p className="font-semibold text-gray-700">No Candidates in Queue</p>
                <p className="text-[11px]">Candidates will appear once verified by Admin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scoring Form */}
        <div className="card lg:col-span-2">
          <div className="card-header border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">
              {selectedCandidate ? `Scoring: ${selectedCandidate.fullName} (${selectedCandidate.applicationNumber || selectedCandidate.id})` : 'Select a candidate to begin evaluation'}
            </h3>
          </div>

          <div className="card-body p-5">
            {selectedCandidate ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Scoring Fields */}
                {isSoftSkillTrainer ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label">Soft Skills (Max 20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        required
                        value={formData.softSkillMarks}
                        onChange={(e) => setFormData({ ...formData, softSkillMarks: e.target.value })}
                        className="form-input font-bold"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Communication (Max 20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        required
                        value={formData.communicationMarks}
                        onChange={(e) => setFormData({ ...formData, communicationMarks: e.target.value })}
                        className="form-input font-bold"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Behaviour / Attitude (Max 20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        required
                        value={formData.behaviourMarks}
                        onChange={(e) => setFormData({ ...formData, behaviourMarks: e.target.value })}
                        className="form-input font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Technical Competence (Max 40)</label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        required
                        value={formData.technicalMarks}
                        onChange={(e) => setFormData({ ...formData, technicalMarks: e.target.value })}
                        className="form-input font-bold"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Problem Solving / Logic (Max 20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        required
                        value={formData.problemSolvingMarks}
                        onChange={(e) => setFormData({ ...formData, problemSolvingMarks: e.target.value })}
                        className="form-input font-bold"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Interview Remarks & Feedback</label>
                  <textarea
                    rows="3"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Candidate demonstrated strong core fundamentals..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Result Decision</label>
                  <select
                    value={formData.passStatus}
                    onChange={(e) => setFormData({ ...formData, passStatus: e.target.value })}
                    className="form-input font-bold"
                  >
                    <option value="PASS">PASS — Recommend for Next Stage</option>
                    <option value="REJECT">REJECT — Does Not Meet Criteria</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="btn bg-gray-100 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary shadow-md shadow-red-200 font-bold"
                  >
                    {submitting ? 'Saving Evaluation...' : 'Submit Evaluation'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-16 text-center text-gray-400 space-y-2">
                <Award size={36} className="text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-700">No Candidate Selected</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Click any candidate from the queue on the left or search by Application Reference ID to enter marks.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
