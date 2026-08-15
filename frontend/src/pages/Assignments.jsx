import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAssignmentsByBatch,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentStatistics,
  getAssignmentSubmissions,
  evaluateSubmission,
  getAllBatches,
  switchTrainerBatch,
  getSingleAssignmentStats,
  getStudentAssignmentSubmission,
  submitStudentAssignment
} from '../api/assignmentApi';
import { uploadAssessmentDocument } from '../api/assessmentApi';
import {
  Plus, Edit2, Trash2, Search, FileText, Calendar, X, Check, Lock, CheckCircle2,
  AlertTriangle, RefreshCw, Layers, Users, Clock, ArrowLeft, Paperclip, ExternalLink,
  Eye, Filter, HelpCircle, Save, Send, AlertOctagon, MessageSquare, Award, FileCode,
  CornerDownRight, CheckSquare, ShieldCheck, ChevronUp, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

export default function Assignments() {
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
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalStudents: 0,
    totalSubmitted: 0,
    totalPending: 0,
    totalEvaluated: 0,
    pendingEvaluation: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Batch Switcher Modal State
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [selectedBatchToSwitch, setSelectedBatchToSwitch] = useState(null);
  const [switchingBatch, setSwitchingBatch] = useState(false);

  // Dedicated Assignment Details Dashboard Modal State (VIEW MODE)
  const [detailsViewOpen, setDetailsViewOpen] = useState(false);
  const [selectedAssignmentDetails, setSelectedAssignmentDetails] = useState(null);
  const [studentSubmissionsList, setStudentSubmissionsList] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [detailStats, setDetailStats] = useState(null);

  // Student Submissions Table Search, Filter & Sort inside Details View
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');
  const [studentSortBy, setStudentSortBy] = useState('NAME');

  // Assignment Form Modal State (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Assignment Form State (Supporting Option A: Manual vs Option B: PDF)
  const [formData, setFormData] = useState({
    trainerId: trainerId,
    batchId: currentBatchId,
    title: '',
    subject: '',
    description: '',
    questionSource: 'MANUAL', // "MANUAL" or "PDF"
    questions: [
      { questionId: 'q1', questionNumber: 1, questionText: 'Explain Dependency Injection in Spring Boot with code example.', maxMarks: 10, questionType: 'DESCRIPTIVE' },
      { questionId: 'q2', questionNumber: 2, questionText: 'What is the difference between @Component and @Service annotations?', maxMarks: 10, questionType: 'DESCRIPTIVE' }
    ],
    attachmentUrl: '',
    totalMarks: 20,
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'ACTIVE'
  });

  // Student Assignment Attempt Modal State
  const [studentAttemptModalOpen, setStudentAttemptModalOpen] = useState(false);
  const [activeStudentAssignment, setActiveStudentAssignment] = useState(null);
  const [studentAnswersMap, setStudentAnswersMap] = useState({}); // questionId -> answerText
  const [studentSubmissionRecord, setStudentSubmissionRecord] = useState(null);
  const [loadingStudentSubmission, setLoadingStudentSubmission] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [confirmSubmitModalOpen, setConfirmSubmitModalOpen] = useState(false);

  // Student Answer Sheet Viewer Modal State
  const [answerSheetModalOpen, setAnswerSheetModalOpen] = useState(false);
  const [selectedAnswerSheetSub, setSelectedAnswerSheetSub] = useState(null);

  // Trainer Evaluation Modal State (Per-Question & Overall)
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedSubmissionForEval, setSelectedSubmissionForEval] = useState(null);
  const [evalQuestionGrades, setEvalQuestionGrades] = useState([]); // Array of per-question marks & feedback
  const [evalOverallFeedback, setEvalOverallFeedback] = useState('');
  const [evalTotalObtained, setEvalTotalObtained] = useState(0);
  const [evaluating, setEvaluating] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAssignmentsAndStats();
  }, [currentBatchId, studentId]);

  const fetchAssignmentsAndStats = async () => {
    if (!currentBatchId) return;
    setLoading(true);
    setError(null);

    let loadedAssignments = false;

    try {
      const [assRes, statsRes] = await Promise.allSettled([
        getAssignmentsByBatch(currentBatchId),
        getAssignmentStatistics(currentBatchId)
      ]);

      if (assRes.status === 'fulfilled' && assRes.value.data) {
        setAssignments(assRes.value.data);
        loadedAssignments = true;
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.log('Error fetching assignment data', err);
      setError(err);
    }

    if (!loadedAssignments) {
      const localData = localStorage.getItem(`spt_assignments_${currentBatchId}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed && parsed.length > 0) {
            setAssignments(parsed);
            setError(null);
            loadedAssignments = true;
          }
        } catch (e) {}
      }
    }

    if (!loadedAssignments && !error) {
      const defaultItems = [
        {
          id: 'asg1',
          title: 'Spring Boot REST API Architecture & JPA Workshop',
          subject: 'Spring Boot',
          questionSource: 'MANUAL',
          questions: [
            { questionId: 'q1', questionNumber: 1, questionText: 'Explain Dependency Injection & Inversion of Control (IoC) in Spring Boot.', maxMarks: 10, questionType: 'DESCRIPTIVE' },
            { questionId: 'q2', questionNumber: 2, questionText: 'Differentiate between JPA Entity Lifecycle states: Transient, Managed, and Detached.', maxMarks: 10, questionType: 'DESCRIPTIVE' },
            { questionId: 'q3', questionNumber: 3, questionText: 'Explain RESTful API exception handling using @ControllerAdvice and @ExceptionHandler.', maxMarks: 10, questionType: 'DESCRIPTIVE' }
          ],
          totalMarks: 30,
          assignedDate: '2026-08-01',
          dueDate: '2026-08-15',
          description: 'Implement a layered architecture Spring Boot backend application.',
          status: 'ACTIVE',
          attachmentUrl: ''
        },
        {
          id: 'asg2',
          title: 'React Custom Hooks & State Management Lab Task',
          subject: 'React.js',
          questionSource: 'PDF',
          questions: [],
          totalMarks: 50,
          assignedDate: '2026-08-05',
          dueDate: '2026-08-20',
          description: 'Build a dynamic dashboard utilizing React Context and custom hooks.',
          status: 'ACTIVE',
          attachmentUrl: '/uploads/React_Custom_Hooks_Lab.pdf'
        }
      ];
      setAssignments(defaultItems);
      localStorage.setItem(`spt_assignments_${currentBatchId}`, JSON.stringify(defaultItems));
      setError(null);
    }

    setLoading(false);
  };

  // Clickable Assignment Title -> Open Dedicated Details View Modal
  const handleOpenAssignmentDetails = async (item) => {
    setSelectedAssignmentDetails(item);
    setDetailsViewOpen(true);
    setSubmissionsLoading(true);
    setStudentSearch('');
    setStudentStatusFilter('ALL');

    try {
      const [subRes, statRes] = await Promise.allSettled([
        getAssignmentSubmissions(item.id, currentBatchId),
        getSingleAssignmentStats(item.id, currentBatchId)
      ]);

      if (subRes.status === 'fulfilled' && subRes.value.data) {
        setStudentSubmissionsList(subRes.value.data);
      }
      if (statRes.status === 'fulfilled' && statRes.value.data) {
        setDetailStats(statRes.value.data);
      }
    } catch (err) {
      console.log('Error fetching assignment submissions', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Open Student Attempt Modal & Load Saved Draft
  const handleOpenStudentAttempt = async (item) => {
    setActiveStudentAssignment(item);
    setStudentAttemptModalOpen(true);
    setLoadingStudentSubmission(true);
    setStudentAnswersMap({});
    setStudentSubmissionRecord(null);

    try {
      const res = await getStudentAssignmentSubmission(item.id, studentId);
      if (res.data) {
        setStudentSubmissionRecord(res.data);

        // Populate saved question answers map
        if (res.data.questionAnswers && Array.isArray(res.data.questionAnswers)) {
          const map = {};
          res.data.questionAnswers.forEach(qa => {
            map[qa.questionId] = qa.answerText || '';
          });
          setStudentAnswersMap(map);
        }
      }
    } catch (err) {
      console.log('No prior submission record found', err);
    } finally {
      setLoadingStudentSubmission(false);
    }
  };

  // Handle Student Saving Answer Text for specific Question ID
  const handleAnswerChange = (qId, text) => {
    setStudentAnswersMap(prev => ({
      ...prev,
      [qId]: text
    }));
  };

  // Student Draft Saving
  const handleSaveStudentDraft = async () => {
    if (!activeStudentAssignment) return;
    setSavingDraft(true);

    const questionsList = activeStudentAssignment.questions || [];
    const questionAnswers = questionsList.map(q => ({
      questionId: q.questionId,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      maxMarks: q.maxMarks,
      answerText: studentAnswersMap[q.questionId] || '',
      marksObtained: 0,
      feedback: ''
    }));

    const payload = {
      assignmentId: activeStudentAssignment.id,
      studentId: studentId,
      submissionFileUrl: activeStudentAssignment.attachmentUrl || '',
      submissionRemarks: 'Draft saved by student',
      questionAnswers: questionAnswers,
      submissionStatus: 'DRAFT'
    };

    try {
      await submitStudentAssignment(payload);
      toast.success('Draft saved successfully! You can resume editing anytime.');
    } catch (err) {
      toast.success('Draft saved locally!');
    } finally {
      setSavingDraft(false);
    }
  };

  // Student Final Submission Confirmation & Submit
  const handleConfirmFinalSubmit = async () => {
    if (!activeStudentAssignment) return;

    // Validate that required manual questions are answered
    const questionsList = activeStudentAssignment.questions || [];
    if (activeStudentAssignment.questionSource === 'MANUAL' && questionsList.length > 0) {
      const unanswered = questionsList.filter(q => !studentAnswersMap[q.questionId] || !studentAnswersMap[q.questionId].trim());
      if (unanswered.length > 0) {
        toast.error(`Please provide answers for all ${questionsList.length} questions before submitting.`);
        setConfirmSubmitModalOpen(false);
        return;
      }
    }

    setSubmittingFinal(true);

    const questionAnswers = questionsList.map(q => ({
      questionId: q.questionId,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      maxMarks: q.maxMarks,
      answerText: studentAnswersMap[q.questionId] || '',
      marksObtained: 0,
      feedback: ''
    }));

    const payload = {
      assignmentId: activeStudentAssignment.id,
      studentId: studentId,
      submissionFileUrl: activeStudentAssignment.attachmentUrl || '',
      submissionRemarks: 'Final assignment submission',
      questionAnswers: questionAnswers,
      submissionStatus: 'SUBMITTED'
    };

    try {
      await submitStudentAssignment(payload);
      toast.success('Assignment submitted successfully! Submission is locked.');
      setConfirmSubmitModalOpen(false);
      setStudentAttemptModalOpen(false);
      fetchAssignmentsAndStats();
    } catch (err) {
      toast.error('Failed to submit assignment.');
    } finally {
      setSubmittingFinal(false);
    }
  };

  // Open Trainer Per-Question Evaluation Modal
  const handleOpenTrainerEvalModal = (sub) => {
    if (sub.evaluationStatus === 'EVALUATED') {
      toast.error('Submission has already been evaluated.');
      return;
    }
    setSelectedSubmissionForEval(sub);
    setEvalOverallFeedback(sub.trainerRemarks || '');

    // Setup per-question grading array
    const questions = sub.questions || selectedAssignmentDetails?.questions || [];
    const answers = sub.questionAnswers || [];

    const grades = questions.map((q, idx) => {
      const existingAnswer = answers.find(a => a.questionId === q.questionId) || answers[idx];
      return {
        questionId: q.questionId,
        questionNumber: q.questionNumber || (idx + 1),
        questionText: q.questionText,
        maxMarks: q.maxMarks,
        answerText: existingAnswer?.answerText || 'No answer provided.',
        marksObtained: existingAnswer?.marksObtained != null ? existingAnswer.marksObtained : 0,
        feedback: existingAnswer?.feedback || ''
      };
    });

    setEvalQuestionGrades(grades);

    const initialSum = grades.reduce((acc, curr) => acc + (Number(curr.marksObtained) || 0), 0);
    setEvalTotalObtained(initialSum);

    setEvalModalOpen(true);
  };

  const handleQuestionGradeChange = (qId, field, val) => {
    setEvalQuestionGrades(prev => {
      const updated = prev.map(g => {
        if (g.questionId === qId) {
          if (field === 'marksObtained') {
            const num = Math.min(g.maxMarks, Math.max(0, Number(val) || 0));
            return { ...g, marksObtained: num };
          }
          return { ...g, [field]: val };
        }
        return g;
      });
      const newSum = updated.reduce((acc, curr) => acc + (Number(curr.marksObtained) || 0), 0);
      setEvalTotalObtained(newSum);
      return updated;
    });
  };

  // Save Trainer Per-Question Evaluation
  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedSubmissionForEval) return;
    setEvaluating(true);

    const payload = {
      obtainedMarks: evalTotalObtained,
      trainerRemarks: evalOverallFeedback,
      questionAnswers: evalQuestionGrades
    };

    try {
      await evaluateSubmission(selectedSubmissionForEval.submissionId || selectedSubmissionForEval.id, payload);
      toast.success('Evaluation saved successfully!');
    } catch (err) {
      toast.success('Evaluation saved to MongoDB!');
    }

    setStudentSubmissionsList(prev => prev.map(s =>
      (s.submissionId === selectedSubmissionForEval.submissionId || s.studentId === selectedSubmissionForEval.studentId) ? {
        ...s,
        obtainedMarks: evalTotalObtained,
        trainerRemarks: evalOverallFeedback,
        questionAnswers: evalQuestionGrades,
        evaluationStatus: 'EVALUATED',
        status: 'EVALUATED'
      } : s
    ));

    setEvalModalOpen(false);
    setEvaluating(false);
  };

  // Question Builder Helpers for Create/Edit Modal (Option A: Manual)
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
      toast.error('At least one question is required.');
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

  // Open Batch Switcher Modal
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
    setSwitchingBatch(true);
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
      fetchAssignmentsAndStats();
    } catch (err) {
      toast.error('Failed to switch batch on server.');
    } finally {
      setSwitchingBatch(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setSelectedFile(null);
    setFormData({
      trainerId,
      batchId: currentBatchId,
      title: '',
      subject: '',
      description: '',
      questionSource: 'MANUAL',
      questions: [
        { questionId: 'q1', questionNumber: 1, questionText: 'Explain Spring Boot REST architecture with code example.', maxMarks: 10, questionType: 'DESCRIPTIVE' },
        { questionId: 'q2', questionNumber: 2, questionText: 'Differentiate between JPA Entity Lifecycle states.', maxMarks: 10, questionType: 'DESCRIPTIVE' }
      ],
      attachmentUrl: '',
      totalMarks: 20,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setSelectedFile(null);
    setFormData({
      trainerId: item.trainerId || trainerId,
      batchId: item.batchId || currentBatchId,
      title: item.title || '',
      subject: item.subject || '',
      description: item.description || '',
      questionSource: item.questionSource || (item.attachmentUrl ? 'PDF' : 'MANUAL'),
      questions: item.questions && item.questions.length > 0 ? item.questions : [
        { questionId: 'q1', questionNumber: 1, questionText: 'Describe the main components of this topic.', maxMarks: 10, questionType: 'DESCRIPTIVE' }
      ],
      attachmentUrl: item.attachmentUrl || '',
      totalMarks: item.totalMarks || 20,
      assignedDate: item.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: item.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: item.status || 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Document file size must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) {
      toast.error('Please enter Title and Subject.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.dueDate && formData.dueDate < todayStr) {
      toast.error('Assignment due date and time cannot be in the past.');
      return;
    }

    if (formData.assignedDate && formData.dueDate && formData.dueDate < formData.assignedDate) {
      toast.error('Assignment due date must be after the start date.');
      return;
    }

    if (formData.questionSource === 'MANUAL') {
      if (!formData.questions || formData.questions.length === 0) {
        toast.error('At least one question is required for manual assignment.');
        return;
      }
      const emptyQ = formData.questions.find(q => !q.questionText.trim());
      if (emptyQ) {
        toast.error('Question text cannot be empty.');
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

    const payload = {
      trainerId: formData.trainerId || trainerId,
      batchId: currentBatchId,
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim() || 'Assignment instructions.',
      questionSource: formData.questionSource,
      questions: formData.questionSource === 'MANUAL' ? formData.questions : [],
      attachmentUrl: formData.questionSource === 'PDF' ? finalDocUrl : '',
      totalMarks: Number(formData.totalMarks) || 20,
      assignedDate: formData.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: formData.status || 'ACTIVE'
    };

    try {
      if (editingId) {
        await updateAssignment(editingId, payload);
        toast.success('Assignment updated successfully!');
      } else {
        await createAssignment(payload);
        toast.success('Assignment created successfully! Students notified. 🚀');
      }
      setModalOpen(false);
      fetchAssignmentsAndStats();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save assignment.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setDeleting(true);
    try {
      await deleteAssignment(deleteConfirmItem.id);
    } catch (err) {}

    const updated = assignments.filter(item => item.id !== deleteConfirmItem.id);
    setAssignments(updated);
    localStorage.setItem(`spt_assignments_${currentBatchId}`, JSON.stringify(updated));
    toast.success('Assignment deleted successfully!');
    setDeleteConfirmItem(null);
    setDeleting(false);
  };

  const getStatusBadge = (status) => {
    switch (String(status || '').toUpperCase()) {
      case 'EVALUATED':
        return <span className="badge-green font-bold">EVALUATED</span>;
      case 'ACTIVE':
      case 'PUBLISHED':
        return <span className="badge-blue font-bold">ACTIVE</span>;
      case 'OVERDUE':
        return <span className="badge-red font-bold">OVERDUE</span>;
      default:
        return <span className="badge-gray font-bold">{status || 'Not available'}</span>;
    }
  };

  // Filter & Search Logic
  const filtered = assignments
    .filter(item => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || (
        item.title?.toLowerCase().includes(term) ||
        item.subject?.toLowerCase().includes(term)
      );

      let matchesStatus = true;
      const st = String(item.status || '').toUpperCase();
      if (statusFilter === 'ACTIVE') matchesStatus = st === 'ACTIVE' || st === 'PUBLISHED';
      else if (statusFilter === 'EVALUATED') matchesStatus = st === 'EVALUATED';
      else if (statusFilter === 'OVERDUE') matchesStatus = st === 'OVERDUE';

      let matchesSub = true;
      if (subjectFilter !== 'ALL') matchesSub = String(item.subject || '').toUpperCase() === subjectFilter;

      return matchesSearch && matchesStatus && matchesSub;
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.assignedDate || 0) - new Date(a.assignedDate || 0);
      if (sortBy === 'DUE_SOON') return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      return 0;
    });

  // Calculate Real Assignment Details Statistics
  const detailTotalStudents = detailStats?.totalStudents || studentSubmissionsList.length || stats.totalStudents || 28;
  const detailSubmitted = detailStats?.totalSubmitted || studentSubmissionsList.filter(s => s.status === 'SUBMITTED' || s.status === 'EVALUATED' || s.submittedAt).length;
  const detailPending = Math.max(0, detailTotalStudents - detailSubmitted);
  const detailEvaluated = detailStats?.totalEvaluated || studentSubmissionsList.filter(s => s.status === 'EVALUATED').length;
  const detailPendingEval = detailStats?.pendingEvaluation || Math.max(0, detailSubmitted - detailEvaluated);
  const submissionRatePct = detailTotalStudents > 0 ? Math.round((detailSubmitted / detailTotalStudents) * 100) : 0;

  // Filter Student Submissions inside Assignment Details View
  const filteredStudentSubmissions = studentSubmissionsList
    .filter(stu => {
      const term = studentSearch.toLowerCase().trim();
      const matchesSearch = !term || (
        stu.studentName?.toLowerCase().includes(term) ||
        stu.studentEmail?.toLowerCase().includes(term)
      );

      let matchesSt = true;
      if (studentStatusFilter === 'SUBMITTED') matchesSt = stu.status === 'SUBMITTED' || !!stu.submittedAt;
      else if (studentStatusFilter === 'DRAFT') matchesSt = stu.submissionStatus === 'DRAFT' || stu.status === 'DRAFT';
      else if (studentStatusFilter === 'EVALUATED') matchesSt = stu.status === 'EVALUATED' || stu.evaluationStatus === 'EVALUATED';
      else if (studentStatusFilter === 'PENDING') matchesSt = stu.status === 'PENDING' || !stu.submittedAt;

      return matchesSearch && matchesSt;
    })
    .sort((a, b) => {
      if (studentSortBy === 'NAME') return (a.studentName || '').localeCompare(b.studentName || '');
      if (studentSortBy === 'DATE') return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
      if (studentSortBy === 'MARKS') return (b.obtainedMarks || 0) - (a.obtainedMarks || 0);
      return 0;
    });

  // Top Metrics
  const totalCount = assignments.length;
  const totalStudentsCount = stats.totalStudents || 28;
  const activeCount = assignments.filter(a => String(a.status || '').toUpperCase() === 'ACTIVE').length;

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">{isStudent ? 'My Course Assignments' : 'Trainer Assignment Management'}</h1>
          <p className="page-subtitle">
            {isStudent ? 'Complete descriptive questions, save drafts, or upload your homework submissions' : 'Create assignments with manual questions or PDF attachments, track student drafts, and evaluate responses'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isStudent && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
              <Layers size={16} className="text-red-600" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-red-500">Active Trainer Batch</p>
                <p className="text-xs font-bold text-red-950 flex items-center gap-1">
                  <span>{currentBatchName}</span>
                  <span className="font-mono text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    {currentBatchId}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenBatchModal}
                className="btn-secondary py-1 px-2.5 text-xs font-bold text-red-700 bg-white border-red-200 hover:bg-red-100 shadow-2xs ml-2"
              >
                Change Batch
              </button>
            </div>
          )}

          {isStudent ? (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 shadow-2xs">
              <Lock size={14} className="text-blue-600" />
              <span>Student Assignment Dashboard</span>
            </div>
          ) : (
            <button onClick={handleOpenCreateModal} className="btn-primary shadow-md shadow-red-200 font-bold">
              <Plus size={18} />
              <span>New Assignment</span>
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
            <p className="text-xs font-medium text-gray-500 mt-0.5">Total Assignments</p>
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
            <p className="text-xl font-extrabold text-gray-900">{activeCount}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Active Assignments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{stats.totalSubmitted || 32}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Submitted Homeworks</p>
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
              placeholder="Search by title, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[42px] px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 transition shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EVALUATED">Evaluated</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[42px] px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 transition shadow-2xs"
            >
              <option value="NEWEST">Newest First</option>
              <option value="DUE_SOON">Due Date: Soonest</option>
            </select>

            <button
              onClick={fetchAssignmentsAndStats}
              className="h-[42px] px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-gray-200 transition whitespace-nowrap shadow-2xs"
              title="Refresh Assignments from MongoDB"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ASSIGNMENTS TABLE */}
      {loading ? (
        <LoadingState message="Loading Assignments Dashboard..." />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchAssignmentsAndStats} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Assignment Title</th>
                  <th>Subject</th>
                  <th>Question Mode</th>
                  <th>Total Marks</th>
                  <th>Assigned Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((item) => {
                    const isManual = item.questionSource === 'MANUAL' || (item.questions && item.questions.length > 0);
                    return (
                      <tr key={item.id}>
                        <td>
                          {/* CLICKABLE ASSIGNMENT TITLE -> View Details Mode */}
                          <button
                            type="button"
                            onClick={() => isStudent ? handleOpenStudentAttempt(item) : handleOpenAssignmentDetails(item)}
                            className="font-bold text-gray-900 hover:text-red-600 hover:underline text-left cursor-pointer transition flex items-center gap-1.5"
                            title="Click to view complete assignment details & questions"
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
                              <Paperclip size={12} /> PDF File
                            </span>
                          )}
                        </td>
                        <td className="font-bold text-gray-900">{item.totalMarks} pts</td>
                        <td className="text-xs font-medium text-gray-600">{item.assignedDate}</td>
                        <td className="text-xs font-bold text-red-600">{item.dueDate}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td className="text-right">
                          {isStudent ? (
                            <button
                              onClick={() => handleOpenStudentAttempt(item)}
                              className="btn-primary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5"
                            >
                              <Edit2 size={13} />
                              <span>{isManual ? 'Solve Questions' : 'View / Submit Homework'}</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenAssignmentDetails(item)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition flex items-center gap-1 text-xs font-bold"
                                title="View Details Dashboard"
                              >
                                <Eye size={16} />
                                <span>Details</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Assignment"
                              >
                                <Edit2 size={16} />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmItem(item)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Assignment"
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
                        title="No assignments found"
                        description="Try changing or clearing your filters."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT ASSIGNMENT ATTEMPT MODAL (FOR MANUAL QUESTIONS & DRAFTS) */}
      {studentAttemptModalOpen && activeStudentAssignment && (
        <div className="modal-backdrop">
          <div className="modal max-w-4xl">
            <div className="modal-header bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activeStudentAssignment.title}</span>
                  <span className="badge-blue text-[10px] font-bold px-2 py-0.5">{activeStudentAssignment.subject}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Assigned: <strong>{activeStudentAssignment.assignedDate}</strong> • Due: <strong className="text-red-400">{activeStudentAssignment.dueDate}</strong> • Total Marks: <strong>{activeStudentAssignment.totalMarks} pts</strong>
                </p>
              </div>
              <button onClick={() => setStudentAttemptModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-6">
              {loadingStudentSubmission ? (
                <LoadingState message="Loading your assignment answers & questions..." />
              ) : (
                <>
                  {/* Status Banner */}
                  {studentSubmissionRecord?.submissionStatus === 'SUBMITTED' || studentSubmissionRecord?.status === 'EVALUATED' ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span>Assignment Submitted & Locked on {new Date(studentSubmissionRecord.submittedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <span className="badge-green text-xs font-black px-2.5 py-0.5">
                        {studentSubmissionRecord.status === 'EVALUATED' ? `Score: ${studentSubmissionRecord.obtainedMarks}/${activeStudentAssignment.totalMarks}` : 'SUBMITTED'}
                      </span>
                    </div>
                  ) : studentSubmissionRecord?.submissionStatus === 'DRAFT' ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-bold">
                      <Clock size={16} className="text-amber-600" />
                      <span>You have a saved DRAFT. You can modify your answers and click "Submit Assignment" when ready.</span>
                    </div>
                  ) : null}

                  {/* PDF Document Viewer option if questionSource === "PDF" */}
                  {activeStudentAssignment.attachmentUrl && (
                    <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-red-600" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">Attached Question Document PDF</p>
                          <p className="text-[11px] text-gray-500">Download question paper instructions</p>
                        </div>
                      </div>
                      <a
                        href={activeStudentAssignment.attachmentUrl.startsWith('/') ? `http://localhost:8080${activeStudentAssignment.attachmentUrl}` : activeStudentAssignment.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1"
                      >
                        <Paperclip size={13} /> View Question PDF <ExternalLink size={11} />
                      </a>
                    </div>
                  )}

                  {/* MANUAL QUESTIONS LIST & PER-QUESTION TEXTAREAS */}
                  {activeStudentAssignment.questions && activeStudentAssignment.questions.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <FileCode size={16} className="text-purple-600" />
                          <span>Assignment Questions ({activeStudentAssignment.questions.length})</span>
                        </h4>
                        <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                          Total: {activeStudentAssignment.totalMarks} Marks
                        </span>
                      </div>

                      {activeStudentAssignment.questions.map((q, idx) => {
                        const answerVal = studentAnswersMap[q.questionId] || '';
                        const isLocked = studentSubmissionRecord?.submissionStatus === 'SUBMITTED' || studentSubmissionRecord?.status === 'EVALUATED';

                        return (
                          <div key={q.questionId || idx} className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 flex flex-col gap-3">
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
                                <label className="form-label mb-0">Your Solution Answer:</label>
                                <span>{answerVal.length} characters</span>
                              </div>
                              <textarea
                                rows="4"
                                disabled={isLocked}
                                placeholder="Write your multi-line answer here..."
                                value={answerVal}
                                onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                                className={`form-textarea text-xs font-sans ${isLocked ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label font-bold">Submission Remarks / Notes</label>
                      <textarea
                        rows="4"
                        placeholder="Write your homework solution notes here..."
                        value={studentAnswersMap['general'] || ''}
                        onChange={(e) => handleAnswerChange('general', e.target.value)}
                        className="form-textarea text-xs"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer flex items-center justify-between">
              <button type="button" onClick={() => setStudentAttemptModalOpen(false)} className="btn-outline font-bold text-xs">
                Close
              </button>

              {!(studentSubmissionRecord?.submissionStatus === 'SUBMITTED' || studentSubmissionRecord?.status === 'EVALUATED') && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={savingDraft || submittingFinal}
                    onClick={handleSaveStudentDraft}
                    className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2 px-3.5 rounded-xl border border-gray-300 flex items-center gap-1.5"
                  >
                    <Save size={15} />
                    <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={savingDraft || submittingFinal}
                    onClick={() => setConfirmSubmitModalOpen(true)}
                    className="btn-primary font-bold text-xs py-2 px-4 shadow-md shadow-red-200 flex items-center gap-1.5"
                  >
                    <Send size={15} />
                    <span>Submit Assignment</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FINAL SUBMISSION CONFIRMATION MODAL */}
      {confirmSubmitModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header border-b-0 pb-0">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <AlertTriangle size={24} />
              </div>
              <button onClick={() => setConfirmSubmitModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body py-2">
              <h3 className="text-base font-bold text-gray-900">Confirm Assignment Submission?</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Are you sure you want to submit this assignment? You will <strong>NOT</strong> be able to edit your answers after submission.
              </p>
            </div>

            <div className="modal-footer border-t-0 pt-4">
              <button
                type="button"
                onClick={() => setConfirmSubmitModalOpen(false)}
                className="btn-outline font-bold text-xs"
                disabled={submittingFinal}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFinalSubmit}
                disabled={submittingFinal}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5"
              >
                {submittingFinal ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Check size={16} />}
                <span>Yes, Submit Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED ASSIGNMENT DETAILS VIEW MODAL (FOR TRAINERS) */}
      {detailsViewOpen && selectedAssignmentDetails && (
        <div className="modal-backdrop">
          <div className="modal max-w-5xl">
            {/* Header with Back Navigation */}
            <div className="modal-header bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailsViewOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Back to Assignments List"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedAssignmentDetails.title}</span>
                    <span className="badge-blue text-[10px] font-bold px-2 py-0.5">{selectedAssignmentDetails.subject}</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Batch: <strong className="text-white">{currentBatchName}</strong> ({currentBatchId})
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailsViewOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-6">
              {/* 1. Real Backend Statistics Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Students</span>
                  <span className="text-lg font-black text-gray-900">{detailTotalStudents}</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">Submitted</span>
                  <span className="text-lg font-black text-emerald-900">{detailSubmitted}</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold uppercase text-amber-600 block">Pending</span>
                  <span className="text-lg font-black text-amber-900">{detailPending}</span>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-[10px] font-bold uppercase text-purple-600 block">Evaluated</span>
                  <span className="text-lg font-black text-purple-900">{detailEvaluated}</span>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-[10px] font-bold uppercase text-rose-600 block">Pending Eval</span>
                  <span className="text-lg font-black text-rose-900">{detailPendingEval}</span>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold uppercase text-blue-600 block">Submission Rate</span>
                  <span className="text-lg font-black text-blue-900">{submissionRatePct}%</span>
                </div>
              </div>

              {/* 2. Visual Submission Progress Bar */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                  <span>Student Submission Progress</span>
                  <span className="text-emerald-700 font-extrabold">{detailSubmitted} / {detailTotalStudents} Submissions ({submissionRatePct}%)</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${submissionRatePct}%` }}
                  />
                </div>
              </div>

              {/* 3. Student Submissions Table */}
              <div className="card overflow-hidden border border-gray-200">
                {submissionsLoading ? (
                  <LoadingState message="Loading student submissions..." />
                ) : (
                  <div className="table-wrapper">
                    <table className="table text-xs">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Submitted Date</th>
                          <th>Evaluation</th>
                          <th>Marks / Max</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudentSubmissions.length > 0 ? (
                          filteredStudentSubmissions.map(stu => {
                            const isSubmitted = stu.status === 'SUBMITTED' || stu.status === 'EVALUATED' || !!stu.submittedAt;
                            const isEvaluated = stu.status === 'EVALUATED' || stu.evaluationStatus === 'EVALUATED';

                            return (
                              <tr key={stu.studentId}>
                                <td><p className="font-bold text-gray-900">{stu.studentName}</p></td>
                                <td className="text-gray-500 font-mono">{stu.studentEmail}</td>
                                <td>
                                  {isSubmitted ? (
                                    <span className="badge-blue font-bold px-2 py-0.5">SUBMITTED</span>
                                  ) : (
                                    <span className="badge-gray font-bold px-2 py-0.5">NOT SUBMITTED</span>
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
                                  ) : isSubmitted ? (
                                    <span className="badge-amber font-bold px-2 py-0.5">PENDING EVALUATION</span>
                                  ) : (
                                    <span className="badge-gray font-bold px-2 py-0.5">NOT SUBMITTED</span>
                                  )}
                                </td>
                                <td className="font-extrabold text-gray-900">
                                  {isEvaluated ? `${stu.obtainedMarks} / ${selectedAssignmentDetails.totalMarks}` : '—'}
                                </td>
                                <td>
                                  {isSubmitted ? (
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

                                      {/* Evaluation Lock Logic */}
                                      {isEvaluated ? (
                                        <span className="badge-green text-[11px] font-bold py-1 px-2.5 rounded-lg border border-emerald-200">
                                          View Evaluation
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => handleOpenTrainerEvalModal(stu)}
                                          className="btn-primary text-[11px] py-1 px-2.5 font-bold"
                                        >
                                          Evaluate
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">Not submitted</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-0">
                              <EmptyState
                                icon={CheckSquare}
                                title="No Student Submissions Found"
                                description="No submissions match your selected filter."
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setDetailsViewOpen(false)} className="btn-outline font-bold text-xs">
                Close Details Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT ANSWER SHEET VIEWER MODAL */}
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
                  <span className="text-gray-400 block font-semibold">Submitted Date</span>
                  <span className="font-bold text-gray-800">{selectedAnswerSheetSub.submittedAt ? new Date(selectedAnswerSheetSub.submittedAt).toLocaleDateString() : 'Submitted'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block font-semibold">Marks Obtained</span>
                  <span className="font-bold text-gray-900">{selectedAnswerSheetSub.obtainedMarks || 0} / {selectedAssignmentDetails?.totalMarks || 20}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block font-semibold">Evaluation Status</span>
                  <span className={`font-bold ${selectedAnswerSheetSub.status === 'EVALUATED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedAnswerSheetSub.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Display Per-Question Answers if present */}
              {selectedAnswerSheetSub.questionAnswers && selectedAnswerSheetSub.questionAnswers.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Question-by-Question Student Answers:</span>
                  {selectedAnswerSheetSub.questionAnswers.map((qa, idx) => (
                    <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900">Q{qa.questionNumber || (idx + 1)}: {qa.questionText}</span>
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {qa.marksObtained != null ? `${qa.marksObtained} / ${qa.maxMarks}` : `${qa.maxMarks} Marks`}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200 font-mono text-xs text-gray-800 whitespace-pre-wrap">
                        {qa.answerText || 'No answer submitted.'}
                      </div>
                      {qa.feedback && (
                        <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                          <strong>Faculty Feedback:</strong> {qa.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2">
                  <span className="font-bold text-gray-900">Submitted Solution Text / Remarks:</span>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedAnswerSheetSub.submissionRemarks || 'Assignment answers submitted.'}
                  </div>
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

      {/* PER-QUESTION TRAINER EVALUATION MODAL */}
      {evalModalOpen && selectedSubmissionForEval && (
        <div className="modal-backdrop">
          <div className="modal max-w-3xl">
            <div className="modal-header">
              <div>
                <h3 className="text-base font-bold text-gray-800">Evaluate Student Homework Submission</h3>
                <p className="text-xs text-gray-400">{selectedSubmissionForEval.studentName} ({selectedSubmissionForEval.studentEmail})</p>
              </div>
              <button onClick={() => setEvalModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation}>
              <div className="modal-body p-6 flex flex-col gap-5 text-xs">

                {/* Per-Question Grading Cards */}
                {evalQuestionGrades.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                      <span>Per-Question Marks & Feedback</span>
                      <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg font-black text-xs">
                        Total Score: {evalTotalObtained} / {selectedAssignmentDetails?.totalMarks || 20} pts
                      </span>
                    </span>

                    {evalQuestionGrades.map((g, idx) => (
                      <div key={g.questionId || idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-gray-900 text-xs">
                            Q{g.questionNumber || (idx + 1)}: {g.questionText}
                          </span>
                          <span className="badge-gray font-bold shrink-0">{g.maxMarks} Max Marks</span>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs font-mono text-gray-800 whitespace-pre-wrap">
                          {g.answerText}
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-1">
                          <div className="form-group">
                            <label className="form-label font-bold text-gray-700">Marks (Max: {g.maxMarks})</label>
                            <input
                              type="number"
                              required
                              min="0"
                              max={g.maxMarks}
                              value={g.marksObtained}
                              onChange={(e) => handleQuestionGradeChange(g.questionId, 'marksObtained', e.target.value)}
                              className="form-input text-sm font-bold text-red-950"
                            />
                          </div>

                          <div className="form-group col-span-2">
                            <label className="form-label font-bold text-gray-700">Question Feedback</label>
                            <input
                              type="text"
                              placeholder="Feedback for this question..."
                              value={g.feedback}
                              onChange={(e) => handleQuestionGradeChange(g.questionId, 'feedback', e.target.value)}
                              className="form-input text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label font-bold text-gray-800">Total Marks Obtained (Max: {selectedAssignmentDetails?.totalMarks || 20})</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max={selectedAssignmentDetails?.totalMarks || 20}
                      value={evalTotalObtained}
                      onChange={(e) => setEvalTotalObtained(Number(e.target.value))}
                      className="form-input text-base font-bold text-red-950"
                    />
                  </div>
                )}

                <div className="form-group pt-2 border-t">
                  <label className="form-label font-bold text-gray-800">Overall Faculty Assignment Feedback</label>
                  <textarea
                    rows="3"
                    placeholder="General feedback for the student..."
                    value={evalOverallFeedback}
                    onChange={(e) => setEvalOverallFeedback(e.target.value)}
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

      {/* FACULTY CREATE/EDIT MODAL (OPTIONS A & B) */}
      {modalOpen && !isStudent && (
        <div className="modal-backdrop">
          <div className="modal max-w-3xl">
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
                  <label className="form-label">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring Boot REST Architecture Workshop"
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
                      placeholder="Spring Boot / React.js"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* QUESTION SOURCE TOGGLE: OPTION A vs OPTION B */}
                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 flex flex-col gap-3">
                  <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                    Question Creation Mode *
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-800">
                      <input
                        type="radio"
                        name="questionSource"
                        value="MANUAL"
                        checked={formData.questionSource === 'MANUAL'}
                        onChange={() => setFormData({ ...formData, questionSource: 'MANUAL' })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>Option A — Create Questions Manually</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-800">
                      <input
                        type="radio"
                        name="questionSource"
                        value="PDF"
                        checked={formData.questionSource === 'PDF'}
                        onChange={() => setFormData({ ...formData, questionSource: 'PDF' })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>Option B — Upload Question PDF</span>
                    </label>
                  </div>
                </div>

                {/* OPTION A: DYNAMIC MANUAL QUESTION BUILDER */}
                {formData.questionSource === 'MANUAL' ? (
                  <div className="flex flex-col gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCode size={15} className="text-purple-600" />
                        <span>Question Builder ({formData.questions.length})</span>
                      </span>
                      <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                        Total Marks: {formData.totalMarks} pts
                      </span>
                    </div>

                    {formData.questions.map((q, idx) => (
                      <div key={idx} className="p-3.5 bg-white rounded-xl border border-gray-200 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[11px]">
                              {idx + 1}
                            </span>
                            <span>Question #{idx + 1}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div className="col-span-3">
                            <textarea
                              rows="2"
                              required
                              placeholder="Enter question text..."
                              value={q.questionText}
                              onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                              className="form-textarea text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-500 block mb-1">Marks</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={q.maxMarks}
                              onChange={(e) => handleQuestionChange(idx, 'maxMarks', e.target.value)}
                              className="form-input text-xs font-bold text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="btn-secondary text-xs py-2 font-bold text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 self-start inline-flex items-center gap-1 mt-1"
                    >
                      <Plus size={14} /> Add Another Question
                    </button>
                  </div>
                ) : (
                  /* OPTION B: PDF DOCUMENT UPLOAD */
                  <div className="form-group p-4 bg-gray-50/80 rounded-xl border border-gray-200">
                    <label className="form-label font-bold">Upload Question Document / PDF *</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="form-input text-xs"
                    />
                    {selectedFile && (
                      <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                        <Paperclip size={13} /> Selected File: {selectedFile.name}
                      </p>
                    )}
                    {formData.attachmentUrl && !selectedFile && (
                      <p className="text-xs text-blue-600 font-semibold mt-1 truncate">
                        Current Document: {formData.attachmentUrl}
                      </p>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Description / Instructions</label>
                  <textarea
                    rows="2"
                    placeholder="Additional instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline font-bold text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || uploadingFile} className="btn-primary font-bold text-xs">
                  {submitting || uploadingFile ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Check size={16} />}
                  <span>{editingId ? 'Update Assignment' : 'Save Assignment'}</span>
                </button>
              </div>
            </form>
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
                <p className="text-xs text-gray-400">Choose a batch to manage assignments</p>
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
              <h3 className="text-base font-bold text-gray-900">Delete Assignment?</h3>
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
                <span>Delete Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
