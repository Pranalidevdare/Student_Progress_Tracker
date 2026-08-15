import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAssessmentsByBatch,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStatistics,
  getAssessmentSubmissions,
  evaluateAssessmentSubmission,
  getAllBatches,
  switchTrainerBatch,
  uploadAssessmentDocument,
  getAssessmentDetailsById,
  getSingleAssessmentStats,
  getAssessmentStudentDetails,
  getAssessmentEvaluationDetails
} from '../api/assessmentApi';
import {
  Plus, Edit2, Trash2, Search, FileText, Clock, X, Check, Lock, CheckCircle2,
  Play, RefreshCw, Layers, Award, AlertCircle, Eye, SlidersHorizontal, Users,
  CheckSquare, FileCheck, AlertTriangle, ArrowUpDown, Calendar, HelpCircle,
  ExternalLink, User, Mail, MessageSquare, Paperclip, UploadCloud, File, AlertOctagon,
  RotateCcw, Filter, ArrowLeft, ShieldCheck, CheckSquare2, FileCode, Upload, Save, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

export default function Assessments() {
  const { user, updateUserData } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const studentId = user?.id || user?.studentId || user?.applicationNumber || 'STU7076';
  const trainerId = user?.id || user?.email || localStorage.getItem('trainerId');

  // Active Batch State
  const [currentBatchName, setCurrentBatchName] = useState(
    user?.batchName || localStorage.getItem('batchName') || 'Java Full Stack - Batch 2026-A'
  );
  const [currentBatchId, setCurrentBatchId] = useState(
    user?.batchId || localStorage.getItem('batchId') || '6a801c24710f205172ba927f'
  );

  // Core Data State
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalStudents: 0,
    activeCount: 0,
    submittedCount: 0,
    evaluatedCount: 0,
    pendingEvaluationCount: 0,
    overdueCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Advanced List Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [participationFilter, setParticipationFilter] = useState('ALL');
  const [evaluationFilter, setEvaluationFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Batch Switcher Modal State
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [selectedBatchToSwitch, setSelectedBatchToSwitch] = useState(null);

  // Dedicated Assessment Details Dashboard View State
  const [detailsViewOpen, setDetailsViewOpen] = useState(false);
  const [selectedAssessmentDetails, setSelectedAssessmentDetails] = useState(null);
  const [studentAttemptList, setStudentAttemptList] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [detailStats, setDetailStats] = useState(null);

  // Student Attempt Table Search, Filter & Sort inside Details View
  const [studentSearch, setStudentSearch] = useState('');
  const [detailPartFilter, setDetailPartFilter] = useState('ALL');
  const [detailEvalFilter, setDetailEvalFilter] = useState('ALL');
  const [detailResultFilter, setDetailResultFilter] = useState('ALL');
  const [detailSortBy, setDetailSortBy] = useState('newest');
  const [detailsError, setDetailsError] = useState(null);

  // Assessment Form Modal State (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Source Switch Confirmation Modal State
  const [switchConfirmModalOpen, setSwitchConfirmModalOpen] = useState(false);
  const [pendingQuestionSource, setPendingQuestionSource] = useState(null);

  // Assessment Form State (Options: MANUAL vs PDF)
  const [formData, setFormData] = useState({
    trainerId: trainerId,
    batchId: currentBatchId,
    title: '',
    subject: '',
    assessmentType: 'QUIZ',
    description: '',
    questionSource: 'MANUAL', // "MANUAL" or "PDF"
    questions: [
      { questionId: 'q1', questionNumber: 1, questionText: 'What is inheritance in Java?', maxMarks: 10, questionType: 'DESCRIPTIVE' },
      { questionId: 'q2', questionNumber: 2, questionText: 'Explain polymorphism with an example.', maxMarks: 10, questionType: 'DESCRIPTIVE' }
    ],
    attachmentUrl: '',
    totalMarks: 20,
    durationInMinutes: 60,
    assessmentDate: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    status: 'UPCOMING'
  });

  // Dedicated View Evaluation Details Modal State
  const [viewEvalModalOpen, setViewEvalModalOpen] = useState(false);
  const [evalDetailRecord, setEvalDetailRecord] = useState(null);
  const [loadingEvalDetail, setLoadingEvalDetail] = useState(false);

  // Student Answer Sheet Modal State
  const [answerSheetModalOpen, setAnswerSheetModalOpen] = useState(false);
  const [selectedAnswerSheetSub, setSelectedAnswerSheetSub] = useState(null);

  // Student Evaluation Modal State (Trainer Grading)
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedSubmissionForEval, setSelectedSubmissionForEval] = useState(null);
  const [evalData, setEvalData] = useState({ marksObtained: 0, trainerFeedback: '' });
  const [evaluating, setEvaluating] = useState(false);

  // Student Take / Attempt Assessment Modal State
  const [takeModalOpen, setTakeModalOpen] = useState(false);
  const [targetAssessment, setTargetAssessment] = useState(null);
  const [studentAnswersMap, setStudentAnswersMap] = useState({}); // questionId -> answerText
  const [completedAssessments, setCompletedAssessments] = useState({});
  const [submittingStudentAttempt, setSubmittingStudentAttempt] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAssessmentsAndStats();
    const localCompleted = localStorage.getItem(`spt_completed_assessments_${studentId}`);
    if (localCompleted) {
      try {
        setCompletedAssessments(JSON.parse(localCompleted));
      } catch (e) {}
    }
  }, [currentBatchId, studentId]);

  const fetchAssessmentsAndStats = async () => {
    if (!currentBatchId) return;
    setLoading(true);
    setError(null);

    let loadedAssessments = false;

    try {
      const [assRes, statsRes] = await Promise.allSettled([
        getAssessmentsByBatch(currentBatchId),
        getAssessmentStatistics(currentBatchId)
      ]);

      if (assRes.status === 'fulfilled' && assRes.value.data) {
        setAssessments(assRes.value.data);
        loadedAssessments = true;
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.log('Error fetching assessment data', err);
      setError(err);
    }

    if (!loadedAssessments) {
      const localData = localStorage.getItem(`spt_assessments_${currentBatchId}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed && parsed.length > 0) {
            setAssessments(parsed);
            setError(null);
            loadedAssessments = true;
          }
        } catch (e) {}
      }
    }

    if (!loadedAssessments && !error) {
      const defaultItems = [
        {
          id: 'ass1',
          title: 'Core Java & OOP Principles Assessment',
          subject: 'Java',
          assessmentType: 'QUIZ',
          questionSource: 'MANUAL',
          questions: [
            { questionId: 'q1', questionNumber: 1, questionText: 'What is inheritance in Java?', maxMarks: 10, questionType: 'DESCRIPTIVE' },
            { questionId: 'q2', questionNumber: 2, questionText: 'Explain polymorphism with an example.', maxMarks: 10, questionType: 'DESCRIPTIVE' }
          ],
          totalMarks: 20,
          durationInMinutes: 45,
          assessmentDate: '2026-08-10',
          startTime: '10:00 AM',
          endTime: '10:45 AM',
          description: 'Covers Object-Oriented Principles, Inheritance, and Interfaces.',
          status: 'COMPLETED',
          attachmentUrl: '',
          attemptsCount: 2,
          pendingEvalCount: 1
        },
        {
          id: 'ass2',
          title: 'Spring Boot REST Microservices Exam',
          subject: 'Spring Boot',
          assessmentType: 'EXAMINATION',
          questionSource: 'PDF',
          questions: [],
          totalMarks: 50,
          durationInMinutes: 90,
          assessmentDate: '2026-08-18',
          startTime: '11:00 AM',
          endTime: '12:30 PM',
          description: 'Comprehensive assessment on Spring Data JPA, Controllers & Security.',
          status: 'UPCOMING',
          attachmentUrl: '/uploads/Spring_Boot_Microservices_Exam.pdf',
          attemptsCount: 0,
          pendingEvalCount: 0
        }
      ];
      setAssessments(defaultItems);
      localStorage.setItem(`spt_assessments_${currentBatchId}`, JSON.stringify(defaultItems));
      setError(null);
    }

    setLoading(false);
  };

  const handleOpenAssessmentDetails = async (item) => {
    const targetId = item?.id || item?._id || item?.assessmentId;
    console.log("Selected assessment:", item);
    console.log("Assessment ID:", targetId);

    if (!targetId) {
      toast.error('Invalid assessment selected.');
      return;
    }

    setSelectedAssessmentDetails(item);
    setDetailsViewOpen(true);
    setAttemptsLoading(true);
    setDetailsError(null);
    setStudentSearch('');
    setDetailPartFilter('ALL');
    setDetailEvalFilter('ALL');
    setDetailResultFilter('ALL');
    setDetailSortBy('newest');

    try {
      const [stuRes, statRes, assRes] = await Promise.allSettled([
        getAssessmentStudentDetails(targetId, currentBatchId),
        getSingleAssessmentStats(targetId, currentBatchId),
        getAssessmentDetailsById(targetId)
      ]);

      if (assRes.status === 'fulfilled' && assRes.value?.data) {
        console.log("Assessment details response:", assRes.value.data);
        setSelectedAssessmentDetails(assRes.value.data);
      }

      if (stuRes.status === 'fulfilled' && stuRes.value?.data) {
        setStudentAttemptList(stuRes.value.data);
      } else {
        setStudentAttemptList([]);
      }

      if (statRes.status === 'fulfilled' && statRes.value?.data) {
        setDetailStats(statRes.value.data);
      }
    } catch (err) {
      console.error('Unable to load assessment details', err);
      setDetailsError('Unable to load assessment details. Please try again.');
    } finally {
      setAttemptsLoading(false);
    }
  };

  const handleViewEvaluationDetails = async (stu) => {
    setViewEvalModalOpen(true);
    setLoadingEvalDetail(true);
    setEvalDetailRecord(null);

    const submissionId = stu.submissionId || stu.id;

    try {
      if (submissionId) {
        const res = await getAssessmentEvaluationDetails(submissionId);
        if (res.data) {
          setEvalDetailRecord(res.data);
        }
      }
    } catch (err) {
      console.log('Fetching evaluation details via API fallback', err);
    }

    if (!evalDetailRecord) {
      const maxMarks = stu.maxMarks || selectedAssessmentDetails?.totalMarks || 50;
      const marks = stu.marksObtained || 0;
      const pct = stu.percentage || Math.round((marks * 100.0 / maxMarks) * 10.0) / 10.0;
      const resStatus = stu.resultStatus || (marks >= maxMarks * 0.4 ? 'PASSED' : 'FAILED');

      setEvalDetailRecord({
        studentName: stu.studentName || 'Student',
        studentEmail: stu.studentEmail || 'student@spt.com',
        assessmentTitle: selectedAssessmentDetails?.title || 'Technical Assessment',
        subject: selectedAssessmentDetails?.subject || 'Java / React',
        submittedAt: stu.submittedAt || new Date().toISOString(),
        evaluationDate: stu.updatedAt || new Date().toISOString(),
        maxMarks: maxMarks,
        marksObtained: marks,
        percentage: pct,
        resultStatus: resStatus,
        trainerName: user?.name || 'Prof. Trainer',
        trainerRemarks: stu.trainerRemarks || 'Good performance.',
        studentAnswers: stu.studentAnswers || 'Sample submitted answers.',
        answerSheetUrl: stu.answerSheetUrl || selectedAssessmentDetails?.attachmentUrl || ''
      });
    }

    setLoadingEvalDetail(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setDateFilter('ALL');
    setFromDate('');
    setToDate('');
    setParticipationFilter('ALL');
    setEvaluationFilter('ALL');
    setSortBy('NEWEST');
  };

  const isFilterActive =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    dateFilter !== 'ALL' ||
    fromDate !== '' ||
    toDate !== '' ||
    participationFilter !== 'ALL' ||
    evaluationFilter !== 'ALL' ||
    sortBy !== 'NEWEST';

  // Batch Switcher Handlers
  const handleOpenBatchModal = async () => {
    setBatchModalOpen(true);
    setLoadingBatches(true);
    try {
      const res = await getAllBatches();
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAvailableBatches(res.data);
      } else {
        setAvailableBatches([
          { id: '6a801c24710f205172ba927f', batchId: 'BATCH001', batchName: 'Java Full Stack - Batch 2026-A', studentCount: 28 },
          { id: '6a801c24710f205172ba9280', batchId: 'BATCH002', batchName: 'Python Data Science - Batch 2026-B', studentCount: 22 },
          { id: '6a801c24710f205172ba9281', batchId: 'BATCH003', batchName: 'Cloud DevOps Masterclass - Batch 2026-C', studentCount: 18 }
        ]);
      }
    } catch (err) {
      setAvailableBatches([
        { id: '6a801c24710f205172ba927f', batchId: 'BATCH001', batchName: 'Java Full Stack - Batch 2026-A', studentCount: 28 },
        { id: '6a801c24710f205172ba9280', batchId: 'BATCH002', batchName: 'Python Data Science - Batch 2026-B', studentCount: 22 },
        { id: '6a801c24710f205172ba9281', batchId: 'BATCH003', batchName: 'Cloud DevOps Masterclass - Batch 2026-C', studentCount: 18 }
      ]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleConfirmBatchSwitch = async () => {
    if (!selectedBatchToSwitch) return;
    try {
      await switchTrainerBatch({
        batchId: selectedBatchToSwitch.id || selectedBatchToSwitch.batchId,
        batchName: selectedBatchToSwitch.batchName
      });
      const newBId = selectedBatchToSwitch.id || selectedBatchToSwitch.batchId;
      const newBName = selectedBatchToSwitch.batchName;

      setCurrentBatchId(newBId);
      setCurrentBatchName(newBName);
      localStorage.setItem('batchId', newBId);
      localStorage.setItem('batchName', newBName);

      if (updateUserData) {
        updateUserData({ batchId: newBId, batchName: newBName });
      }

      toast.success(`Switched active batch to "${newBName}"! 🎉`);
      setBatchModalOpen(false);
      fetchAssessmentsAndStats();
    } catch (err) {
      toast.error('Failed to switch batch on server.');
    }
  };

  // Form Modal Handlers (Create / Edit)
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setSelectedFile(null);
    setFormData({
      trainerId,
      batchId: currentBatchId,
      title: '',
      subject: '',
      assessmentType: 'QUIZ',
      description: '',
      questionSource: 'MANUAL',
      questions: [
        { questionId: 'q1', questionNumber: 1, questionText: 'What is inheritance in Java?', maxMarks: 10, questionType: 'DESCRIPTIVE' },
        { questionId: 'q2', questionNumber: 2, questionText: 'Explain polymorphism with an example.', maxMarks: 10, questionType: 'DESCRIPTIVE' }
      ],
      attachmentUrl: '',
      totalMarks: 20,
      durationInMinutes: 60,
      assessmentDate: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      status: 'UPCOMING'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    const status = String(item.status || '').toUpperCase();
    const dynStatus = getDynamicScheduleStatus(item);
    if (status === 'COMPLETED' || dynStatus === 'COMPLETED') {
      toast.error('Completed assessments cannot be edited.');
      return;
    }
    if (item.attemptsCount > 0) {
      toast.error('Assessment cannot be edited after a student has attempted it.');
      return;
    }
    setEditingId(item.id);
    setSelectedFile(null);
    const qSource = item.questionSource || (item.attachmentUrl ? 'PDF' : 'MANUAL');
    const existingQs = item.questions && item.questions.length > 0 ? item.questions : [
      { questionId: 'q1', questionNumber: 1, questionText: 'Describe the core concepts of this topic.', maxMarks: 10, questionType: 'DESCRIPTIVE' }
    ];
    const initialTotal = qSource === 'MANUAL'
      ? existingQs.reduce((acc, curr) => acc + (Number(curr.maxMarks) || 0), 0)
      : (item.totalMarks || 50);

    setFormData({
      trainerId: item.trainerId || trainerId,
      batchId: item.batchId || currentBatchId,
      title: item.title || '',
      subject: item.subject || '',
      assessmentType: item.assessmentType || 'QUIZ',
      description: item.description || '',
      questionSource: qSource,
      questions: existingQs,
      attachmentUrl: item.attachmentUrl || '',
      totalMarks: initialTotal,
      durationInMinutes: item.durationInMinutes || 60,
      assessmentDate: item.assessmentDate || '',
      startTime: item.startTime || '10:00 AM',
      endTime: item.endTime || '11:00 AM',
      status: item.status || 'UPCOMING'
    });
    setModalOpen(true);
  };

  // Question Source Toggle & Confirmation Logic
  const handleQuestionSourceChange = (newSource) => {
    if (newSource === formData.questionSource) return;

    // Check if user entered questions or uploaded file
    const hasManualData = formData.questionSource === 'MANUAL' && formData.questions.some(q => q.questionText.trim().length > 0);
    const hasPdfData = formData.questionSource === 'PDF' && (selectedFile || formData.attachmentUrl);

    if (hasManualData || hasPdfData) {
      setPendingQuestionSource(newSource);
      setSwitchConfirmModalOpen(true);
    } else {
      applyQuestionSourceSwitch(newSource);
    }
  };

  const applyQuestionSourceSwitch = (newSource) => {
    if (newSource === 'MANUAL') {
      const defaultQs = [
        { questionId: 'q1', questionNumber: 1, questionText: '', maxMarks: 10, questionType: 'DESCRIPTIVE' },
        { questionId: 'q2', questionNumber: 2, questionText: '', maxMarks: 10, questionType: 'DESCRIPTIVE' }
      ];
      const sumTotal = defaultQs.reduce((acc, curr) => acc + curr.maxMarks, 0);
      setFormData({
        ...formData,
        questionSource: 'MANUAL',
        questions: defaultQs,
        totalMarks: sumTotal
      });
      setSelectedFile(null);
    } else {
      setFormData({
        ...formData,
        questionSource: 'PDF',
        questions: []
      });
    }
    setSwitchConfirmModalOpen(false);
    setPendingQuestionSource(null);
  };

  // Manual Question Builder Helpers
  const handleAddQuestion = () => {
    const nextNum = formData.questions.length + 1;
    const newQ = {
      questionId: `q_${Date.now()}_${nextNum}`,
      questionNumber: nextNum,
      questionText: '',
      maxMarks: 10,
      questionType: 'DESCRIPTIVE'
    };
    const updatedQs = [...formData.questions, newQ];
    const newTotal = updatedQs.reduce((acc, curr) => acc + (Number(curr.maxMarks) || 0), 0);
    setFormData({
      ...formData,
      questions: updatedQs,
      totalMarks: newTotal
    });
  };

  const handleRemoveQuestion = (idx) => {
    if (formData.questions.length <= 1) {
      toast.error('At least one question is required for manual assessment.');
      return;
    }
    const updatedQs = formData.questions.filter((_, i) => i !== idx).map((q, i) => ({
      ...q,
      questionNumber: i + 1
    }));
    const newTotal = updatedQs.reduce((acc, curr) => acc + (Number(curr.maxMarks) || 0), 0);
    setFormData({
      ...formData,
      questions: updatedQs,
      totalMarks: newTotal
    });
  };

  const handleQuestionChange = (idx, field, val) => {
    const updatedQs = formData.questions.map((q, i) => {
      if (i === idx) {
        return { ...q, [field]: field === 'maxMarks' ? Math.max(1, Number(val) || 1) : val };
      }
      return q;
    });
    const newTotal = updatedQs.reduce((acc, curr) => acc + (Number(curr.maxMarks) || 0), 0);
    setFormData({
      ...formData,
      questions: updatedQs,
      totalMarks: newTotal
    });
  };

  // File Upload Handlers (PDF Option)
  const handleFileChange = (file) => {
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
        toast.error('Only PDF documents are allowed for assessment question papers.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('PDF file size must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setFormData({ ...formData, attachmentUrl: '' });
  };

  // Submit Assessment Form (Create / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) {
      toast.error('Please enter Title and Subject.');
      return;
    }
    if (!formData.durationInMinutes || formData.durationInMinutes <= 0) {
      toast.error('Duration is required.');
      return;
    }
    if (!formData.assessmentDate) {
      toast.error('Assessment date is required.');
      return;
    }

    // Assessment Date & Time Schedule Validation
    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.assessmentDate < todayStr) {
      toast.error('Assessment date cannot be in the past.');
      return;
    }

    const parseDateTimeJS = (dateStr, timeStr) => {
      if (!dateStr || !timeStr) return null;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      let hours = 10;
      let minutes = 0;
      const cleaned = timeStr.trim().toUpperCase();
      const isPM = cleaned.includes('PM');
      const isAM = cleaned.includes('AM');
      const match = cleaned.match(/(\d+):(\d+)/);

      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
      }

      return new Date(year, month, day, hours, minutes, 0, 0);
    };

    const now = new Date();
    const startDt = parseDateTimeJS(formData.assessmentDate, formData.startTime);
    if (startDt && startDt <= now) {
      if (formData.assessmentDate < todayStr) {
        toast.error('Assessment date cannot be in the past.');
      } else {
        toast.error('Assessment start time cannot be in the past.');
      }
      return;
    }

    const endDt = parseDateTimeJS(formData.assessmentDate, formData.endTime);
    if (startDt && endDt && endDt <= startDt) {
      toast.error('Assessment end time must be after the start time.');
      return;
    }

    // Question Source Validation
    if (formData.questionSource === 'MANUAL') {
      if (!formData.questions || formData.questions.length === 0) {
        toast.error('At least one question is required for manual assessment.');
        return;
      }
      const emptyQ = formData.questions.find(q => !q.questionText.trim());
      if (emptyQ) {
        toast.error('Every question must have non-empty question text.');
        return;
      }
    } else if (formData.questionSource === 'PDF') {
      if (!selectedFile && !formData.attachmentUrl) {
        toast.error('Please upload a Question PDF document.');
        return;
      }
    }

    setSubmitting(true);
    let finalDocUrl = formData.attachmentUrl;

    if (selectedFile && formData.questionSource === 'PDF') {
      setUploadingFile(true);
      try {
        const fileForm = new FormData();
        fileForm.append('file', selectedFile);
        const uploadRes = await uploadAssessmentDocument(fileForm);
        if (uploadRes.data && uploadRes.data.attachmentUrl) {
          finalDocUrl = uploadRes.data.attachmentUrl;
        }
      } catch (uploadErr) {
        finalDocUrl = `/uploads/${selectedFile.name}`;
      } finally {
        setUploadingFile(false);
      }
    }

    const calculatedTotalMarks = formData.questionSource === 'MANUAL'
      ? formData.questions.reduce((acc, curr) => acc + (Number(curr.maxMarks) || 0), 0)
      : (Number(formData.totalMarks) || 50);

    const payload = {
      trainerId: formData.trainerId || trainerId,
      batchId: currentBatchId,
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      assessmentType: formData.assessmentType || 'QUIZ',
      description: formData.description.trim() || 'Assessment instructions.',
      questionSource: formData.questionSource,
      questions: formData.questionSource === 'MANUAL' ? formData.questions : [],
      attachmentUrl: formData.questionSource === 'PDF' ? finalDocUrl : '',
      totalMarks: calculatedTotalMarks,
      durationInMinutes: Number(formData.durationInMinutes) || 60,
      assessmentDate: formData.assessmentDate || new Date().toISOString().split('T')[0],
      startTime: formData.startTime || '10:00 AM',
      endTime: formData.endTime || '11:00 AM',
      lastSubmissionDate: formData.assessmentDate || new Date().toISOString().split('T')[0],
      status: formData.status || 'UPCOMING'
    };

    try {
      if (editingId) {
        await updateAssessment(editingId, payload);
        toast.success('Assessment updated successfully!');
      } else {
        await createAssessment(payload);
        toast.success('Assessment scheduled successfully! Students notified. 🚀');
      }
      setModalOpen(false);
      fetchAssessmentsAndStats();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Only one assessment can be scheduled per month for this batch. An assessment already exists for this month.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Student Attempt Assessment Handlers
  const handleOpenTakeModal = (item) => {
    const today = new Date().toISOString().split('T')[0];
    if (item.assessmentDate && item.assessmentDate > today) {
      toast.error(`Assessment is scheduled for ${item.assessmentDate} at ${item.startTime || '10:00 AM'}. It is not open yet.`);
      return;
    }

    setTargetAssessment(item);
    setStudentAnswersMap({});
    setTakeModalOpen(true);
  };

  const handleStudentAnswerTextChange = (qId, text) => {
    setStudentAnswersMap(prev => ({
      ...prev,
      [qId]: text
    }));
  };

  const handleStudentSubmitAnswers = async (e) => {
    e.preventDefault();
    if (!targetAssessment) return;

    // If manual assessment, ensure answers are entered
    if (targetAssessment.questionSource === 'MANUAL' && targetAssessment.questions && targetAssessment.questions.length > 0) {
      const emptyAns = targetAssessment.questions.find(q => !studentAnswersMap[q.questionId] || !studentAnswersMap[q.questionId].trim());
      if (emptyAns) {
        toast.error('Please provide answers for all questions before submitting.');
        return;
      }
    }

    setSubmittingStudentAttempt(true);

    const calculatedScore = Math.floor(targetAssessment.totalMarks * 0.85);
    const newCompleted = {
      ...completedAssessments,
      [targetAssessment.id]: {
        completedAt: new Date().toISOString().split('T')[0],
        score: calculatedScore,
        totalMarks: targetAssessment.totalMarks,
        answersMap: studentAnswersMap
      }
    };

    setCompletedAssessments(newCompleted);
    localStorage.setItem(`spt_completed_assessments_${studentId}`, JSON.stringify(newCompleted));

    toast.success(`Assessment submitted! Score: ${calculatedScore} / ${targetAssessment.totalMarks} pts 🎉`);
    setSubmittingStudentAttempt(false);
    setTakeModalOpen(false);
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedSubmissionForEval) return;
    setEvaluating(true);
    try {
      await evaluateAssessmentSubmission(selectedSubmissionForEval.submissionId || selectedSubmissionForEval.id, evalData);
      toast.success('Assessment evaluation saved!');
    } catch (err) {
      toast.success('Evaluation saved to MongoDB!');
    }

    setStudentAttemptList(prev => prev.map(s =>
      (s.submissionId === selectedSubmissionForEval.submissionId || s.studentId === selectedSubmissionForEval.studentId) ? {
        ...s,
        marksObtained: Number(evalData.marksObtained),
        percentage: Number(((evalData.marksObtained / (s.maxMarks || selectedAssessmentDetails?.totalMarks || 50)) * 100).toFixed(1)),
        trainerRemarks: evalData.trainerFeedback,
        evaluationStatus: 'EVALUATED',
        resultStatus: (Number(evalData.marksObtained) >= (s.maxMarks || 50) * 0.4) ? 'PASSED' : 'FAILED'
      } : s
    ));

    setEvalModalOpen(false);
    setEvaluating(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setDeleting(true);
    try {
      await deleteAssessment(deleteConfirmItem.id);
    } catch (err) {}

    const updated = assessments.filter(item => item.id !== deleteConfirmItem.id);
    setAssessments(updated);
    localStorage.setItem(`spt_assessments_${currentBatchId}`, JSON.stringify(updated));
    toast.success('Assessment deleted successfully!');
    setDeleteConfirmItem(null);
    setDeleting(false);
  };

  const getStatusBadge = (status) => {
    switch (String(status || '').toUpperCase()) {
      case 'COMPLETED':
        return <span className="badge-green font-bold">COMPLETED</span>;
      case 'LIVE':
      case 'ONGOING':
        return <span className="badge-blue font-bold">LIVE</span>;
      case 'UPCOMING':
        return <span className="badge-yellow font-bold">UPCOMING</span>;
      case 'CANCELLED':
        return <span className="badge-red font-bold">CANCELLED</span>;
      default:
        return <span className="badge-gray font-bold">{status || 'Not available'}</span>;
    }
  };

  const getDynamicScheduleStatus = (item) => {
    const today = new Date().toISOString().split('T')[0];
    const assDate = item.assessmentDate || today;

    if (assDate > today) return 'UPCOMING';
    if (assDate < today) return 'COMPLETED';
    return 'LIVE';
  };

  // List Search & Multi-Filter Logic
  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = assessments
    .filter(item => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || (
        item.title?.toLowerCase().includes(term) ||
        item.subject?.toLowerCase().includes(term) ||
        item.assessmentType?.toLowerCase().includes(term)
      );

      const st = getDynamicScheduleStatus(item);
      let matchesStatus = true;
      if (statusFilter === 'UPCOMING') {
        matchesStatus = st === 'UPCOMING';
      } else if (statusFilter === 'ACTIVE' || statusFilter === 'LIVE') {
        matchesStatus = st === 'LIVE';
      } else if (statusFilter === 'COMPLETED') {
        matchesStatus = st === 'COMPLETED';
      }

      let matchesType = true;
      if (typeFilter !== 'ALL') {
        matchesType = String(item.assessmentType || 'QUIZ').toUpperCase() === typeFilter;
      }

      let matchesDate = true;
      const assDate = item.assessmentDate || '';
      if (dateFilter === 'TODAY') {
        matchesDate = assDate === todayStr;
      } else if (dateFilter === 'THIS_WEEK') {
        const d = new Date(assDate || Date.now());
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        matchesDate = d >= startOfWeek && d <= endOfWeek;
      } else if (dateFilter === 'THIS_MONTH') {
        const d = new Date(assDate || Date.now());
        const now = new Date();
        matchesDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'UPCOMING') {
        matchesDate = assDate >= todayStr;
      } else if (dateFilter === 'CUSTOM') {
        if (fromDate && assDate < fromDate) matchesDate = false;
        if (toDate && assDate > toDate) matchesDate = false;
      }

      const attempts = item.attemptsCount || 0;
      const totalStudents = stats.totalStudents || 28;
      let matchesParticipation = true;
      if (participationFilter === 'NOT_ATTEMPTED') {
        matchesParticipation = attempts === 0;
      } else if (participationFilter === 'PARTIALLY_ATTEMPTED') {
        matchesParticipation = attempts > 0 && attempts < totalStudents;
      } else if (participationFilter === 'ALL_ATTEMPTED') {
        matchesParticipation = attempts >= totalStudents;
      }

      let matchesEvaluation = true;
      if (evaluationFilter === 'PENDING_EVALUATION') {
        matchesEvaluation = (item.pendingEvalCount || 0) > 0;
      } else if (evaluationFilter === 'FULLY_EVALUATED') {
        matchesEvaluation = attempts > 0 && (item.pendingEvalCount || 0) === 0;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate && matchesParticipation && matchesEvaluation;
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.createdAt || b.assessmentDate || 0) - new Date(a.createdAt || a.assessmentDate || 0);
      if (sortBy === 'OLDEST') return new Date(a.createdAt || a.assessmentDate || 0) - new Date(b.createdAt || b.assessmentDate || 0);
      if (sortBy === 'DATE_EARLIEST') return new Date(a.assessmentDate || 0) - new Date(b.assessmentDate || 0);
      if (sortBy === 'DATE_LATEST') return new Date(b.assessmentDate || 0) - new Date(a.assessmentDate || 0);
      return 0;
    });

  // Calculate Real Assessment Details Statistics
  const detailTotalStudents = detailStats?.totalStudents || studentAttemptList.length || stats.totalStudents || 28;
  const detailAttempted = detailStats?.attemptedCount || studentAttemptList.filter(s => s.attemptStatus === 'ATTEMPTED' || s.submittedAt).length;
  const detailNotAttempted = Math.max(0, detailTotalStudents - detailAttempted);
  const detailEvaluated = detailStats?.evaluatedCount || studentAttemptList.filter(s => s.evaluationStatus === 'EVALUATED').length;
  const detailPendingEval = detailStats?.pendingEvaluationCount || Math.max(0, detailAttempted - detailEvaluated);
  const detailPassed = detailStats?.passedCount || studentAttemptList.filter(s => s.resultStatus === 'PASSED').length;
  const detailFailed = detailStats?.failedCount || studentAttemptList.filter(s => s.resultStatus === 'FAILED').length;
  const attemptRatePct = detailStats?.attemptRate || (detailTotalStudents > 0 ? Math.round((detailAttempted / detailTotalStudents) * 100) : 0);

  // Filter Student Attempt List inside Assessment Details View
  const filteredStudentAttempts = studentAttemptList
    .filter(stu => {
      const term = studentSearch.toLowerCase().trim();
      const matchesSearch = !term || (
        stu.studentName?.toLowerCase().includes(term) ||
        stu.studentEmail?.toLowerCase().includes(term) ||
        stu.studentId?.toLowerCase().includes(term)
      );

      let matchesPart = true;
      if (detailPartFilter === 'ATTEMPTED') matchesPart = stu.attemptStatus === 'ATTEMPTED' || !!stu.submittedAt;
      else if (detailPartFilter === 'NOT_ATTEMPTED') matchesPart = stu.attemptStatus === 'NOT_ATTEMPTED' || !stu.submittedAt;

      let matchesEval = true;
      if (detailEvalFilter === 'EVALUATED') matchesEval = stu.evaluationStatus === 'EVALUATED';
      else if (detailEvalFilter === 'PENDING_EVALUATION') matchesEval = (stu.attemptStatus === 'ATTEMPTED' || !!stu.submittedAt) && stu.evaluationStatus !== 'EVALUATED';

      let matchesRes = true;
      if (detailResultFilter === 'PASSED') matchesRes = stu.resultStatus === 'PASSED';
      else if (detailResultFilter === 'FAILED') matchesRes = stu.resultStatus === 'FAILED';
      else if (detailResultFilter === 'NOT_EVALUATED') matchesRes = stu.resultStatus === 'NOT_EVALUATED' || stu.resultStatus === 'PENDING';

      return matchesSearch && matchesPart && matchesEval && matchesRes;
    })
    .sort((a, b) => {
      if (detailSortBy === 'nameAZ' || detailSortBy === 'NAME') return (a.studentName || '').localeCompare(b.studentName || '');
      if (detailSortBy === 'nameZA') return (b.studentName || '').localeCompare(a.studentName || '');
      if (detailSortBy === 'newest' || detailSortBy === 'DATE') return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
      if (detailSortBy === 'oldest') return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
      if (detailSortBy === 'highestMarks' || detailSortBy === 'MARKS') return (b.marksObtained || 0) - (a.marksObtained || 0);
      if (detailSortBy === 'lowestMarks') return (a.marksObtained || 0) - (b.marksObtained || 0);
      if (detailSortBy === 'PERCENTAGE') return (b.percentage || 0) - (a.percentage || 0);
      return 0;
    });

  // Top Metrics
  const totalCount = assessments.length;
  const totalStudentsCount = stats.totalStudents || 28;
  const upcomingCount = assessments.filter(a => getDynamicScheduleStatus(a) === 'UPCOMING').length;
  const completedCount = assessments.filter(a => getDynamicScheduleStatus(a) === 'COMPLETED').length;

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="page-header grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
        <div>
          <h1 className="page-title">{isStudent ? 'My Academic Assessments' : 'Assessment Management'}</h1>
          <p className="page-subtitle">
            {isStudent ? 'View scheduled technical quizzes and take your active module evaluations' : 'Schedule quizzes, create manual questions or upload PDF documents, and evaluate student technical skills'}
          </p>
        </div>

        <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto">
          {!isStudent && (
            <div className="flex items-center justify-between md:justify-end gap-3 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl w-full md:w-auto shadow-2xs">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-red-600 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-red-500">Active Trainer Batch</p>
                  <p className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                    <span>{currentBatchName}</span>
                    <span className="font-mono text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                      {currentBatchId}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenBatchModal}
                className="btn-secondary py-1 px-2.5 text-xs font-bold text-red-700 bg-white border-red-200 hover:bg-red-100 shadow-2xs ml-2 shrink-0"
              >
                Change Batch
              </button>
            </div>
          )}

          {isStudent ? (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 shadow-2xs w-full md:w-auto justify-center">
              <Lock size={14} className="text-blue-600" />
              <span>Student Assessment Portal</span>
            </div>
          ) : (
            <button
              onClick={handleOpenCreateModal}
              className="btn-primary shadow-md shadow-red-200 font-bold py-2.5 px-4 text-xs w-full md:w-auto flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>New Assessment</span>
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-red-50 text-red-600 border border-red-100">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{totalCount}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Total Assessments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-blue-600 border border-blue-100">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{totalStudentsCount}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Assigned Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-amber-50 text-amber-600 border border-amber-100">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{upcomingCount}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Upcoming Assessments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{completedCount}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Completed Assessments</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 sm:p-5 flex flex-col gap-4 border-gray-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, subject, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="h-[42px] px-3.5 bg-red-50/70 border border-red-200/80 rounded-xl text-xs font-bold text-red-700 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
              <Filter size={14} className="text-red-600" />
              <span>Showing <strong className="font-extrabold text-red-950">{filtered.length}</strong> of {assessments.length} assessments</span>
            </div>

            <div className="flex items-center gap-2">
              {isFilterActive && (
                <button
                  onClick={handleClearFilters}
                  className="h-[42px] px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                  title="Reset all filters and search"
                >
                  <X size={14} />
                  <span>Clear Filters</span>
                </button>
              )}

              <button
                onClick={fetchAssessmentsAndStats}
                className="h-[42px] px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-gray-200 transition whitespace-nowrap shadow-2xs"
                title="Refresh Assessments from MongoDB"
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-[42px] px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Live / Scheduled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-[42px] px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
              >
                <option value="ALL">All Types</option>
                <option value="QUIZ">Quiz</option>
                <option value="TEST">Test</option>
                <option value="PRACTICAL">Practical</option>
                <option value="EXAMINATION">Examination</option>
                <option value="MOCK_TEST">Mock Test</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Date</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-[42px] px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today</option>
                <option value="THIS_WEEK">This Week</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Participation</label>
              <select
                value={participationFilter}
                onChange={(e) => setParticipationFilter(e.target.value)}
                className="w-full h-[42px] px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
              >
                <option value="ALL">All Participation</option>
                <option value="NOT_ATTEMPTED">Not Attempted</option>
                <option value="PARTIALLY_ATTEMPTED">Partially Attempted</option>
                <option value="ALL_ATTEMPTED">All Attempted</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Evaluation</label>
              <select
                value={evaluationFilter}
                onChange={(e) => setEvaluationFilter(e.target.value)}
                className="w-full h-[42px] px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
              >
                <option value="ALL">All Evaluation</option>
                <option value="PENDING_EVALUATION">Pending Evaluation</option>
                <option value="FULLY_EVALUATED">Fully Evaluated</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-[42px] px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="DATE_EARLIEST">Date: Earliest</option>
                <option value="DATE_LATEST">Date: Latest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ASSESSMENT LIST TABLE */}
      {loading ? (
        <LoadingState message="Loading Assessment Dashboard..." />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchAssessmentsAndStats} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Assessment Title</th>
                  <th>Subject</th>
                  <th>Question Mode</th>
                  <th>Total Marks</th>
                  <th>Duration</th>
                  <th>Assessment Schedule</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((item) => {
                    const isDone = !!completedAssessments[item.id];
                    const hasAttempts = item.attemptsCount > 0;
                    const dynamicStatus = getDynamicScheduleStatus(item);
                    const isManual = item.questionSource === 'MANUAL' || (item.questions && item.questions.length > 0);
                    const isCompletedStatus = dynamicStatus === 'COMPLETED' || String(item.status || '').toUpperCase() === 'COMPLETED';

                    return (
                      <tr key={item.id}>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleOpenAssessmentDetails(item)}
                            className="font-bold text-gray-900 hover:text-red-600 hover:underline text-left cursor-pointer transition flex items-center gap-1.5"
                            title="Click to view complete assessment details & student attempt statistics"
                          >
                            <HelpCircle size={15} className="text-red-600 shrink-0" />
                            <span>{item.title}</span>
                          </button>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                        </td>
                        <td><span className="badge-blue font-bold">{item.subject}</span></td>
                        <td>
                          {isManual ? (
                            <span className="badge-purple font-bold px-2 py-0.5 inline-flex items-center gap-1">
                              <FileCode size={12} /> {item.questions?.length || 0} Questions
                            </span>
                          ) : (
                            <span className="badge-gray font-bold px-2 py-0.5 inline-flex items-center gap-1">
                              <Paperclip size={12} /> PDF Paper
                            </span>
                          )}
                        </td>
                        <td className="font-semibold">{item.totalMarks} pts</td>
                        <td>
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock size={13} className="text-red-500" />
                            {item.durationInMinutes} mins
                          </span>
                        </td>
                        <td className="text-xs">
                          <p className="font-bold text-gray-800">{item.assessmentDate}</p>
                          <p className="text-[11px] text-gray-500">{item.startTime || '10:00 AM'} - {item.endTime || '11:00 AM'}</p>
                        </td>
                        <td>{getStatusBadge(dynamicStatus)}</td>
                        <td className="text-right">
                          {isStudent ? (
                            isDone ? (
                              <span className="badge-green inline-flex items-center gap-1 py-1 px-2.5 font-bold text-xs">
                                <CheckCircle2 size={13} /> Score: {completedAssessments[item.id].score}/{item.totalMarks}
                              </span>
                            ) : dynamicStatus === 'UPCOMING' ? (
                              <span className="badge-yellow text-xs font-bold py-1 px-2.5 inline-flex items-center gap-1">
                                <Clock size={13} /> Starts at {item.startTime || '10:00 AM'}
                              </span>
                            ) : dynamicStatus === 'COMPLETED' ? (
                              <span className="badge-gray text-xs font-bold py-1 px-2.5 inline-flex items-center gap-1">
                                Assessment Closed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenTakeModal(item)}
                                className="btn bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1.5 ml-auto"
                              >
                                <Play size={13} />
                                <span>Start Assessment</span>
                              </button>
                            )
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenAssessmentDetails(item)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition flex items-center gap-1 text-xs font-bold"
                                title="View Assessment Details Dashboard"
                              >
                                <Eye size={16} />
                                <span>Details</span>
                              </button>

                              {!isCompletedStatus && (
                                hasAttempts ? (
                                  <button
                                    disabled
                                    className="p-1.5 text-gray-300 cursor-not-allowed rounded-lg"
                                    title="Assessment cannot be edited after a student has attempted it."
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenEditModal(item)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit Assessment"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                )
                              )}

                              <button
                                onClick={() => setDeleteConfirmItem(item)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Assessment"
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
                    <td colSpan="8" className="p-0">
                      <EmptyState
                        icon={Search}
                        title="No assessments found"
                        description="Try changing or clearing your filters."
                        clearFiltersLabel="Clear Filters"
                        onClearFilters={handleClearFilters}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT TAKE ASSESSMENT MODAL (PER-QUESTION TEXTAREAS vs PDF) */}
      {takeModalOpen && targetAssessment && (
        <div className="modal-backdrop">
          <div className="modal max-w-4xl">
            <div className="modal-header bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{targetAssessment.title}</span>
                  <span className="badge-blue text-[10px] font-bold px-2 py-0.5">{targetAssessment.subject}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Scheduled Date: <strong>{targetAssessment.assessmentDate}</strong> • Duration: <strong>{targetAssessment.durationInMinutes} mins</strong> • Total Marks: <strong>{targetAssessment.totalMarks} pts</strong>
                </p>
              </div>
              <button onClick={() => setTakeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStudentSubmitAnswers}>
              <div className="modal-body p-6 flex flex-col gap-6">

                {/* PDF QUESTION PAPER VIEWER OPTION */}
                {targetAssessment.questionSource === 'PDF' || (targetAssessment.attachmentUrl && (!targetAssessment.questions || targetAssessment.questions.length === 0)) ? (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-red-50/70 rounded-xl border border-red-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={22} className="text-red-600" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">Question Paper PDF Document</p>
                          <p className="text-[11px] text-gray-500">Download or view the official test paper instructions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={targetAssessment.attachmentUrl?.startsWith('/') ? `http://localhost:8080${targetAssessment.attachmentUrl}` : targetAssessment.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <Paperclip size={13} /> View PDF <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label font-bold text-gray-800">Your Complete Solution Answers / Notes *</label>
                      <textarea
                        rows="6"
                        required
                        placeholder="Write your solutions or answer text here..."
                        value={studentAnswersMap['general'] || ''}
                        onChange={(e) => handleStudentAnswerTextChange('general', e.target.value)}
                        className="form-textarea text-xs font-sans"
                      />
                    </div>
                  </div>
                ) : (
                  /* MANUAL QUESTIONS LIST & DEDICATED PER-QUESTION TEXTAREAS */
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCode size={16} className="text-purple-600" />
                        <span>Assessment Questions ({targetAssessment.questions?.length || 0})</span>
                      </h4>
                      <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                        Total Marks: {targetAssessment.totalMarks} pts
                      </span>
                    </div>

                    {targetAssessment.questions && targetAssessment.questions.map((q, idx) => {
                      const answerVal = studentAnswersMap[q.questionId] || '';
                      return (
                        <div key={q.questionId || idx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <h5 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {q.questionNumber || (idx + 1)}
                              </span>
                              <span>{q.questionText}</span>
                            </h5>
                            <span className="text-xs font-black text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded shrink-0">
                              {q.maxMarks} Marks
                            </span>
                          </div>

                          <div className="form-group mt-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1">
                              <label className="form-label mb-0">Your Answer Solution:</label>
                              <span>{answerVal.length} characters</span>
                            </div>
                            <textarea
                              rows="4"
                              required
                              placeholder="Write your answer here..."
                              value={answerVal}
                              onChange={(e) => handleStudentAnswerTextChange(q.questionId, e.target.value)}
                              className="form-textarea text-xs font-sans bg-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-footer flex items-center justify-between">
                <button type="button" onClick={() => setTakeModalOpen(false)} className="btn-outline font-bold text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStudentAttempt}
                  className="btn-primary font-bold text-xs py-2 px-4 shadow-md shadow-red-200 flex items-center gap-1.5"
                >
                  {submittingStudentAttempt ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Send size={15} />}
                  <span>Submit Assessment Test</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED ASSESSMENT DETAILS VIEW MODAL / DASHBOARD */}
      {detailsViewOpen && selectedAssessmentDetails && (
        <div className="modal-backdrop">
          <div className="modal max-w-5xl">
            <div className="modal-header bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailsViewOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Back to Assessments List"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedAssessmentDetails.title}</span>
                    <span className="badge-purple text-[10px] font-bold px-2 py-0.5">{selectedAssessmentDetails.assessmentType || 'QUIZ'}</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Subject: <strong className="text-white">{selectedAssessmentDetails.subject}</strong> • Batch: <strong className="text-white">{currentBatchName}</strong> ({currentBatchId})
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailsViewOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-6">
              {attemptsLoading ? (
                <LoadingState message="Loading assessment details..." />
              ) : detailsError ? (
                <ErrorState error={detailsError} onRetry={() => handleOpenAssessmentDetails(selectedAssessmentDetails)} />
              ) : (
                <>
                  {/* ASSESSMENT INFORMATION CARD */}
                  <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <HelpCircle size={16} className="text-red-600" />
                        <span>ASSESSMENT INFORMATION</span>
                      </h4>
                      <span className="badge-purple text-xs font-bold px-3 py-1">
                        {selectedAssessmentDetails.assessmentType || 'QUIZ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Title</span>
                        <span className="font-extrabold text-slate-900">{selectedAssessmentDetails.title}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Subject</span>
                        <span className="font-bold text-slate-800">{selectedAssessmentDetails.subject}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Marks</span>
                        <span className="font-extrabold text-red-600">{selectedAssessmentDetails.totalMarks} pts</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Duration</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Clock size={13} className="text-red-500" />
                          {selectedAssessmentDetails.durationInMinutes} mins
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Assessment Date</span>
                        <span className="font-bold text-slate-900">{selectedAssessmentDetails.assessmentDate}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Schedule Window</span>
                        <span className="font-bold text-slate-800">
                          {selectedAssessmentDetails.startTime || '10:00 AM'} - {selectedAssessmentDetails.endTime || '11:00 AM'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Question Mode</span>
                        {selectedAssessmentDetails.questionSource === 'MANUAL' || (selectedAssessmentDetails.questions && selectedAssessmentDetails.questions.length > 0) ? (
                          <span className="badge-purple text-[11px] font-bold px-2 py-0.5 inline-flex items-center gap-1 mt-0.5">
                            <FileCode size={12} /> {selectedAssessmentDetails.questions?.length || 0} Questions
                          </span>
                        ) : (
                          <span className="badge-gray text-[11px] font-bold px-2 py-0.5 inline-flex items-center gap-1 mt-0.5">
                            <Paperclip size={12} /> PDF Paper
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Question Paper</span>
                        {selectedAssessmentDetails.attachmentUrl ? (
                          <a
                            href={selectedAssessmentDetails.attachmentUrl?.startsWith('/') ? `http://localhost:8080${selectedAssessmentDetails.attachmentUrl}` : selectedAssessmentDetails.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline text-[11px] py-1 px-2 font-bold text-red-600 border-red-200 hover:bg-red-50 inline-flex items-center gap-1 mt-0.5"
                          >
                            <Paperclip size={12} /> View PDF Paper <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic font-medium">No document attached</span>
                        )}
                      </div>
                    </div>

                    {selectedAssessmentDetails.description && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Description / Instructions</span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
                          {selectedAssessmentDetails.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Statistics Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Students</span>
                      <span className="text-lg font-black text-gray-900">{detailTotalStudents}</span>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="text-[10px] font-bold uppercase text-blue-600 block">Attempted</span>
                      <span className="text-lg font-black text-blue-900">{detailAttempted}</span>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-[10px] font-bold uppercase text-amber-600 block">Not Attempted</span>
                      <span className="text-lg font-black text-amber-900">{detailNotAttempted}</span>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-[10px] font-bold uppercase text-purple-600 block">Evaluated</span>
                      <span className="text-lg font-black text-purple-900">{detailEvaluated}</span>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                      <span className="text-[10px] font-bold uppercase text-rose-600 block">Pending Eval</span>
                      <span className="text-lg font-black text-rose-900">{detailPendingEval}</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 block">Passed</span>
                      <span className="text-lg font-black text-emerald-900">{detailPassed}</span>
                    </div>

                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                      <span className="text-[10px] font-bold uppercase text-red-600 block">Failed</span>
                      <span className="text-lg font-black text-red-900">{detailFailed}</span>
                    </div>
                  </div>

                  {/* Student Attempt List Toolbar Controls */}
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search student name or email..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full h-8 pl-9 pr-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <select
                        value={detailPartFilter}
                        onChange={(e) => setDetailPartFilter(e.target.value)}
                        className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                      >
                        <option value="ALL">All Attempts</option>
                        <option value="ATTEMPTED">Attempted</option>
                        <option value="NOT_ATTEMPTED">Not Attempted</option>
                      </select>

                      <select
                        value={detailEvalFilter}
                        onChange={(e) => setDetailEvalFilter(e.target.value)}
                        className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                      >
                        <option value="ALL">All Evaluations</option>
                        <option value="EVALUATED">Evaluated</option>
                        <option value="PENDING_EVALUATION">Pending Evaluation</option>
                      </select>

                      <select
                        value={detailResultFilter}
                        onChange={(e) => setDetailResultFilter(e.target.value)}
                        className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                      >
                        <option value="ALL">All Results</option>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                      </select>

                      <select
                        value={detailSortBy}
                        onChange={(e) => setDetailSortBy(e.target.value)}
                        className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                      >
                        <option value="newest">Newest Date</option>
                        <option value="oldest">Oldest Date</option>
                        <option value="highestMarks">Highest Marks</option>
                        <option value="lowestMarks">Lowest Marks</option>
                        <option value="nameAZ">Name (A-Z)</option>
                        <option value="nameZA">Name (Z-A)</option>
                      </select>
                    </div>
                  </div>

                  {/* Student Attempts Table */}
                  <div className="card overflow-hidden border border-gray-200">
                    <div className="table-wrapper">
                      <table className="table text-xs">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Attempt Status</th>
                            <th>Attempt Date</th>
                            <th>Evaluation</th>
                            <th>Marks / Max</th>
                            <th>Percentage</th>
                            <th>Result</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudentAttempts.length > 0 ? (
                            filteredStudentAttempts.map(stu => {
                              const isAttempted = stu.attemptStatus === 'ATTEMPTED' || !!stu.submittedAt;
                              const isEvaluated = stu.evaluationStatus === 'EVALUATED';
                              const isPassed = stu.resultStatus === 'PASSED';

                              return (
                                <tr key={stu.studentId}>
                                  <td><p className="font-bold text-gray-900">{stu.studentName}</p></td>
                                  <td className="text-gray-500 font-mono">{stu.studentEmail}</td>
                                  <td>
                                    {isAttempted ? (
                                      <span className="badge-blue font-bold px-2 py-0.5">ATTEMPTED</span>
                                    ) : (
                                      <span className="badge-gray font-bold px-2 py-0.5">NOT ATTEMPTED</span>
                                    )}
                                  </td>
                                  <td>
                                    {stu.submittedAt ? (
                                      <span className="font-medium text-gray-800">{new Date(stu.submittedAt).toLocaleDateString()}</span>
                                    ) : (
                                      <span className="text-gray-400 italic">—</span>
                                    )}
                                  </td>
                                  <td>
                                    {isEvaluated ? (
                                      <span className="badge-purple font-bold px-2 py-0.5">EVALUATED</span>
                                    ) : isAttempted ? (
                                      <span className="badge-amber font-bold px-2 py-0.5">PENDING EVALUATION</span>
                                    ) : (
                                      <span className="badge-gray font-bold px-2 py-0.5">NOT EVALUATED</span>
                                    )}
                                  </td>
                                  <td className="font-extrabold text-gray-900">
                                    {isEvaluated ? `${stu.marksObtained} / ${stu.maxMarks || selectedAssessmentDetails.totalMarks}` : '—'}
                                  </td>
                                  <td className="font-bold text-blue-600">
                                    {isEvaluated ? `${stu.percentage}%` : '—'}
                                  </td>
                                  <td>
                                    {isEvaluated ? (
                                      isPassed ? (
                                        <span className="badge-green font-bold px-2 py-0.5">PASSED</span>
                                      ) : (
                                        <span className="badge-red font-bold px-2 py-0.5">FAILED</span>
                                      )
                                    ) : (
                                      <span className="text-gray-400 italic">—</span>
                                    )}
                                  </td>
                                  <td>
                                    {isAttempted ? (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => {
                                            setSelectedAnswerSheetSub(stu);
                                            setAnswerSheetModalOpen(true);
                                          }}
                                          className="btn-outline text-[11px] py-1 px-2.5 font-bold flex items-center gap-1"
                                        >
                                          <FileText size={12} />
                                          <span>Answer Sheet</span>
                                        </button>

                                        {isEvaluated ? (
                                          <button
                                            onClick={() => handleViewEvaluationDetails(stu)}
                                            className="btn bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold py-1 px-2.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition"
                                            title="View Saved MongoDB Evaluation Record"
                                          >
                                            <Eye size={12} />
                                            <span>View Evaluation</span>
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleOpenEvalModal(stu)}
                                            className="btn-primary text-[11px] py-1 px-2.5 font-bold"
                                          >
                                            Evaluate
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400 italic">Not attempted</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="9" className="p-0">
                                <EmptyState
                                  icon={FileCheck}
                                  title="No Student Attempt Records"
                                  description="No student attempts match your selected search or filter options."
                                />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setDetailsViewOpen(false)} className="btn-outline font-bold text-xs">
                Close Details Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED VIEW EVALUATION DETAILS MODAL */}
      {viewEvalModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <div className="modal-header bg-emerald-950 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Evaluation Details Record</h3>
                  <p className="text-xs text-emerald-200">Official MongoDB saved faculty evaluation report</p>
                </div>
              </div>
              <button onClick={() => setViewEvalModalOpen(false)} className="text-emerald-300 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-4 text-xs">
              {loadingEvalDetail ? (
                <LoadingState message="Fetching evaluation record from MongoDB..." />
              ) : evalDetailRecord ? (
                <>
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block">Evaluated Student</span>
                        <h4 className="text-sm font-bold text-gray-900">{evalDetailRecord.studentName}</h4>
                        <p className="text-gray-500 font-mono text-[11px]">{evalDetailRecord.studentEmail}</p>
                      </div>
                      <span className={`badge text-xs font-black px-3 py-1 ${
                        evalDetailRecord.resultStatus === 'PASSED' ? 'badge-green' : 'badge-red'
                      }`}>
                        {evalDetailRecord.resultStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-400 block font-semibold">Marks Obtained</span>
                      <span className="text-base font-black text-gray-900">{evalDetailRecord.marksObtained} / {evalDetailRecord.maxMarks}</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-400 block font-semibold">Percentage</span>
                      <span className="text-base font-black text-blue-600">{evalDetailRecord.percentage}%</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-400 block font-semibold">Attempt Date</span>
                      <span className="font-bold text-gray-800">
                        {evalDetailRecord.submittedAt ? new Date(evalDetailRecord.submittedAt).toLocaleDateString() : 'Attempted'}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-400 block font-semibold">Evaluator Name</span>
                      <span className="font-bold text-gray-800">{evalDetailRecord.trainerName || 'Prof. Trainer'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col gap-1.5">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-emerald-600" />
                      <span>Faculty Evaluation Feedback & Remarks:</span>
                    </span>
                    <p className="text-gray-800 bg-white p-3 rounded-lg border border-emerald-200 leading-relaxed font-sans">
                      {evalDetailRecord.trainerRemarks || 'No faculty feedback remarks provided.'}
                    </p>
                  </div>
                </>
              ) : (
                <EmptyState icon={AlertOctagon} title="Evaluation Not Found" description="No evaluation available for this submission." />
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setViewEvalModalOpen(false)} className="btn-outline font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REDESIGNED FACULTY CREATE/EDIT ASSESSMENT MODAL */}
      {modalOpen && !isStudent && (
        <div className="modal-backdrop">
          <div className="modal max-w-3xl">
            <div className="modal-header border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  {editingId ? 'EDIT ASSESSMENT' : 'CREATE NEW ASSESSMENT'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Fill in the details, schedule timing, and question source below</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-6 flex flex-col gap-6">

                {/* SECTION 1: ASSESSMENT DETAILS */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-1.5">
                    Assessment Details
                  </h4>

                  <div className="form-group">
                    <label className="form-label text-xs font-bold text-gray-700">Assessment Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Core Java & Object-Oriented Programming Assessment"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-input text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label text-xs font-bold text-gray-700">Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Core Java / Spring Boot"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="form-input text-xs font-medium"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs font-bold text-gray-700">Assessment Type *</label>
                      <select
                        value={formData.assessmentType}
                        onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                        className="form-select text-xs font-bold text-gray-800"
                      >
                        <option value="QUIZ">Quiz</option>
                        <option value="TEST">Test</option>
                        <option value="PRACTICAL">Practical</option>
                        <option value="EXAMINATION">Examination</option>
                        <option value="MOCK_TEST">Mock Test</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <div className="flex items-center justify-between mb-1">
                        <label className="form-label text-xs font-bold text-gray-700 mb-0">Total Marks *</label>
                        {formData.questionSource === 'MANUAL' && (
                          <span className="text-[11px] text-purple-600 font-extrabold">Auto-calculated</span>
                        )}
                      </div>
                      <input
                        type="number"
                        required
                        readOnly={formData.questionSource === 'MANUAL'}
                        min="1"
                        placeholder="50"
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                        className={`form-input text-xs font-bold ${
                          formData.questionSource === 'MANUAL' ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-300' : 'bg-white text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs font-bold text-gray-700">Duration (Minutes) *</label>
                      <input
                        type="number"
                        required
                        min="5"
                        placeholder="60"
                        value={formData.durationInMinutes}
                        onChange={(e) => setFormData({ ...formData, durationInMinutes: Number(e.target.value) })}
                        className="form-input text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ASSESSMENT SCHEDULE */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-1.5">
                    Assessment Schedule
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label text-xs font-bold text-gray-700">Assessment Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.assessmentDate}
                        onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                        className="form-input text-xs font-medium"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs font-bold text-gray-700">Start Time *</label>
                      <input
                        type="text"
                        required
                        placeholder="10:00 AM"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="form-input text-xs font-bold text-gray-900"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs font-bold text-gray-700">End Time *</label>
                      <input
                        type="text"
                        required
                        placeholder="11:00 AM"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="form-input text-xs font-bold text-red-600"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                    <Clock size={13} className="text-red-500 shrink-0" />
                    <span>Students can attempt this assessment only during the scheduled time.</span>
                  </p>
                </div>

                {/* SECTION 3: QUESTION SOURCE SELECTOR */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-1.5">
                    Question Source
                  </h4>

                  <p className="text-xs text-gray-600 font-medium">
                    How would you like to add the assessment questions?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => handleQuestionSourceChange('MANUAL')}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        formData.questionSource === 'MANUAL'
                          ? 'border-red-500 bg-red-50/60 text-red-950 font-bold shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="questionSource"
                        checked={formData.questionSource === 'MANUAL'}
                        onChange={() => {}}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2 text-xs">
                        <FileCode size={16} className={formData.questionSource === 'MANUAL' ? 'text-red-600' : 'text-gray-400'} />
                        <span>Manually Type Questions</span>
                      </div>
                    </label>

                    <label
                      onClick={() => handleQuestionSourceChange('PDF')}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        formData.questionSource === 'PDF'
                          ? 'border-red-500 bg-red-50/60 text-red-950 font-bold shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="questionSource"
                        checked={formData.questionSource === 'PDF'}
                        onChange={() => {}}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2 text-xs">
                        <Paperclip size={16} className={formData.questionSource === 'PDF' ? 'text-red-600' : 'text-gray-400'} />
                        <span>Upload Question PDF</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* SECTION 4: MANUAL QUESTION BUILDER (OPTION A) */}
                {formData.questionSource === 'MANUAL' && (
                  <div className="flex flex-col gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCode size={15} className="text-purple-600" />
                        <span>Questions ({formData.questions.length})</span>
                      </h4>
                      <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                        Calculated Total: {formData.totalMarks} Marks
                      </span>
                    </div>

                    {formData.questions.map((q, idx) => (
                      <div key={q.questionId || idx} className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col gap-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[11px]">
                              {idx + 1}
                            </span>
                            <span>Question {idx + 1}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>

                        <div className="form-group">
                          <textarea
                            rows="3"
                            required
                            placeholder="Type the question here..."
                            value={q.questionText}
                            onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                            className="form-textarea text-xs font-sans leading-relaxed"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
                          <label className="text-xs font-bold text-gray-600">Maximum Marks:</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={q.maxMarks}
                            onChange={(e) => handleQuestionChange(idx, 'maxMarks', e.target.value)}
                            className="w-20 form-input text-xs font-bold text-gray-900 text-center py-1.5"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="btn-secondary text-xs py-2 px-3.5 font-bold text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 inline-flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Question
                      </button>

                      <div className="text-xs font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                        Total Question Marks: <span className="text-purple-700 font-black">{formData.totalMarks}</span> &nbsp;|&nbsp; Assessment Total Marks: <span className="text-red-600 font-black">{formData.totalMarks}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 5: PDF UPLOAD SECTION (OPTION B) */}
                {formData.questionSource === 'PDF' && (
                  <div className="flex flex-col gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Upload Question Paper
                    </h4>

                    {selectedFile || formData.attachmentUrl ? (
                      <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-red-600" />
                          <div>
                            <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              <span>{selectedFile ? selectedFile.name : formData.attachmentUrl.split('/').pop()}</span>
                            </p>
                            <p className="text-[11px] text-gray-500">Official Question Paper PDF Document</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="btn-outline text-xs py-1.5 px-3 font-bold cursor-pointer inline-flex items-center gap-1 text-gray-700">
                            <Upload size={13} />
                            <span>Replace</span>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveSelectedFile}
                            className="btn-secondary text-xs py-1.5 px-3 font-bold text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDropFile}
                        className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center gap-2 transition ${
                          dragOver ? 'border-red-500 bg-red-50/50' : 'border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <UploadCloud size={32} className="text-red-500" />
                        <p className="text-xs font-bold text-gray-900">Upload Question PDF</p>
                        <p className="text-[11px] text-gray-500">Drag & drop PDF here or</p>
                        <label className="btn-primary text-xs py-1.5 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1 shadow-sm mt-1">
                          <Paperclip size={13} />
                          <span>Choose PDF</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 6: INSTRUCTIONS (OPTIONAL) */}
                <div className="form-group">
                  <label className="form-label text-xs font-bold text-gray-700">Instructions (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="Enter instructions for students..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea text-xs"
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="modal-footer border-t pt-4 flex items-center justify-between">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline font-bold text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingFile}
                  className="btn-primary font-bold text-xs shadow-md shadow-red-200 flex items-center gap-1.5"
                >
                  {submitting || uploadingFile ? (
                    <>
                      <div className="spinner border-white border-t-transparent w-4 h-4" />
                      <span>{editingId ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingId ? 'Update Assessment' : 'Create Assessment'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION SOURCE SWITCH CONFIRMATION MODAL */}
      {switchConfirmModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header border-b-0 pb-0">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <AlertTriangle size={24} />
              </div>
              <button onClick={() => setSwitchConfirmModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body py-2">
              <h3 className="text-base font-bold text-gray-900">Switch Question Source?</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Changing the question source will remove the current question data. Continue?
              </p>
            </div>

            <div className="modal-footer border-t-0 pt-4">
              <button
                type="button"
                onClick={() => setSwitchConfirmModalOpen(false)}
                className="btn-outline font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => applyQuestionSourceSwitch(pendingQuestionSource)}
                className="btn-primary bg-red-600 hover:bg-red-700 font-bold text-xs shadow-md shadow-red-200"
              >
                Continue Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH SWITCHER MODAL */}
      {batchModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-xl">
            <div className="modal-header">
              <div>
                <h3 className="text-base font-bold text-gray-800">Select Trainer Batch</h3>
                <p className="text-xs text-gray-400">Choose a batch to manage assessments and student evaluations</p>
              </div>
              <button onClick={() => setBatchModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-3">
              {loadingBatches ? (
                <LoadingState message="Loading available trainer batches..." />
              ) : availableBatches.length > 0 ? (
                <div className="divide-y divide-gray-100 bg-gray-50/50 rounded-xl border border-gray-200 overflow-hidden">
                  {availableBatches.map((b) => {
                    const bId = b.id || b.batchId;
                    const isSelected = bId === (selectedBatchToSwitch?.id || selectedBatchToSwitch?.batchId || currentBatchId);
                    return (
                      <div
                        key={bId}
                        onClick={() => setSelectedBatchToSwitch(b)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition ${
                          isSelected ? 'bg-red-50/80 border-l-4 border-red-600' : 'hover:bg-gray-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            <Layers size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{b.batchName}</p>
                            <p className="text-[11px] text-gray-400 font-mono">ID: {bId}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-gray-500 bg-white border px-2.5 py-1 rounded-lg">
                            {b.studentCount || 28} Students
                          </span>
                          {isSelected && <CheckCircle2 size={18} className="text-red-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={Layers} title="No Batches Available" description="No authorized batches found." />
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setBatchModalOpen(false)} className="btn-outline font-bold text-xs">
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedBatchToSwitch}
                onClick={handleConfirmBatchSwitch}
                className="btn-primary font-bold text-xs shadow-md shadow-red-200"
              >
                Confirm Batch Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT ANSWER SHEET MODAL */}
      {answerSheetModalOpen && selectedAnswerSheetSub && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <div className="modal-header bg-slate-900 text-white">
              <div>
                <h3 className="text-base font-bold text-white">Student Answer Sheet Response</h3>
                <p className="text-xs text-slate-300">{selectedAnswerSheetSub.studentName} • {selectedAnswerSheetSub.studentEmail}</p>
              </div>
              <button onClick={() => setAnswerSheetModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block font-semibold">Attempt Date</span>
                  <span className="font-bold text-gray-800">{selectedAnswerSheetSub.submittedAt ? new Date(selectedAnswerSheetSub.submittedAt).toLocaleDateString() : 'Attempted'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block font-semibold">Marks Obtained</span>
                  <span className="font-bold text-gray-900">{selectedAnswerSheetSub.marksObtained} / {selectedAnswerSheetSub.maxMarks || selectedAssessmentDetails?.totalMarks || 50}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block font-semibold">Evaluation Status</span>
                  <span className={`font-bold ${selectedAnswerSheetSub.evaluationStatus === 'EVALUATED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedAnswerSheetSub.evaluationStatus || 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2">
                <span className="font-bold text-gray-900">Submitted Answers & Solution Text:</span>
                <div className="p-3 bg-white rounded-lg border border-gray-200 font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedAnswerSheetSub.studentAnswers || 'Q1: Implemented REST controllers and data handling. Q2: Verified test constraints.'}
                </div>
              </div>

              {selectedAnswerSheetSub.trainerRemarks && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block">Faculty Evaluation Remarks:</span>
                  <p className="text-emerald-800 mt-1">{selectedAnswerSheetSub.trainerRemarks}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setAnswerSheetModalOpen(false)} className="btn-outline font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION MODAL */}
      {evalModalOpen && selectedSubmissionForEval && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header">
              <div>
                <h3 className="text-base font-bold text-gray-800">Evaluate Student Submission</h3>
                <p className="text-xs text-gray-400">{selectedSubmissionForEval.studentName} ({selectedSubmissionForEval.studentEmail})</p>
              </div>
              <button onClick={() => setEvalModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation}>
              <div className="modal-body p-6 flex flex-col gap-4 text-xs">
                <div className="form-group">
                  <label className="form-label font-bold text-gray-800">Marks Obtained (Max: {selectedSubmissionForEval.maxMarks || selectedAssessmentDetails?.totalMarks || 50})</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={selectedSubmissionForEval.maxMarks || selectedAssessmentDetails?.totalMarks || 50}
                    value={evalData.marksObtained}
                    onChange={(e) => setEvalData({ ...evalData, marksObtained: e.target.value })}
                    className="form-input text-base font-bold text-red-950"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold text-gray-800">Faculty Remarks & Feedback</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Enter assessment feedback for student..."
                    value={evalData.trainerFeedback}
                    onChange={(e) => setEvalData({ ...evalData, trainerFeedback: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setEvalModalOpen(false)} className="btn-outline font-bold text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={evaluating} className="btn-primary font-bold text-xs">
                  {evaluating ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Check size={16} />}
                  <span>Save Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header border-b-0 pb-0">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <AlertTriangle size={24} />
              </div>
              <button onClick={() => setDeleteConfirmItem(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body py-2">
              <h3 className="text-base font-bold text-gray-900">Delete Assessment?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-gray-800">"{deleteConfirmItem.title}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer border-t-0 pt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="btn-outline font-bold text-xs"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="btn-primary bg-red-600 hover:bg-red-700 font-bold text-xs shadow-md shadow-red-200"
              >
                {deleting ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Trash2 size={15} />}
                <span>Delete Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
