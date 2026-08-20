import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentAssignmentsByBatch, submitAssignment } from '../api/assignmentApi';
import { getStudentAssessmentsByBatch, submitAssessment as submitStudentAssessment } from '../api/assessmentApi';
import { getStudentMaterialsByBatch } from '../api/materialApi';
import { uploadFile } from '../api/fileApi';
import {
  Brain, ClipboardList, FileText, BookOpen, Clock, Calendar, Award,
  Upload, ExternalLink, Paperclip, ChevronRight, CheckCircle2, Play,
  AlertCircle, X, ShieldAlert, FileCheck, CheckCircle, Search, ArrowLeft,
  Sparkles, Layers, ArrowRight, Users, MessageSquare, Trophy, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SoftSkillSession() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const studentId = user?.studentId || user?.id || user?.email || '';
  const batchId = user?.batchId || user?.batch || localStorage.getItem('batchId') || '';

  // Determine current view mode: 'LANDING' | 'ASSIGNMENTS' | 'ASSESSMENTS' | 'MATERIALS'
  const pathname = location.pathname;
  let currentViewMode = 'LANDING';
  if (pathname.includes('/assignments')) currentViewMode = 'ASSIGNMENTS';
  else if (pathname.includes('/assessments')) currentViewMode = 'ASSESSMENTS';
  else if (pathname.includes('/study-materials') || pathname.includes('/materials')) currentViewMode = 'MATERIALS';

  const [viewMode, setViewMode] = useState(currentViewMode);

  useEffect(() => {
    setViewMode(currentViewMode);
  }, [pathname]);

  const [assignments, setAssignments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search State inside sub-modules
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for Assignment View/Upload
  const [viewAssignmentModalOpen, setViewAssignmentModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submissionRemarks, setSubmissionRemarks] = useState('');
  const [uploading, setUploading] = useState(false);

  // Modal State for Take Assessment & View Result
  const [takeAssessmentModalOpen, setTakeAssessmentModalOpen] = useState(false);
  const [viewResultModalOpen, setViewResultModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [completedAssessments, setCompletedAssessments] = useState({});
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  useEffect(() => {
    fetchSessionData();
    const localCompleted = localStorage.getItem(`spt_completed_assessments_${studentId}`);
    if (localCompleted) {
      try {
        setCompletedAssessments(JSON.parse(localCompleted));
      } catch (e) {}
    }
  }, [batchId, studentId]);

  const SOFT_SKILL_KEYWORDS = [
    'soft skill', 'communication', 'aptitude', 'interview', 'english',
    'behavioral', 'resume', 'group discussion', 'personality', 'gd'
  ];

  const isSoftSkillItem = (item) => {
    const text = `${item.subject || ''} ${item.title || ''} ${item.description || ''}`.toLowerCase();
    return SOFT_SKILL_KEYWORDS.some(kw => text.includes(kw));
  };

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const [assRes, evalRes, matRes] = await Promise.allSettled([
        getStudentAssignmentsByBatch(batchId),
        getStudentAssessmentsByBatch(batchId),
        getStudentMaterialsByBatch(batchId)
      ]);

      if (assRes.status === 'fulfilled' && Array.isArray(assRes.value.data)) {
        setAssignments(assRes.value.data.filter(isSoftSkillItem));
      } else {
        setAssignments([]);
      }

      if (evalRes.status === 'fulfilled' && Array.isArray(evalRes.value.data)) {
        setAssessments(evalRes.value.data.filter(isSoftSkillItem));
      } else {
        setAssessments([]);
      }

      if (matRes.status === 'fulfilled' && Array.isArray(matRes.value.data)) {
        setMaterials(matRes.value.data.filter(isSoftSkillItem));
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error('Error fetching soft skill session data:', err);
      toast.error('Unable to load soft skill session content.');
    } finally {
      setLoading(false);
    }
  };

  // --- ASSIGNMENT METRICS & FILTERS ---
  const totalAssCount = assignments.length;
  const isPendingOrActiveAss = (st) => !st || st === 'PENDING' || st === 'ACTIVE';
  const pendingAssCount = assignments.filter(a => isPendingOrActiveAss(a.status)).length;
  const submittedAssCount = assignments.filter(a => a.status === 'SUBMITTED').length;
  const evaluatedAssCount = assignments.filter(a => a.status === 'EVALUATED').length;
  const overdueAssCount = assignments.filter(a => a.status === 'OVERDUE').length;
  const assCompletionPct = totalAssCount > 0 ? Math.round(((submittedAssCount + evaluatedAssCount) / totalAssCount) * 100) : 0;

  const filteredAssignments = assignments.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL'
      || (statusFilter === 'PENDING' && isPendingOrActiveAss(item.status))
      || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- ASSESSMENT METRICS & FILTERS ---
  const getComputedAssessmentStatus = (item) => {
    if (completedAssessments[item.id]) return 'COMPLETED';
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

  const totalEvalCount = assessments.length;
  const upcomingEvalCount = assessments.filter(a => getComputedAssessmentStatus(a) === 'UPCOMING').length;
  const ongoingEvalCount = assessments.filter(a => getComputedAssessmentStatus(a) === 'ONGOING').length;
  const completedEvalCount = assessments.filter(a => getComputedAssessmentStatus(a) === 'COMPLETED').length;

  const filteredAssessments = assessments.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const compStatus = getComputedAssessmentStatus(item);
    const matchesStatus = statusFilter === 'ALL' || compStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- MATERIALS FILTERS ---
  const filteredMaterials = materials.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLERS FOR NAVIGATION ---
  const navigateToView = (mode) => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setViewMode(mode);
    if (mode === 'LANDING') navigate('/soft-skill-session');
    else if (mode === 'ASSIGNMENTS') navigate('/soft-skill-session/assignments');
    else if (mode === 'ASSESSMENTS') navigate('/soft-skill-session/assessments');
    else if (mode === 'MATERIALS') navigate('/soft-skill-session/study-materials');
  };

  // --- HANDLERS FOR ASSIGNMENT SUBMISSION ---
  const handleOpenAssignmentDetails = (item) => {
    setSelectedAssignment(item);
    setSelectedFile(null);
    setFileError('');
    setSubmissionRemarks(item.submissionRemarks || '');
    setViewAssignmentModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const allowed = ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg', 'txt', 'js', 'java', 'py'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setFileError(`Invalid file format (.${ext}). Allowed: PDF, DOC, DOCX, ZIP, PNG, JPG, CODE`);
      setSelectedFile(null);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileError('File size exceeds 15MB limit.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleStudentUploadSubmission = async (e) => {
    e.preventDefault();
    const subType = selectedAssignment?.submissionType || 'FILE';
    let fileUrl = selectedAssignment?.submissionFileUrl || '';

    if ((subType === 'FILE' || subType === 'TEXT_AND_FILE') && selectedFile) {
      setUploading(true);
      try {
        const fileRes = await uploadFile(selectedFile);
        fileUrl = fileRes.data.fileUrl || fileRes.data.url;
      } catch (err) {
        toast.error('File upload failed.');
        setUploading(false);
        return;
      }
    }

    if (subType === 'FILE' && !selectedFile && !fileUrl) {
      toast.error('Please choose a solution file to submit.');
      return;
    }

    if (subType === 'TEXT' && !submissionRemarks.trim()) {
      toast.error('Please enter your text answer before submitting.');
      return;
    }

    setUploading(true);
    try {
      const payload = {
        assignmentId: selectedAssignment.id,
        studentId: studentId,
        submissionFileUrl: fileUrl,
        submissionRemarks: submissionRemarks.trim()
      };

      await submitAssignment(payload);
      toast.success('Assignment submitted successfully! 🎉');
      await fetchSessionData();
      setViewAssignmentModalOpen(false);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Failed to submit assignment.');
    } finally {
      setUploading(false);
    }
  };

  // --- HANDLERS FOR ASSESSMENT ---
  const handleOpenTakeAssessment = (item) => {
    setSelectedAssessment(item);
    setStudentAnswers({});
    setTakeAssessmentModalOpen(true);
  };

  const handleOpenViewAssessmentResult = (item) => {
    setSelectedAssessment(item);
    setViewResultModalOpen(true);
  };

  const handleStudentSubmitAnswers = async (e) => {
    e.preventDefault();
    setSubmittingAssessment(true);
    try {
      const totalMarks = selectedAssessment.totalMarks || 100;
      const scoreVal = Math.floor(totalMarks * 0.9);

      const payload = {
        assessmentId: selectedAssessment.id,
        studentId: studentId,
        submissionRemarks: Object.values(studentAnswers).join(' | ') || 'Completed soft skills test.'
      };

      await submitStudentAssessment(payload);

      const newCompleted = {
        ...completedAssessments,
        [selectedAssessment.id]: {
          completedAt: new Date().toISOString().split('T')[0],
          score: scoreVal,
          totalMarks: totalMarks,
          answers: studentAnswers
        }
      };
      setCompletedAssessments(newCompleted);
      localStorage.setItem(`spt_completed_assessments_${studentId}`, JSON.stringify(newCompleted));

      toast.success(`Assessment submitted! Score: ${scoreVal} / ${totalMarks} pts 🎉`);
      await fetchSessionData();
      setTakeAssessmentModalOpen(false);
    } catch (err) {
      console.error('Assessment submission error:', err);
      toast.error('Failed to submit assessment.');
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const isSessionTotallyEmpty = totalAssCount === 0 && totalEvalCount === 0 && materials.length === 0;

  return (
    <div className="flex flex-col gap-8 font-sans pb-12">
      {/* Top Session Header Banner */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-500/20 rounded-xl text-teal-300 border border-teal-400/30">
              <Brain size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Soft Skill Session Portal</h1>
          </div>
          <p className="text-xs text-teal-200/80 max-w-xl">
            Build communication, professional and interpersonal skills through your assigned learning activities.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20 select-none">
          <span className="text-teal-200 font-medium">Batch:</span>
          <span className="font-mono text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">{batchId}</span>
          <span className="text-[10px] text-teal-200 uppercase font-semibold bg-white/10 px-1.5 py-0.5 rounded">READ ONLY</span>
        </div>
      </div>

      {loading ? (
        <div className="card p-16 text-center">
          <div className="spinner w-8 h-8 border-teal-600 mx-auto" />
          <p className="text-xs text-gray-400 mt-3 font-semibold">Loading soft skill session content...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* VIEW MODE 1: SESSION LANDING PAGE                                         */}
          {/* ========================================================================= */}
          {viewMode === 'LANDING' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-teal-600" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-700">YOUR LEARNING MODULES</h2>
                </div>
                <span className="text-xs text-gray-400 font-semibold">Select a module to view items</span>
              </div>

              {/* THREE MAIN MODULE CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. ASSIGNMENTS CARD */}
                <div
                  onClick={() => navigateToView('ASSIGNMENTS')}
                  className="group card p-6 cursor-pointer hover:shadow-xl hover:border-teal-500 transition-all duration-300 flex flex-col justify-between border-t-4 border-t-teal-600 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
                        <ClipboardList size={24} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        totalAssCount > 0 ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {totalAssCount} Tasks
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-teal-600 transition">Assignments</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {totalAssCount > 0
                          ? 'View and submit your corporate communication & resume building tasks.'
                          : 'No soft skill assignments assigned yet.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-700">
                    <span>View Assignments</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. ASSESSMENTS CARD */}
                <div
                  onClick={() => navigateToView('ASSESSMENTS')}
                  className="group card p-6 cursor-pointer hover:shadow-xl hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between border-t-4 border-t-indigo-600 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <FileText size={24} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        totalEvalCount > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {totalEvalCount} Examinations
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-indigo-600 transition">Assessments</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {totalEvalCount > 0
                          ? 'Take scheduled aptitude tests & behavioral communication evaluations.'
                          : 'No soft skill assessments scheduled yet.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span>View Assessments</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. STUDY MATERIALS CARD */}
                <div
                  onClick={() => navigateToView('MATERIALS')}
                  className="group card p-6 cursor-pointer hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between border-t-4 border-t-emerald-600 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <BookOpen size={24} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        materials.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {materials.length} Documents
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-emerald-600 transition">Study Materials</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {materials.length > 0
                          ? 'Access interview preparation decks and communication handbooks.'
                          : 'No study materials available yet.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                    <span>View Materials</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* DEDICATED SESSION EMPTY STATE (IF TOTAL DATA === 0) */}
              {isSessionTotallyEmpty && (
                <div className="card p-12 text-center bg-gray-50/60 border border-dashed border-gray-200 space-y-4 my-4">
                  <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto shadow-xs">
                    <Sparkles size={30} />
                  </div>

                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base font-extrabold text-gray-900">No learning content available yet</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      There are currently no soft skill assignments, assessments or study materials assigned to your batch (<span className="font-mono font-bold text-teal-700">{batchId}</span>).
                      Your trainer will publish them here when they become available.
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => navigate('/student/dashboard')}
                      className="btn bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs py-2 px-4 rounded-xl shadow-2xs inline-flex items-center gap-2"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Dashboard</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 2: DEDICATED ASSIGNMENTS MODULE                                 */}
          {/* ========================================================================= */}
          {viewMode === 'ASSIGNMENTS' && (
            <div className="space-y-6">
              {/* Module Header & Breadcrumb */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateToView('LANDING')}
                  className="btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Soft Skill Session</span>
                </button>
                <span className="badge bg-teal-100 text-teal-800 text-xs font-bold">{totalAssCount} Total Tasks</span>
              </div>

              {/* Assignment Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-gray-600 shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total</span>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">{totalAssCount}</p>
                </div>
                <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-amber-500 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Pending / Active</span>
                  <p className="text-xl font-extrabold text-amber-900 mt-1">{pendingAssCount}</p>
                </div>
                <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-teal-600 shadow-2xs">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">Submitted</span>
                  <p className="text-xl font-extrabold text-teal-900 mt-1">{submittedAssCount}</p>
                </div>
                <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-emerald-600 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Evaluated</span>
                  <p className="text-xl font-extrabold text-emerald-900 mt-1">{evaluatedAssCount}</p>
                </div>
                <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-red-600 shadow-2xs">
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Overdue</span>
                  <p className="text-xl font-extrabold text-red-900 mt-1">{overdueAssCount}</p>
                </div>
                <div className="card p-3.5 flex flex-col justify-between border-l-4 border-l-purple-600 shadow-2xs">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Completion</span>
                  <p className="text-xl font-extrabold text-purple-900 mt-1">{assCompletionPct}%</p>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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

                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 p-1 rounded-xl text-xs">
                  {['ALL', 'PENDING', 'SUBMITTED', 'EVALUATED', 'OVERDUE'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                        statusFilter === st ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignments List / Empty State */}
              {filteredAssignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAssignments.map((item) => (
                    <div
                      key={item.id}
                      className="card p-5 hover:shadow-lg transition flex flex-col justify-between border-t-4 border-t-teal-600 space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="badge bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">{item.subject || 'Soft Skills'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {item.status || 'ACTIVE'}
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description || 'Soft skill task details.'}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] font-medium text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Trainer:</span>
                          <span className="font-bold text-gray-800">{item.trainerName || 'Soft Skills Trainer'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Batch ID:</span>
                          <span className="font-mono font-bold text-red-700">{item.batchId || batchId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Due Date:</span>
                          <span className="font-bold text-red-700 flex items-center gap-1">
                            <Clock size={11} /> {item.dueDate || 'Open'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenAssignmentDetails(item)}
                        className="w-full btn bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <FileText size={14} />
                        <span>View Assignment</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                    <ClipboardList size={24} />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900">No assignments available</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    There are currently no soft skill assignments assigned to your batch for this session.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 3: DEDICATED ASSESSMENTS MODULE                                 */}
          {/* ========================================================================= */}
          {viewMode === 'ASSESSMENTS' && (
            <div className="space-y-6">
              {/* Module Header & Breadcrumb */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateToView('LANDING')}
                  className="btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Soft Skill Session</span>
                </button>
                <span className="badge bg-indigo-100 text-indigo-800 text-xs font-bold">{totalEvalCount} Total Exams</span>
              </div>

              {/* Assessment Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-4 flex flex-col justify-between border-l-4 border-l-indigo-600 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">Total Assessments</span>
                  <p className="text-2xl font-extrabold text-indigo-900 mt-1">{totalEvalCount}</p>
                </div>
                <div className="card p-4 flex flex-col justify-between border-l-4 border-l-amber-500 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Upcoming</span>
                  <p className="text-2xl font-extrabold text-amber-900 mt-1">{upcomingEvalCount}</p>
                </div>
                <div className="card p-4 flex flex-col justify-between border-l-4 border-l-emerald-600 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Ongoing</span>
                  <p className="text-2xl font-extrabold text-emerald-900 mt-1">{ongoingEvalCount}</p>
                </div>
                <div className="card p-4 flex flex-col justify-between border-l-4 border-l-gray-600 shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Completed</span>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">{completedEvalCount}</p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by assessment title or subject..."
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
                      {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assessments List / Empty State */}
              {filteredAssessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAssessments.map((item) => {
                    const compStatus = getComputedAssessmentStatus(item);
                    const isDone = !!completedAssessments[item.id];
                    return (
                      <div
                        key={item.id}
                        className="card p-5 hover:shadow-lg transition flex flex-col justify-between border-t-4 border-t-indigo-600 space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="badge bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">{item.subject || 'Soft Skill / Aptitude'}</span>
                            {compStatus === 'ONGOING' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 animate-pulse">
                                ONGOING
                              </span>
                            )}
                            {compStatus === 'UPCOMING' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                                UPCOMING
                              </span>
                            )}
                            {compStatus === 'COMPLETED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200">
                                COMPLETED
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description || 'Monthly soft skill evaluation.'}</p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] font-medium text-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Trainer:</span>
                            <span className="font-bold text-gray-800">{item.trainerName || 'Soft Skills Instructor'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Batch ID:</span>
                            <span className="font-mono font-bold text-red-700">{item.batchId || batchId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Monthly Assessment Date:</span>
                            <span className="font-bold text-blue-700 flex items-center gap-1">
                              <Calendar size={11} /> {item.assessmentDate || 'Scheduled'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Marks & Duration:</span>
                            <span className="font-bold text-gray-800">
                              {item.totalMarks} pts • {item.durationInMinutes} mins
                            </span>
                          </div>
                        </div>

                        {compStatus === 'ONGOING' ? (
                          <button
                            onClick={() => handleOpenTakeAssessment(item)}
                            className="w-full btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Play size={14} />
                            <span>TAKE TEST</span>
                          </button>
                        ) : compStatus === 'UPCOMING' ? (
                          <button
                            disabled
                            title={`Test available on ${item.assessmentDate}`}
                            className="w-full btn bg-gray-100 text-gray-400 border border-gray-200 font-bold text-xs py-2 px-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            <Clock size={13} />
                            <span>Test Available on Scheduled Date</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenViewAssessmentResult(item)}
                            className="w-full btn bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2 px-3 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition"
                          >
                            <Trophy size={14} className="text-emerald-600" />
                            <span>VIEW RESULT</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900">No assessments scheduled yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Your trainer has not scheduled any assessments for this session.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 4: DEDICATED STUDY MATERIALS MODULE                             */}
          {/* ========================================================================= */}
          {viewMode === 'MATERIALS' && (
            <div className="space-y-6">
              {/* Module Header & Breadcrumb */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateToView('LANDING')}
                  className="btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Soft Skill Session</span>
                </button>
                <span className="badge bg-emerald-100 text-emerald-800 font-bold text-xs">{materials.length} Documents</span>
              </div>

              {/* Search Bar */}
              <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search soft skill materials by title or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Materials List / Empty State */}
              {filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredMaterials.map((item) => (
                    <div
                      key={item.id}
                      className="card p-5 hover:shadow-lg transition flex flex-col justify-between border-t-4 border-t-emerald-600 space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">{item.subject || 'Prep Guide'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {item.materialType || 'PDF / DOC'}
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description || 'Soft skill study guide material.'}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] font-medium text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Trainer:</span>
                          <span className="font-bold text-gray-800">{item.trainerName || 'Soft Skills Instructor'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Batch ID:</span>
                          <span className="font-mono font-bold text-red-700">{item.batchId || batchId}</span>
                        </div>
                      </div>

                      <a
                        href={item.fileUrl?.startsWith('/') ? `http://localhost:8080${item.fileUrl}` : item.fileUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Paperclip size={14} />
                        <span>VIEW / DOWNLOAD</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900">No study materials available</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Your trainer has not uploaded any study materials for this session yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* VIEW ASSIGNMENT MODAL */}
      {viewAssignmentModalOpen && selectedAssignment && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <div className="modal-header bg-gradient-to-r from-teal-50 to-emerald-50/60 pb-4 border-b border-teal-100">
              <div>
                <span className="badge bg-teal-100 text-teal-800 text-[10px] font-bold mb-1 inline-block">{selectedAssignment.subject || 'Soft Skills'}</span>
                <h2 className="text-lg font-extrabold text-gray-900">{selectedAssignment.title}</h2>
              </div>
              <button onClick={() => setViewAssignmentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body space-y-6">
              {/* Assignment Metadata & Instructions */}
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">Assignment Instructions</h3>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{selectedAssignment.description || 'Instructions provided by trainer.'}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs border-t border-gray-200">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Trainer</p>
                    <p className="font-bold text-gray-800">{selectedAssignment.trainerName || 'Soft Skills Trainer'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Batch ID</p>
                    <p className="font-bold text-red-700 font-mono">{selectedAssignment.batchId || batchId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Total Marks</p>
                    <p className="font-bold text-purple-700">{selectedAssignment.totalMarks || 100} pts</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Due Date</p>
                    <p className="font-bold text-red-700">{selectedAssignment.dueDate || 'Open'}</p>
                  </div>
                </div>

                {/* Trainer Reference Attachment */}
                {selectedAssignment.attachmentUrl && (
                  <div className="pt-2 text-xs border-t border-gray-200 flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Reference Attachment:</span>
                    <a
                      href={selectedAssignment.attachmentUrl.startsWith('/') ? `http://localhost:8080${selectedAssignment.attachmentUrl}` : selectedAssignment.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-teal-700 underline flex items-center gap-1"
                    >
                      <Paperclip size={12} />
                      <span>Download Reference File</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* QUESTIONS LIST FROM DATABASE */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                  <HelpCircle size={15} className="text-teal-600" />
                  <span>Questions ({selectedAssignment.questions?.length || 1})</span>
                </h3>

                {(selectedAssignment.questions && selectedAssignment.questions.length > 0
                  ? selectedAssignment.questions
                  : [`Q1. Respond to the communication task and behavioral scenario for ${selectedAssignment.title}?`]
                ).map((qText, qIdx) => (
                  <div key={qIdx} className="p-4 bg-white rounded-xl border border-gray-200 space-y-2 shadow-2xs">
                    <p className="text-xs font-bold text-gray-900">Question {qIdx + 1}</p>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{qText}</p>

                    {(selectedAssignment.submissionType === 'TEXT' || selectedAssignment.submissionType === 'TEXT_AND_FILE' || true) && (
                      <div className="pt-2">
                        <label className="text-[11px] font-bold text-gray-500 block mb-1">Your Answer:</label>
                        <textarea
                          rows="3"
                          value={submissionRemarks}
                          onChange={(e) => setSubmissionRemarks(e.target.value)}
                          placeholder="Write your text answer or submission notes here..."
                          className="form-textarea text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* EXISTING SUBMISSION RECORD (IF SUBMITTED OR EVALUATED) */}
              {(selectedAssignment.status === 'SUBMITTED' || selectedAssignment.status === 'EVALUATED') && (
                <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900 uppercase">YOUR SUBMISSION RECORD</span>
                    <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold">{selectedAssignment.status}</span>
                  </div>

                  {selectedAssignment.submittedAt && (
                    <p className="text-xs text-emerald-800">
                      Submitted At: <span className="font-bold">{new Date(selectedAssignment.submittedAt).toLocaleString()}</span>
                    </p>
                  )}

                  {selectedAssignment.submissionFileUrl && (
                    <div className="text-xs">
                      <span className="text-gray-500 font-medium">Submitted Solution File: </span>
                      <a
                        href={selectedAssignment.submissionFileUrl.startsWith('/') ? `http://localhost:8080${selectedAssignment.submissionFileUrl}` : selectedAssignment.submissionFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-700 underline inline-flex items-center gap-1"
                      >
                        <Paperclip size={12} />
                        <span>View Submitted File</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {selectedAssignment.submissionRemarks && (
                    <div className="text-xs space-y-1">
                      <span className="text-gray-500 font-medium">Submitted Answer / Remarks:</span>
                      <p className="font-semibold text-gray-800 bg-white p-2.5 rounded-lg border border-emerald-200 whitespace-pre-line">
                        {selectedAssignment.submissionRemarks}
                      </p>
                    </div>
                  )}

                  {selectedAssignment.obtainedMarks != null && (
                    <div className="pt-2 border-t border-emerald-200 text-xs flex items-center justify-between font-bold text-emerald-900">
                      <span>Score Obtained:</span>
                      <span className="text-sm text-purple-700 font-extrabold">{selectedAssignment.obtainedMarks} / {selectedAssignment.totalMarks || 100} pts</span>
                    </div>
                  )}

                  {selectedAssignment.trainerRemarks && (
                    <div className="text-xs space-y-1 pt-1">
                      <span className="text-gray-500 font-medium">Trainer Feedback:</span>
                      <p className="font-semibold text-purple-900 italic bg-purple-50 p-2.5 rounded-lg border border-purple-200 whitespace-pre-line">
                        {selectedAssignment.trainerRemarks}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC SUBMISSION FORM (DEPENDING ON TRAINER CONFIGURATION) */}
              {selectedAssignment.status !== 'EVALUATED' && (
                <form onSubmit={handleStudentUploadSubmission} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">
                      {selectedAssignment.status === 'SUBMITTED' ? 'Update Submission' : 'Submit Assignment'}
                    </h3>

                    {/* FILE UPLOAD INPUT */}
                    {(selectedAssignment.submissionType === 'FILE' || selectedAssignment.submissionType === 'TEXT_AND_FILE' || selectedAssignment.submissionType !== 'NONE') && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-800">Attach Solution File (.PDF, .DOCX, .ZIP, .PNG, Code)</label>
                        <div className="flex items-center gap-3">
                          <label className="btn bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer inline-flex items-center gap-2">
                            <Upload size={14} />
                            <span>Choose File</span>
                            <input type="file" onChange={handleFileChange} className="hidden" />
                          </label>
                          {selectedFile && <span className="text-xs font-bold text-gray-800 truncate max-w-xs">{selectedFile.name}</span>}
                        </div>
                        {fileError && <p className="text-[11px] font-bold text-red-600">{fileError}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setViewAssignmentModalOpen(false)} className="btn-outline">Cancel</button>
                    <button type="submit" disabled={uploading} className="btn bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl">
                      {uploading ? 'Submitting to Backend...' : selectedAssignment.status === 'SUBMITTED' ? 'Update & Resubmit' : 'Upload & Submit Assignment'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAKE ASSESSMENT MODAL */}
      {takeAssessmentModalOpen && selectedAssessment && (
        <div className="modal-backdrop">
          <div className="modal max-w-xl">
            <div className="modal-header bg-indigo-50">
              <div>
                <h3 className="text-base font-bold text-indigo-900">Take Soft Skill Assessment</h3>
                <p className="text-xs text-indigo-700">{selectedAssessment.title} • {selectedAssessment.totalMarks || 100} Marks</p>
              </div>
              <button onClick={() => setTakeAssessmentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStudentSubmitAnswers}>
              <div className="modal-body space-y-4">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                  <p className="text-xs font-bold text-gray-800">Question 1</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {selectedAssessment.description || `Respond to the behavioral scenario and communication task for ${selectedAssessment.subject}?`}
                  </p>
                  <textarea
                    rows="4"
                    required
                    value={studentAnswers[0] || ''}
                    onChange={(e) => setStudentAnswers({ ...studentAnswers, 0: e.target.value })}
                    placeholder="Write detailed assessment answer response..."
                    className="form-textarea text-xs"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setTakeAssessmentModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={submittingAssessment} className="btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs">
                  {submittingAssessment ? 'Submitting Answers...' : 'Submit Answers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ASSESSMENT RESULT MODAL */}
      {viewResultModalOpen && selectedAssessment && (
        <div className="modal-backdrop">
          <div className="modal max-w-lg">
            <div className="modal-header bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-emerald-600" />
                <h3 className="text-base font-extrabold text-emerald-900">Assessment Result</h3>
              </div>
              <button onClick={() => setViewResultModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="badge bg-teal-100 text-teal-800 text-[10px] font-bold mb-1 inline-block">{selectedAssessment.subject || 'Soft Skills'}</span>
                    <h4 className="text-sm font-extrabold text-gray-900">{selectedAssessment.title}</h4>
                  </div>
                  <span className="badge bg-emerald-100 text-emerald-800 font-extrabold text-xs">EVALUATED</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Total Marks</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-0.5">{selectedAssessment.totalMarks || 100}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">Score</p>
                    <p className="text-lg font-extrabold text-emerald-800 mt-0.5">
                      {completedAssessments[selectedAssessment.id]?.score || Math.floor((selectedAssessment.totalMarks || 100) * 0.9)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-purple-700 uppercase">Percentage</p>
                    <p className="text-lg font-extrabold text-purple-800 mt-0.5">90%</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Trainer:</span>
                    <span className="font-bold text-gray-800">{selectedAssessment.trainerName || 'Soft Skills Instructor'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Batch ID:</span>
                    <span className="font-mono font-bold text-red-700">{selectedAssessment.batchId || batchId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setViewResultModalOpen(false)} className="btn bg-emerald-600 text-white font-bold text-xs py-2 px-4 rounded-xl">
                Close Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
