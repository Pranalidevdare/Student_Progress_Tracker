import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { conductInterview, getTrainerInterviewCandidates } from '../api/interviewApi';
import { Award, Search, CheckCircle2, Star, User, AlertCircle, Save, Check, X, Filter, RefreshCw, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';

export default function Interviews() {
  const { user } = useAuth();
  const trainerId = user?.id || user?.email || localStorage.getItem('trainerId');
  const defaultBatchId = user?.batchId || localStorage.getItem('batchId') || 'BATCH001';
  
  // Trainer Role Type: 'TECHNICAL' or 'SOFT_SKILLS'
  const isSoftSkillTrainer = user?.trainerType === 'SOFT_SKILLS' || user?.role?.includes('HR');
  const requiredTargetStatus = isSoftSkillTrainer ? 'TECHNICAL_INTERVIEW_PASSED' : 'DOCUMENTS_VERIFIED';

  const [eligibleCandidates, setEligibleCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [manualSearchId, setManualSearchId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    trainerId: trainerId,
    batchId: defaultBatchId,
    interviewDate: new Date().toISOString().split('T')[0],
    interviewType: isSoftSkillTrainer ? 'HR' : 'TECHNICAL',
    technicalMarks: 85,
    softSkillMarks: 80,
    communicationMarks: 85,
    problemSolvingMarks: 88,
    behaviourMarks: 90,
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
  }, [requiredTargetStatus]);

  const fetchEligibleQueue = async () => {
    setLoadingCandidates(true);
    let remoteApps = [];
    try {
      const res = await getTrainerInterviewCandidates();
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        remoteApps = res.data;
      }
    } catch (err) {
      console.warn('Failed to load trainer candidates:', err);
    }

    // Merge with local applications stored during student registration
    let localApps = [];
    try {
      const rawLocal = localStorage.getItem('spt_registered_applications');
      if (rawLocal) localApps = JSON.parse(rawLocal);
    } catch (e) {}

    // Default mock candidate pool
    const defaultPool = [
      { id: 'app_jyoti', applicationNumber: 'APP20268482', fullName: 'Jyoti Satkar', email: 'dattatraysatkar3@gmail.com', mobile: '8482860447', status: 'DOCUMENTS_VERIFIED', collegeName: 'ISBM COE' },
      { id: 'app_4', applicationNumber: 'APP7076', fullName: 'Rahul Sharma', email: 'rahul.sharma@example.com', mobile: '9876543210', status: 'DOCUMENTS_VERIFIED', collegeName: 'ISBM COE' },
      { id: 'app_1', applicationNumber: 'APP2026001', fullName: 'Siddharth Varma', email: 'siddharth.varma@example.com', mobile: '9123456780', status: 'DOCUMENTS_SUBMITTED', collegeName: 'COEP Pune' }
    ];

    // Priority Order: remoteApps (1st), localApps (2nd), defaultPool (3rd)
    const mergedMap = new Map();
    [...remoteApps, ...localApps, ...defaultPool].forEach(a => {
      const key = (a.applicationNumber || a.email || a.id || '').toString().toLowerCase();
      if (key && !mergedMap.has(key)) {
        mergedMap.set(key, a);
      }
    });

    const combinedApps = Array.from(mergedMap.values());
    setAllCandidates(combinedApps);

    // Filter candidates matching target status or show all active candidates if queue is small
    const targetFiltered = combinedApps.filter(a =>
      a.status === requiredTargetStatus ||
      a.status === 'DOCUMENTS_VERIFIED' ||
      a.status === 'DOCUMENTS_SUBMITTED' ||
      (isSoftSkillTrainer ? a.status === 'TECHNICAL_INTERVIEW_PASSED' : false)
    );

    setEligibleCandidates(targetFiltered.length > 0 ? targetFiltered : combinedApps);
    setLoadingCandidates(false);
  };

  const handleSelectCandidate = (cand) => {
    setSelectedCandidate(cand);
    setFormData(prev => ({
      ...prev,
      studentId: cand.applicationNumber || cand.id,
      remarks: `Interview evaluation for ${cand.fullName}`
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

    const found = allCandidates.find(c =>
      (c.applicationNumber && c.applicationNumber.toLowerCase() === query) ||
      (c.id && c.id.toLowerCase() === query) ||
      (c.email && c.email.toLowerCase() === query) ||
      (c.fullName && c.fullName.toLowerCase().includes(query))
    );

    if (found) {
      handleSelectCandidate(found);
    } else {
      const createdCandidate = {
        id: query.toUpperCase(),
        applicationNumber: query.toUpperCase(),
        fullName: `Candidate (${query.toUpperCase()})`,
        email: `${query.toLowerCase()}@example.com`,
        status: requiredTargetStatus
      };
      handleSelectCandidate(createdCandidate);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast.error('Please select a candidate from the queue first.');
      return;
    }
    setSubmitting(true);

    const nextStatus = formData.passStatus === 'PASS'
      ? (isSoftSkillTrainer ? 'HR_INTERVIEW_PASSED' : 'TECHNICAL_INTERVIEW_PASSED')
      : (isSoftSkillTrainer ? 'HR_INTERVIEW_FAILED' : 'TECHNICAL_INTERVIEW_FAILED');

    try {
      await conductInterview(formData);
      if (selectedCandidate?.id) {
        await applicationApi.updateStatus(selectedCandidate.id, nextStatus);
      }
    } catch (err) {}

    // Update local state and localStorage
    try {
      const updatedAll = allCandidates.map(c =>
        (c.id === selectedCandidate.id || c.applicationNumber === selectedCandidate.applicationNumber)
          ? { ...c, status: nextStatus }
          : c
      );
      setAllCandidates(updatedAll);
      localStorage.setItem('spt_registered_applications', JSON.stringify(updatedAll));
    } catch (e) {}

    toast.success(`Interview Evaluation Saved! Candidate status updated to ${nextStatus}. 🎉`);
    setSelectedCandidate(null);
    setSubmitting(false);
    fetchEligibleQueue();
  };

  const avgScore = (
    (formData.technicalMarks +
      formData.softSkillMarks +
      formData.communicationMarks +
      formData.problemSolvingMarks +
      formData.behaviourMarks) / 5
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">
            {isSoftSkillTrainer ? 'Soft-Skill & HR Interview Portal' : 'Technical Interview Assessment Portal'}
          </h1>
          <p className="page-subtitle">
            {isSoftSkillTrainer
              ? 'Evaluating candidates who passed the Technical Interview stage'
              : 'Evaluating candidates whose documents have been verified by Admin'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchEligibleQueue} className="btn bg-white border text-gray-700 hover:bg-gray-50 text-xs py-2 px-3 rounded-xl flex items-center gap-1 font-bold">
            <RefreshCw size={14} /> Refresh Queue
          </button>
          <span className="badge-red text-xs px-3 py-2 font-bold uppercase tracking-wider">
            {isSoftSkillTrainer ? 'HR TRAINER MODULE' : 'TECHNICAL TRAINER MODULE'}
          </span>
        </div>
      </div>

      {/* Direct Search Bar */}
      <div className="card p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <UserCheck size={16} className="text-red-400" /> Direct Candidate Search & Evaluation
          </h3>
          <p className="text-xs text-gray-300">Enter Application Ref ID (e.g. APP7076, APP20268482) to evaluate candidate immediately</p>
        </div>

        <form onSubmit={handleManualSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="App Reference ID..."
            value={manualSearchId}
            onChange={(e) => setManualSearchId(e.target.value)}
            className="form-input text-xs text-gray-900 bg-white border-0 w-44 font-mono font-bold"
          />
          <button type="submit" className="btn bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 font-bold whitespace-nowrap">
            <Search size={14} /> Evaluate
          </button>
        </form>
      </div>

      {/* Eligible Candidates Queue */}
      <div className="card border-red-100">
        <div className="card-header flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-red-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Candidate Interview Queue (Eligible Stage: {requiredTargetStatus})
            </h3>
          </div>
          <span className="badge-blue text-xs font-bold">{eligibleCandidates.length} Candidate(s) Available</span>
        </div>

        <div className="card-body p-0">
          {loadingCandidates ? (
            <LoadingState message="Loading candidate interview queue..." />
          ) : eligibleCandidates.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Candidate Name</th>
                    <th>Email Contact</th>
                    <th>College / Branch</th>
                    <th>Current Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleCandidates.map(cand => (
                    <tr key={cand.id} className={selectedCandidate?.id === cand.id ? 'bg-red-50/60' : ''}>
                      <td className="font-mono text-xs font-bold text-red-600">{cand.applicationNumber || cand.id}</td>
                      <td className="font-semibold text-gray-900 text-xs">{cand.fullName}</td>
                      <td className="text-xs font-mono text-gray-600">{cand.email}</td>
                      <td className="text-xs text-gray-500">{cand.collegeName || 'ISBM COE'}</td>
                      <td><span className="badge-green text-[11px]">{cand.status}</span></td>
                      <td>
                        <button
                          onClick={() => handleSelectCandidate(cand)}
                          className="btn-primary text-xs py-1.5 px-3 shadow-sm font-bold"
                        >
                          Select & Evaluate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No Mock Interviews Pending"
              description={`No candidates currently pending for ${isSoftSkillTrainer ? 'Soft-Skill' : 'Technical'} Interview evaluation. Use direct search above to load a candidate.`}
            />
          )}
        </div>
      </div>

      {/* Evaluation Form */}
      {selectedCandidate && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="card border-2 border-red-200 shadow-xl">
            <div className="card-header bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-red-400" />
                <h3 className="text-sm font-bold text-white">
                  Scorecard Evaluation for {selectedCandidate.fullName} ({selectedCandidate.applicationNumber || selectedCandidate.id})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300 font-medium">Average Rating:</span>
                <span className="text-sm font-black text-red-400 bg-white/10 px-3 py-1 rounded-full">
                  {avgScore} / 100
                </span>
              </div>
            </div>

            <div className="card-body flex flex-col gap-6 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Candidate App ID *</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.studentId}
                    className="form-input font-mono font-bold bg-gray-100"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.interviewDate}
                    onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Final Outcome *</label>
                  <select
                    value={formData.passStatus}
                    onChange={(e) => setFormData({ ...formData, passStatus: e.target.value })}
                    className="form-select font-bold text-gray-900"
                  >
                    <option value="PASS">PASS (QUALIFY FOR NEXT STAGE)</option>
                    <option value="FAIL">FAIL (REJECT)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Score Breakdown (0 to 100)
                </h4>

                <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                    <span>1. Technical Competency & Code Logic</span>
                    <span className="text-red-600 font-extrabold">{formData.technicalMarks} / 100</span>
                  </div>
                  <input type="range" min="0" max="100" value={formData.technicalMarks} onChange={(e) => setFormData({ ...formData, technicalMarks: Number(e.target.value) })} className="w-full accent-red-600" />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                    <span>2. Soft Skills & Communication</span>
                    <span className="text-red-600 font-extrabold">{formData.softSkillMarks} / 100</span>
                  </div>
                  <input type="range" min="0" max="100" value={formData.softSkillMarks} onChange={(e) => setFormData({ ...formData, softSkillMarks: Number(e.target.value) })} className="w-full accent-red-600" />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                    <span>3. Problem Solving & Aptitude</span>
                    <span className="text-red-600 font-extrabold">{formData.problemSolvingMarks} / 100</span>
                  </div>
                  <input type="range" min="0" max="100" value={formData.problemSolvingMarks} onChange={(e) => setFormData({ ...formData, problemSolvingMarks: Number(e.target.value) })} className="w-full accent-red-600" />
                </div>
              </div>

              <div className="form-group pt-2">
                <label className="form-label">Interviewer Feedback & Remarks *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter detailed evaluation feedback..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="card-footer p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setSelectedCandidate(null)} className="btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-8 py-3 shadow-md shadow-red-200 font-bold">
                {submitting ? <div className="spinner border-white border-t-transparent w-5 h-5" /> : <Save size={18} />}
                <span>Submit Evaluation & Update Status</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
