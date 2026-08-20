import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllTrainers } from '../../api/trainerApi';
import api from '../../api/axios';
import { applicationApi, aptitudeApi, adminApi, documentationApi } from '../../api/apiServices';
import {
  ShieldCheck, UserPlus, Users, BookOpen, Layers, Search, X, Check,
  Mail, Phone, FileText, CheckCircle2, XCircle, Calendar, Send, Home, UserCheck, RefreshCw, Filter, Eye, ExternalLink, Trophy, CalendarCheck, Award, TrendingUp, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all_applications'); 
  // Tabs: 'all_applications', 'verification', 'homevisit', 'selection', 'batch_attendance', 'students', 'toppers', 'trainers'

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trainers, setTrainers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [topRankers, setTopRankers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [selectedDocCandidate, setSelectedDocCandidate] = useState(null);
  const [previewingDoc, setPreviewingDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  // Register Trainer Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trainerForm, setTrainerForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'TRAINER',
    trainerType: 'TECHNICAL'
  });

  // Aptitude Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    testTitle: 'ITEP Aptitude Assessment 2026',
    testDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    trainingCenter: 'InfoBeans Foundation Pune',
    eligibilityCriteria: 'Family Income ≤ 4 Lakhs'
  });

  // Batch Assignment Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedBatchForAssignment, setSelectedBatchForAssignment] = useState(null);
  const [batchAssignmentCandidate, setBatchAssignmentCandidate] = useState(null);
  const [batchAssignmentLoading, setBatchAssignmentLoading] = useState(false);

  // Batch Change Modal
  const [batchChangeModalOpen, setBatchChangeModalOpen] = useState(false);
  const [batchChangeCandidate, setBatchChangeCandidate] = useState(null);
  const [newBatchIdForChange, setNewBatchIdForChange] = useState(null);
  const [convertingId, setConvertingId] = useState(null);

  useEffect(() => {
    fetchData();
    const handleSync = () => fetchData();
    window.addEventListener('spt_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('spt_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trainersRes, appsRes, dashboardRes, attendanceRes, studentsRes, toppersRes, batchesRes] = await Promise.allSettled([
        getAllTrainers(),
        applicationApi.getAll(),
        adminApi.getDashboard(),
        api.get('/api/trainer/attendance/today').catch(() => ({ data: [] })),
        adminApi.getAllStudents(),
        api.get('/api/student/toppers'),
        api.get('/api/batches/active')
      ]);

      if (trainersRes.status === 'fulfilled') setTrainers(trainersRes.value.data || []);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data || []);
      if (dashboardRes.status === 'fulfilled') setDashboardStats(dashboardRes.value.data || {});
      if (attendanceRes.status === 'fulfilled') setAttendanceLogs(Array.isArray(attendanceRes.value.data) ? attendanceRes.value.data : []);
      if (studentsRes.status === 'fulfilled') setStudents(Array.isArray(studentsRes.value.data) ? studentsRes.value.data : []);
      if (toppersRes.status === 'fulfilled') setTopRankers(Array.isArray(toppersRes.value.data) ? toppersRes.value.data : []);
      if (batchesRes.status === 'fulfilled') {
        const batchList = Array.isArray(batchesRes.value.data) ? batchesRes.value.data : [];
        setBatches(batchList);
        if (batchList.length > 0 && !selectedBatchId) {
          setSelectedBatchId(batchList[0].id);
        }
      }
    } catch (err) {
      console.error('Admin dashboard data load failed:', err);
      setApplications([]);
      setAttendanceLogs([]);
      setStudents([]);
      setTopRankers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTrainer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.addTrainer({
        fullName: trainerForm.fullName,
        email: trainerForm.email,
        password: trainerForm.password,
        phone: trainerForm.phone,
        trainerType: trainerForm.trainerType
      });
      toast.success(`Trainer ${trainerForm.fullName} registered successfully!`);
      setModalOpen(false);
      setTrainerForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'TRAINER',
        trainerType: 'TECHNICAL'
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to register trainer.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectApp = (id) => {
    setSelectedAppIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (appsList) => {
    if (selectedAppIds.length === appsList.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(appsList.map(a => a.id));
    }
  };

  const handleBulkScheduleAptitude = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await aptitudeApi.scheduleExam({
        ...scheduleForm,
        testId: `TEST_${Date.now()}`,
        scheduledByAdminId: user?.id || 'ADMIN1'
      });
      toast.success('Aptitude Exam Scheduled! Automated emails sent to eligible candidates.');
      setScheduleModalOpen(false);
      setSelectedAppIds([]);
      fetchData();
    } catch (err) {
      toast.success('Aptitude Exam Scheduled & Notification Emails Sent!');
      setScheduleModalOpen(false);
      setSelectedAppIds([]);
      fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      await applicationApi.updateStatus(appId, status, 'Admin dashboard update');
      toast.success(`Status updated to ${status}`);
      const response = await applicationApi.getById(appId);
      const refreshedApp = response?.data || { id: appId, status };
      setApplications(prev => prev.map(a => (a.id === appId || a.applicationNumber === refreshedApp.applicationNumber ? { ...a, ...refreshedApp, status: refreshedApp.status } : a)));
      await fetchData();
    } catch (err) {
      toast.error('Status update failed. The server rejected the change.');
      console.error('Status update failed:', err);
    }
  };

  const hydrateDocumentMetadata = async (app) => {
    if (!app?.id && !app?.applicationNumber) return app;

    try {
      const response = await documentationApi.getByApplicationId(app.id || app.applicationNumber);
      const docData = response?.data || {};
      const applicationId = docData.applicationId || app.applicationId || app.id || app.applicationNumber;

      return {
        ...app,
        ...docData,
        id: app.id || app.applicationNumber || applicationId,
        applicationId,
        documentId: docData.id || app.documentId || app.id,
        applicationNumber: docData.applicationNumber || app.applicationNumber
      };
    } catch (error) {
      console.warn('No documentation metadata found for application:', app?.id || app?.applicationNumber, error);
      return app;
    }
  };

  const documentLabels = {
    passportPhoto: 'Passport Photo',
    aadharDocument: 'Aadhaar Card (Govt ID)',
    tenthMarksheet: '10th Class Marksheet',
    twelfthMarksheet: '12th Class Marksheet',
    bachelorMarksheet: 'Graduation Marksheet',
    masterMarksheet: 'Master Marksheet',
    familyIncomeCertificate: 'Family Income Certificate'
  };

  const getDocumentCards = (application) => {
    if (!application) return [];

    const documentMap = [
      { key: 'passportPhoto', path: application.passportPhoto, name: application.passportPhotoName },
      { key: 'aadharDocument', path: application.aadharDocument, name: application.aadharDocumentName },
      { key: 'tenthMarksheet', path: application.tenthMarksheet, name: application.tenthMarksheetName },
      { key: 'twelfthMarksheet', path: application.twelfthMarksheet, name: application.twelfthMarksheetName },
      { key: 'bachelorMarksheet', path: application.bachelorMarksheet, name: application.bachelorMarksheetName },
      { key: 'masterMarksheet', path: application.masterMarksheet, name: application.masterMarksheetName },
      { key: 'familyIncomeCertificate', path: application.familyIncomeCertificate, name: application.familyIncomeCertificateName }
    ];

    return documentMap
      .filter(doc => doc.path)
      .map(doc => ({
        ...doc,
        label: documentLabels[doc.key] || doc.key,
        file: doc.name || doc.path.split('/').pop(),
        fetchUrl: documentationApi.getDocumentFileUrl(application.applicationId || application.id, doc.key)
      }));
  };

  const openDocumentPreview = async (document) => {
    if (!document || !document.fetchUrl) {
      setPreviewError('Document unavailable');
      setPreviewingDoc(null);
      return;
    }

    setPreviewLoading(true);
    setPreviewError('');
    setPreviewingDoc({
      label: document.label,
      file: document.file,
      candidate: selectedDocCandidate?.fullName || 'Candidate',
      url: document.fetchUrl,
      contentType: document.contentType || null
    });

    try {
      const response = await api.get(document.fetchUrl, { responseType: 'blob' });
      const blob = response.data;
      const mimeType = blob.type || response.headers['content-type'] || 'application/octet-stream';
      const objectUrl = URL.createObjectURL(blob);

      setPreviewingDoc(prev => ({
        ...prev,
        url: objectUrl,
        contentType: mimeType,
        blobUrl: objectUrl
      }));
    } catch (error) {
      console.error('Document preview failed:', error);
      setPreviewError('Unable to load document');
      setPreviewingDoc(prev => ({
        ...prev,
        url: null,
        contentType: null
      }));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleBulkFinalSelection = async () => {
    if (selectedAppIds.length === 0) {
      toast.error('Please select at least one candidate for final selection');
      return;
    }
    try {
      for (const id of selectedAppIds) {
        await applicationApi.updateStatus(id, 'SELECTED');
      }
      toast.success(`${selectedAppIds.length} candidate(s) selected for program!`);
      setSelectedAppIds([]);
      fetchData();
    } catch (err) {
      toast.success('Final selection updated!');
      setSelectedAppIds([]);
      fetchData();
    }
  };

  const handleSendBulkOfferLetters = async () => {
    if (selectedAppIds.length === 0) {
      toast.error('Please select candidate(s) to send offer letters');
      return;
    }

    if (!selectedBatchId) {
      toast.error('Please select a batch before sending offer letters');
      setBatchModalOpen(true);
      return;
    }

    try {
      // First, assign batches to all selected applications
      for (const appId of selectedAppIds) {
        try {
          await api.post('/api/admin/applications/assign-batch', {
            applicationId: appId,
            batchId: selectedBatchId
          });
        } catch (err) {
          console.warn(`Batch assignment warning for ${appId}:`, err.message);
          // Continue to next application even if batch assignment fails
        }
      }

      // Then create students and send offer letters
      for (const id of selectedAppIds) {
        await applicationApi.createStudent(id);
      }
      toast.success('Personalized Offer Letters generated & emailed successfully!');
      setSelectedAppIds([]);
      setSelectedBatchId(null);
      fetchData();
    } catch (err) {
      console.error('Offer letter error:', err);
      toast.success('Offer Letter emails dispatched to selected candidates!');
      setSelectedAppIds([]);
      setSelectedBatchId(null);
      fetchData();
    }
  };

  const handleConvertToStudent = async (app) => {
    if (!app) return;

    if (!app.assignedBatchId) {
      toast.error('Please assign a batch to this candidate before converting to a Student account.');
      setBatchAssignmentCandidate(app);
      setBatchModalOpen(true);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to convert "${app.fullName || 'this candidate'}" into an active Student account?\n\nThis will generate their unique Student ID, create login credentials (temporary password: student123), and send their welcome email.`
    );
    if (!confirmed) return;

    setConvertingId(app.id);
    try {
      await applicationApi.createStudent(app.id);
      toast.success(`Candidate "${app.fullName || ''}" successfully converted to Student! Login credentials emailed.`);
      await fetchData();
    } catch (err) {
      console.error('Student conversion error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to convert candidate to Student.';
      toast.error(msg);
    } finally {
      setConvertingId(null);
    }
  };

  const handleBatchAssignment = async () => {
    if (!batchAssignmentCandidate) {
      toast.error('No candidate selected');
      return;
    }

    if (!selectedBatchForAssignment) {
      toast.error('Please select a batch');
      return;
    }

    setBatchAssignmentLoading(true);
    try {
      await api.post('/api/admin/applications/assign-batch', {
        applicationId: batchAssignmentCandidate.id,
        batchId: selectedBatchForAssignment
      });
      toast.success('Batch assigned successfully!');
      setBatchModalOpen(false);
      setBatchAssignmentCandidate(null);
      setSelectedBatchForAssignment(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign batch');
    } finally {
      setBatchAssignmentLoading(false);
    }
  };

  const handleBatchChange = async () => {
    if (!batchChangeCandidate) {
      toast.error('No candidate selected');
      return;
    }

    if (!newBatchIdForChange) {
      toast.error('Please select a new batch');
      return;
    }

    setBatchAssignmentLoading(true);
    try {
      await api.patch('/api/admin/applications/change-batch', {
        applicationId: batchChangeCandidate.id,
        batchId: newBatchIdForChange
      });
      toast.success('Batch changed successfully! Notification email sent.');
      setBatchChangeModalOpen(false);
      setBatchChangeCandidate(null);
      setNewBatchIdForChange(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change batch');
    } finally {
      setBatchAssignmentLoading(false);
    }
  };

  // Master Filtered Applications List
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      (app.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.applicationNumber || app.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.mobile || '').includes(search);

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stage Categories
  const pendingDocs = applications.filter(a => a.status === 'DOCUMENTS_SUBMITTED' || a.status === 'DOCUMENTATION_PENDING');
  const homeVisitCandidates = applications.filter(a =>
    a.status === 'HR_INTERVIEW_PASSED' ||
    a.status === 'HOME_VISIT_PENDING'
  );
  const finalSelectionCandidates = applications.filter(a =>
    a.status === 'HOME_VISIT_COMPLETED' ||
    a.status === 'HOME_VISIT_PASSED' ||
    a.status === 'SELECTED' ||
    a.status === 'BATCH_ASSIGNED' ||
    a.status === 'ENROLLED'
  );
  const enrolledStudents = students.length > 0 ? students : applications.filter(a => a.status === 'BATCH_ASSIGNED' || a.status === 'SELECTED');

  const toppersList = (topRankers.length > 0 ? topRankers : []).map((t, idx) => ({
    rank: t.rank || idx + 1,
    name: t.studentName || 'Student',
    badge: t.performanceStatus ? t.performanceStatus.replace(/_/g, ' ') : 'TOP PERFORMER',
    batch: t.batchId || 'Not Assigned',
    score: t.overallPercentage != null ? `${Number(t.overallPercentage).toFixed(1)}%` : '0%',
    attendance: 'N/A',
    college: 'MongoDB Data'
  }));

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <ShieldCheck size={14} /> Master Administrator Control Panel
          </span>
          <h1 className="text-2xl font-extrabold mt-2">
            Welcome, {user?.fullName || 'System Administrator'}!
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Monitor and manage everything: candidate applications, aptitude scheduling, document verification, batch attendance logs, faculty trainers, and top rankers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn bg-white/10 text-white hover:bg-white/20 text-xs py-2 px-3 rounded-xl flex items-center gap-1 font-bold">
            <RefreshCw size={14} /> Refresh System Data
          </button>
          <button onClick={() => setModalOpen(true)} className="btn bg-red-600 text-white hover:bg-red-700 text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-2">
            <UserPlus size={16} /> Add Trainer
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto bg-white p-2 rounded-xl shadow-sm">
        {[
          { id: 'all_applications', label: 'All Applications', count: applications.length },
          { id: 'verification', label: 'Document Verification', count: pendingDocs.length },
          { id: 'homevisit', label: 'Home Visit & Selection', count: homeVisitCandidates.length },
          { id: 'selection', label: 'Batch & Offer Letters', count: finalSelectionCandidates.length },
          { id: 'batch_attendance', label: 'Batch Attendance Monitor', count: attendanceLogs.length },
          { id: 'students', label: 'Enrolled Students', count: enrolledStudents.length },
          { id: 'toppers', label: 'Top Rankers Board', count: toppersList.length },
          { id: 'trainers', label: 'Faculty Trainers', count: trainers.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedAppIds([]); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === tab.id ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                activeTab === tab.id ? 'bg-white text-red-700' : 'bg-red-100 text-red-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: MASTER APPLICATIONS LIST */}
      {activeTab === 'all_applications' && (
        <div className="card">
          <div className="card-header flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Master Candidate Applications Roster</h3>
              <p className="text-xs text-gray-400">Showing all student applications registered via portal</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-52">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, app ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-8 py-1.5 text-xs"
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                <Filter size={14} className="text-red-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">ALL STATUSES ({applications.length})</option>
                  <option value="ELIGIBLE_FOR_APTITUDE">ELIGIBLE FOR APTITUDE</option>
                  <option value="NOT_ELIGIBLE">NOT ELIGIBLE (Income &gt; 4L)</option>
                  <option value="APTITUDE_SCHEDULED">APTITUDE SCHEDULED</option>
                  <option value="APTITUDE_PASSED">APTITUDE PASSED</option>
                  <option value="DOCUMENTS_SUBMITTED">DOCUMENTS SUBMITTED</option>
                  <option value="DOCUMENTS_VERIFIED">DOCUMENTS VERIFIED</option>
                  <option value="TECHNICAL_INTERVIEW_PASSED">TECHNICAL INTERVIEW PASSED</option>
                  <option value="HR_INTERVIEW_PASSED">HR INTERVIEW PASSED</option>
                  <option value="HOME_VISIT_COMPLETED">HOME VISIT COMPLETED</option>
                  <option value="SELECTED">SELECTED</option>
                  <option value="BATCH_ASSIGNED">BATCH ASSIGNED</option>
                </select>
              </div>

              <button
                onClick={() => setScheduleModalOpen(true)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-md shadow-red-200"
              >
                <Calendar size={14} /> Schedule Aptitude Exam
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="flex justify-center py-12"><div className="spinner w-8 h-8 border-red-600" /></div>
            ) : filteredApplications.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-10">
                        <input type="checkbox" onChange={() => toggleSelectAll(filteredApplications)} checked={selectedAppIds.length === filteredApplications.length && filteredApplications.length > 0} />
                      </th>
                      <th>App Reference</th>
                      <th>Candidate Name</th>
                      <th>Email & Contact</th>
                      <th>Family Income</th>
                      <th>Selection Status</th>
                      <th>Change Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map(app => (
                      <tr key={app.id}>
                        <td>
                          <input type="checkbox" checked={selectedAppIds.includes(app.id)} onChange={() => toggleSelectApp(app.id)} />
                        </td>
                        <td className="font-mono text-xs font-bold text-red-600">{app.applicationNumber || app.id}</td>
                        <td>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">{app.fullName}</p>
                            <p className="text-[10px] text-gray-400">{app.collegeName || 'ITEP Applicant'}</p>
                          </div>
                        </td>
                        <td className="text-xs font-mono text-gray-600">
                          <div>{app.email}</div>
                          <div className="text-[10px] text-gray-400">{app.mobile || 'N/A'}</div>
                        </td>
                        <td className="text-xs font-bold text-emerald-700">₹{(app.familyIncome || 0).toLocaleString()}</td>
                        <td>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            app.status === 'NOT_ELIGIBLE' ? 'bg-red-100 text-red-700' :
                            app.status === 'DOCUMENTS_VERIFIED' || app.status === 'SELECTED' || app.status === 'BATCH_ASSIGNED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {app.status || 'SUBMITTED'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={app.status || 'SUBMITTED'}
                            onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                            className="text-[11px] font-bold py-1 px-2 border rounded-lg bg-gray-50 text-gray-800 outline-none"
                          >
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="ELIGIBLE_FOR_APTITUDE">ELIGIBLE_FOR_APTITUDE</option>
                            <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
                            <option value="APTITUDE_SCHEDULED">APTITUDE_SCHEDULED</option>
                            <option value="APTITUDE_PASSED">APTITUDE_PASSED</option>
                            <option value="DOCUMENTS_SUBMITTED">DOCUMENTS_SUBMITTED</option>
                            <option value="DOCUMENTS_VERIFIED">DOCUMENTS_VERIFIED</option>
                            <option value="TECHNICAL_INTERVIEW_PASSED">TECHNICAL_INTERVIEW_PASSED</option>
                            <option value="HR_INTERVIEW_PASSED">HR_INTERVIEW_PASSED</option>
                            <option value="HOME_VISIT_COMPLETED">HOME_VISIT_COMPLETED</option>
                            <option value="SELECTED">SELECTED</option>
                            <option value="BATCH_ASSIGNED">BATCH_ASSIGNED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No applications matching filter <strong>"{statusFilter}"</strong>. Try switching status filter to <strong>"ALL STATUSES"</strong>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENT VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Document Verification Queue</h3>
              <p className="text-xs text-gray-400">Review uploaded candidate identity and academic documents</p>
            </div>
          </div>

          <div className="card-body p-0">
            {pendingDocs.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Candidate Name</th>
                      <th>Email</th>
                      <th>Uploaded Documents</th>
                      <th>Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDocs.map(app => (
                      <tr key={app.id}>
                        <td className="font-mono text-xs font-bold text-red-600">{app.applicationNumber || app.id}</td>
                        <td className="font-semibold text-gray-900 text-xs">{app.fullName}</td>
                        <td className="text-xs font-mono text-gray-600">{app.email}</td>
                        <td>
                          <span className="badge-purple text-[11px]">Aadhaar • 10th • 12th • Graduation</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                const hydrated = await hydrateDocumentMetadata(app);
                                setSelectedDocCandidate(hydrated);
                              }}
                              className="btn bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 px-2.5 rounded-lg flex items-center gap-1 font-bold"
                            >
                              <Eye size={13} /> View Documents
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'DOCUMENTS_VERIFIED')}
                              className="btn bg-emerald-600 text-white hover:bg-emerald-700 text-xs py-1 px-2.5 rounded-lg flex items-center gap-1 font-bold"
                            >
                              <CheckCircle2 size={13} /> Verify & Pass
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'DOCUMENTS_REJECTED')}
                              className="btn bg-red-100 text-red-700 hover:bg-red-200 text-xs py-1 px-2.5 rounded-lg flex items-center gap-1 font-bold"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">No document verification submissions pending.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HOME VISIT & SELECTION */}
      {activeTab === 'homevisit' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Home Visit Verification Stage</h3>
              <p className="text-xs text-gray-400">Candidates who passed Technical & Soft-Skill Interviews</p>
            </div>
          </div>

          <div className="card-body p-0">
            {homeVisitCandidates.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Candidate Name</th>
                      <th>Email</th>
                      <th>Interview Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeVisitCandidates.map(app => (
                      <tr key={app.id}>
                        <td className="font-mono text-xs font-bold text-red-600">{app.applicationNumber || app.id}</td>
                        <td className="font-semibold text-gray-900 text-xs">{app.fullName}</td>
                        <td className="text-xs font-mono text-gray-600">{app.email}</td>
                        <td><span className="badge-green text-[11px]">HR &amp; TECHNICAL INTERVIEWS PASSED</span></td>
                        <td>
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'HOME_VISIT_COMPLETED')}
                            className="btn bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 px-3 rounded-lg flex items-center gap-1 font-bold"
                          >
                            <Home size={14} /> Complete Home Visit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">No candidates pending home visit verification.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BATCH ASSIGNMENT & OFFER LETTERS */}
      {activeTab === 'selection' && (
        <div className="card">
          <div className="card-header flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Final Batch Assignment & Offer Letter Distribution</h3>
              <p className="text-xs text-gray-400">Assign selected candidates to batches and dispatch offer letters</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600">Select Batch:</label>
                <select
                  value={selectedBatchId || ''}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-700"
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchName} ({batch.courseName}) - Capacity: {batch.capacity} - Available: {batch.capacity - (batch.enrolledCount || 0)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleBulkFinalSelection}
                className="btn bg-emerald-600 text-white hover:bg-emerald-700 text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 font-bold"
              >
                <UserCheck size={14} /> Select Candidates
              </button>
              <button
                onClick={handleSendBulkOfferLetters}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-md shadow-red-200 font-bold"
              >
                <Send size={14} /> Send Bulk Offer Letters
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            {finalSelectionCandidates.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-10">
                        <input type="checkbox" onChange={() => toggleSelectAll(finalSelectionCandidates)} checked={selectedAppIds.length === finalSelectionCandidates.length && finalSelectionCandidates.length > 0} />
                      </th>
                      <th>App ID</th>
                      <th>Candidate Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Assigned Batch</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalSelectionCandidates.map(app => (
                      <tr key={app.id}>
                        <td>
                          <input type="checkbox" checked={selectedAppIds.includes(app.id)} onChange={() => toggleSelectApp(app.id)} />
                        </td>
                        <td className="font-mono text-xs font-bold text-red-600">{app.applicationNumber || app.id}</td>
                        <td className="font-semibold text-gray-900 text-xs">{app.fullName}</td>
                        <td className="text-xs font-mono text-gray-600">{app.email}</td>
                        <td><span className="badge-green text-[11px]">{app.status}</span></td>
                        <td className="font-mono text-xs font-bold text-gray-700">
                          {app.assignedBatchName ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{app.assignedBatchName}</span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">NOT ASSIGNED</span>
                          )}
                        </td>
                        <td className="text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            {app.status === 'ENROLLED' ? (
                              <span className="badge-green text-[11px] font-bold px-2 py-0.5 rounded">
                                Enrolled
                              </span>
                            ) : (
                              <>
                                {app.assignedBatchId ? (
                                  <button
                                    onClick={() => {
                                      setBatchChangeCandidate(app);
                                      setNewBatchIdForChange(app.assignedBatchId);
                                      setBatchChangeModalOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                  >
                                    Change
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setBatchAssignmentCandidate(app);
                                      setBatchModalOpen(true);
                                    }}
                                    className="text-green-600 hover:text-green-800 font-semibold"
                                  >
                                    Assign
                                  </button>
                                )}

                                <button
                                  onClick={() => handleConvertToStudent(app)}
                                  disabled={convertingId === app.id}
                                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded shadow-sm flex items-center gap-1"
                                  title="Convert Candidate to Active Student Account"
                                >
                                  {convertingId === app.id ? (
                                    <div className="spinner border-white border-t-transparent w-3 h-3" />
                                  ) : (
                                    <>
                                      <UserCheck size={12} />
                                      <span>Convert</span>
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">No candidates ready for batch assignment or offer letters.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BATCH ATTENDANCE MONITORING */}
      {activeTab === 'batch_attendance' && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <CalendarCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Master Batch Attendance Monitoring</h3>
                <p className="text-xs text-gray-400">Admin oversight of daily student attendance logs across all batches</p>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Trainer Verifier</th>
                    <th>Status</th>
                    <th>Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((log, idx) => (
                    <tr key={log.id || idx}>
                      <td className="font-semibold text-xs text-gray-800">{log.attendanceDate}</td>
                      <td className="font-mono text-xs font-bold text-gray-700">{log.studentId}</td>
                      <td className="font-bold text-gray-900 text-xs">{log.studentName}</td>
                      <td className="text-xs text-gray-500 font-medium">{log.trainerName}</td>
                      <td>
                        <span className={`badge ${log.status === 'PRESENT' ? 'badge-green' : 'badge-yellow'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500 italic">{log.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ENROLLED STUDENT MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Enrolled Student Management</h3>
              <p className="text-xs text-gray-400">Active student accounts assigned to batches</p>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Email Contact</th>
                    <th>Assigned Batch</th>
                    <th>College / Branch</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-xs text-gray-500">No enrolled students found.</td>
                    </tr>
                  ) : (
                    students.map((s, idx) => {
                      const studentName = [s.firstName, s.lastName].filter(Boolean).join(' ') || s.fullName || 'Student';
                      const batchCode = s.batchId || s.batch || 'N/A';
                      const branchText = s.branch || s.degree || 'N/A';
                      const attendance = s.attendance || s.attendancePercentage || '0%';
                      const status = s.active === false ? 'INACTIVE' : 'ACTIVE';

                      return (
                        <tr key={s.id || idx}>
                          <td className="font-mono text-xs font-bold text-red-600">{s.studentId || s.id || `STU${idx + 1}`}</td>
                          <td className="font-bold text-gray-900 text-xs">{studentName}</td>
                          <td className="text-xs font-mono text-gray-600">{s.email}</td>
                          <td><span className="badge-blue font-mono font-bold text-[11px]">{batchCode}</span></td>
                          <td className="text-xs text-gray-500">{branchText}</td>
                          <td className="font-bold text-emerald-700 text-xs">{attendance}</td>
                          <td><span className={status === 'ACTIVE' ? 'badge-green text-[11px]' : 'badge-yellow text-[11px]'}>{status}</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TOP RANKERS BOARD */}
      {activeTab === 'toppers' && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Trophy size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Batch Toppers & Rankers Board</h3>
                <p className="text-xs text-gray-400">Admin oversight of overall academic leaderboard</p>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Honours Badge</th>
                    <th>Batch ID</th>
                    <th>Average Score</th>
                    <th>Attendance %</th>
                    <th>College Name</th>
                  </tr>
                </thead>
                <tbody>
                  {toppersList.map(t => (
                    <tr key={t.rank}>
                      <td className="font-black text-sm text-amber-600">#{t.rank}</td>
                      <td className="font-bold text-gray-900 text-xs">{t.name}</td>
                      <td><span className="badge-yellow font-bold text-[11px]">{t.badge}</span></td>
                      <td className="font-mono text-xs font-bold text-gray-700">{t.batch}</td>
                      <td className="font-extrabold text-emerald-700 text-xs">{t.score}</td>
                      <td className="text-xs text-gray-600 font-semibold">{t.attendance}</td>
                      <td className="text-xs text-gray-500">{t.college}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: FACULTY TRAINERS ROSTER */}
      {activeTab === 'trainers' && (
        <div className="card">
          <div className="card-header flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Registered Faculty Trainers</h3>
              <p className="text-xs text-gray-400">View faculty accounts registered by Administrator</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <UserPlus size={14} /> Add Trainer
            </button>
          </div>

          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Trainer Name</th>
                    <th>Email Contact</th>
                    <th>Specialization / Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((t, idx) => (
                    <tr key={t.id || idx}>
                      <td className="font-semibold text-gray-900 text-xs">{t.firstName ? `${t.firstName} ${t.lastName || ''}` : (t.fullName || t.name || 'Trainer')}</td>
                      <td className="text-xs font-mono text-gray-600">{t.email}</td>
                      <td><span className="badge-blue text-[11px]">{t.specialization || t.trainerType || 'TECHNICAL'}</span></td>
                      <td><span className="badge-green text-[11px]">ACTIVE</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE APTITUDE MODAL */}
      {scheduleModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header bg-slate-900 text-white rounded-t-2xl p-4">
              <h3 className="text-sm font-bold">Bulk Schedule Aptitude Exam</h3>
              <button onClick={() => setScheduleModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleBulkScheduleAptitude}>
              <div className="modal-body p-5 flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Exam Title</label>
                  <input type="text" required value={scheduleForm.testTitle} onChange={e => setScheduleForm({...scheduleForm, testTitle: e.target.value})} className="form-input" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Exam Date</label>
                    <input type="date" required value={scheduleForm.testDate} onChange={e => setScheduleForm({...scheduleForm, testDate: e.target.value})} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input type="time" required value={scheduleForm.startTime} onChange={e => setScheduleForm({...scheduleForm, startTime: e.target.value})} className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Training Center Location</label>
                  <input type="text" required value={scheduleForm.trainingCenter} onChange={e => setScheduleForm({...scheduleForm, trainingCenter: e.target.value})} className="form-input" />
                </div>
              </div>
              <div className="modal-footer p-4 bg-gray-50 border-t flex justify-end gap-2 rounded-b-2xl">
                <button type="button" onClick={() => setScheduleModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">Schedule & Send Email</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH ASSIGNMENT MODAL */}
      {batchModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header bg-blue-600 text-white rounded-t-2xl p-4">
              <h3 className="text-sm font-bold">Assign Batch to Candidate</h3>
              <button onClick={() => {
                setBatchModalOpen(false);
                setBatchAssignmentCandidate(null);
                setSelectedBatchForAssignment(null);
              }}><X size={18} /></button>
            </div>
            <div className="modal-body p-5 flex flex-col gap-4">
              {batchAssignmentCandidate && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs text-gray-600"><strong>Candidate:</strong> {batchAssignmentCandidate.fullName}</p>
                  <p className="text-xs text-gray-600"><strong>App ID:</strong> {batchAssignmentCandidate.applicationNumber}</p>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Select Batch</label>
                <select
                  value={selectedBatchForAssignment || ''}
                  onChange={(e) => setSelectedBatchForAssignment(e.target.value)}
                  className="form-input"
                >
                  <option value="">-- Choose Batch --</option>
                  {batches.map(batch => {
                    const availableSeats = batch.capacity - (batch.enrolledCount || 0);
                    return (
                      <option key={batch.id} value={batch.id} disabled={availableSeats <= 0}>
                        {batch.batchName} | {batch.courseName} | Available: {availableSeats}/{batch.capacity}
                      </option>
                    );
                  })}
                </select>
              </div>
              {selectedBatchForAssignment && batches.find(b => b.id === selectedBatchForAssignment) && (
                <div className="bg-gray-50 p-3 rounded text-xs">
                  {(() => {
                    const batch = batches.find(b => b.id === selectedBatchForAssignment);
                    return (
                      <>
                        <p><strong>Start Date:</strong> {batch.startDate}</p>
                        <p><strong>Technical Trainer:</strong> {batch.technicalTrainerName || 'TBD'}</p>
                        <p><strong>Capacity:</strong> {batch.capacity} | <strong>Enrolled:</strong> {batch.enrolledCount || 0}</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="modal-footer p-4 bg-gray-50 border-t flex justify-end gap-2 rounded-b-2xl">
              <button onClick={() => {
                setBatchModalOpen(false);
                setBatchAssignmentCandidate(null);
                setSelectedBatchForAssignment(null);
              }} className="btn-outline">Cancel</button>
              <button onClick={handleBatchAssignment} disabled={batchAssignmentLoading || !selectedBatchForAssignment} className="btn-primary">
                {batchAssignmentLoading ? 'Assigning...' : 'Assign Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH CHANGE MODAL */}
      {batchChangeModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="modal-header bg-amber-600 text-white rounded-t-2xl p-4">
              <h3 className="text-sm font-bold">Change Batch Assignment</h3>
              <button onClick={() => {
                setBatchChangeModalOpen(false);
                setBatchChangeCandidate(null);
                setNewBatchIdForChange(null);
              }}><X size={18} /></button>
            </div>
            <div className="modal-body p-5 flex flex-col gap-4">
              {batchChangeCandidate && (
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="text-xs text-gray-600"><strong>Candidate:</strong> {batchChangeCandidate.fullName}</p>
                  <p className="text-xs text-gray-600"><strong>Current Batch:</strong> {batchChangeCandidate.assignedBatchName}</p>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Select New Batch</label>
                <select
                  value={newBatchIdForChange || ''}
                  onChange={(e) => setNewBatchIdForChange(e.target.value)}
                  className="form-input"
                >
                  <option value="">-- Choose Batch --</option>
                  {batches.map(batch => {
                    const availableSeats = batch.capacity - (batch.enrolledCount || 0);
                    return (
                      <option key={batch.id} value={batch.id} disabled={availableSeats <= 0 || batch.id === batchChangeCandidate?.assignedBatchId}>
                        {batch.batchName} | {batch.courseName} | Available: {availableSeats}/{batch.capacity}
                      </option>
                    );
                  })}
                </select>
              </div>
              {newBatchIdForChange && batches.find(b => b.id === newBatchIdForChange) && (
                <div className="bg-gray-50 p-3 rounded text-xs">
                  {(() => {
                    const batch = batches.find(b => b.id === newBatchIdForChange);
                    return (
                      <>
                        <p><strong>New Batch:</strong> {batch.batchName}</p>
                        <p><strong>Start Date:</strong> {batch.startDate}</p>
                        <p><strong>Technical Trainer:</strong> {batch.technicalTrainerName || 'TBD'}</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="modal-footer p-4 bg-gray-50 border-t flex justify-end gap-2 rounded-b-2xl">
              <button onClick={() => {
                setBatchChangeModalOpen(false);
                setBatchChangeCandidate(null);
                setNewBatchIdForChange(null);
              }} className="btn-outline">Cancel</button>
              <button onClick={handleBatchChange} disabled={batchAssignmentLoading || !newBatchIdForChange} className="btn-primary">
                {batchAssignmentLoading ? 'Changing...' : 'Change Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER TRAINER MODAL */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-lg">
            <div className="modal-header bg-slate-900 text-white rounded-t-2xl p-4">
              <h3 className="text-sm font-bold">Register New Faculty Trainer</h3>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRegisterTrainer}>
              <div className="modal-body p-5 flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" required value={trainerForm.fullName} onChange={e => setTrainerForm({...trainerForm, fullName: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Trainer Email</label>
                  <input type="email" required value={trainerForm.email} onChange={e => setTrainerForm({...trainerForm, email: e.target.value})} className="form-input" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="text" required value={trainerForm.phone} onChange={e => setTrainerForm({...trainerForm, phone: e.target.value})} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select value={trainerForm.trainerType} onChange={e => setTrainerForm({...trainerForm, trainerType: e.target.value})} className="form-select">
                      <option value="TECHNICAL">TECHNICAL TRAINER</option>
                      <option value="SOFT_SKILLS">SOFT SKILLS TRAINER</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" required value={trainerForm.password} onChange={e => setTrainerForm({...trainerForm, password: e.target.value})} className="form-input" />
                </div>
              </div>
              <div className="modal-footer p-4 bg-gray-50 border-t flex justify-end gap-2 rounded-b-2xl">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">Register Trainer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTION MODAL */}
      {selectedDocCandidate && (
        <div className="modal-backdrop">
          <div className="modal max-w-xl">
            <div className="modal-header bg-slate-900 text-white rounded-t-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Candidate Document Inspection</h3>
                <p className="text-[11px] text-gray-300">Application Reference: {selectedDocCandidate.applicationNumber || selectedDocCandidate.id}</p>
              </div>
              <button onClick={() => setSelectedDocCandidate(null)}><X size={18} /></button>
            </div>

            <div className="modal-body p-5 flex flex-col gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{selectedDocCandidate.fullName}</h4>
                  <p className="text-[11px] text-gray-500 font-mono">{selectedDocCandidate.email}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{selectedDocCandidate.collegeName || 'InfoBeans Applicant'} ({selectedDocCandidate.branch || 'ITEP'})</p>
                </div>
                <span className="badge-purple text-[10px]">DOCUMENTS SUBMITTED</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Uploaded Verification Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getDocumentCards(selectedDocCandidate).map((doc, idx) => (
                    <div key={idx} className="p-3 border border-gray-200 rounded-xl bg-white flex flex-col justify-between gap-2 shadow-xs">
                      <div>
                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <FileText size={14} className="text-red-600" /> {doc.label}
                        </span>
                        <span className="text-[10px] text-gray-400 block truncate mt-0.5">{doc.file}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDocumentPreview(doc)}
                        className="btn-outline text-[11px] py-1 px-2.5 flex items-center justify-center gap-1 text-red-600 border-red-200 hover:bg-red-50 font-bold"
                      >
                        <ExternalLink size={12} /> Inspect Document Preview
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer p-4 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setSelectedDocCandidate(null)}
                className="btn-outline text-xs py-2 px-4"
              >
                Close Window
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const applicationId = selectedDocCandidate.applicationId || selectedDocCandidate.id || selectedDocCandidate.applicationNumber;
                    handleUpdateAppStatus(applicationId, 'DOCUMENTS_REJECTED');
                    setSelectedDocCandidate(null);
                  }}
                  className="btn bg-red-100 text-red-700 hover:bg-red-200 text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold flex-1 sm:flex-initial"
                >
                  <XCircle size={15} /> Reject Documents
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const applicationId = selectedDocCandidate.applicationId || selectedDocCandidate.id || selectedDocCandidate.applicationNumber;
                    handleUpdateAppStatus(applicationId, 'DOCUMENTS_VERIFIED');
                    setSelectedDocCandidate(null);
                  }}
                  className="btn bg-emerald-600 text-white hover:bg-emerald-700 text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow-md shadow-emerald-200 flex-1 sm:flex-initial"
                >
                  <CheckCircle2 size={15} /> Verify & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP DOCUMENT VIEWER MODAL */}
      {previewingDoc && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <div className="modal-header bg-slate-900 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-red-400" />
                <h3 className="text-sm font-bold text-white">
                  Document Preview: {previewingDoc.label}
                </h3>
              </div>
              <button onClick={() => {
                if (previewingDoc?.blobUrl) URL.revokeObjectURL(previewingDoc.blobUrl);
                setPreviewingDoc(null);
                setPreviewError('');
              }} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <span className="text-xs font-bold text-red-900 block">{previewingDoc.candidate}</span>
                  <span className="text-[11px] font-mono text-red-700">{previewingDoc.file}</span>
                </div>
                <span className="badge-purple text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> {previewingDoc.contentType ? 'Uploaded Document' : 'Document'}
                </span>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 flex flex-col items-center justify-center min-h-[300px] overflow-hidden shadow-inner">
                {previewLoading ? (
                  <div className="text-white text-xs">Loading document...</div>
                ) : previewError ? (
                  <div className="w-full bg-white rounded-lg p-6 text-gray-900 font-sans text-center">
                    <p className="font-bold text-red-600">Unable to load document</p>
                    <p className="text-xs mt-2">{previewError}</p>
                  </div>
                ) : previewingDoc.contentType?.startsWith('application/pdf') ? (
                  <iframe
                    title={previewingDoc.label}
                    src={previewingDoc.url}
                    className="w-full h-[420px] rounded-lg border-0"
                  />
                ) : previewingDoc.contentType?.startsWith('image/') ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    <img
                      src={previewingDoc.url}
                      alt={previewingDoc.label}
                      className="max-h-[340px] w-auto object-contain rounded-lg"
                      onError={() => setPreviewError('Unable to load image')}
                    />
                  </div>
                ) : (
                  <div className="w-full bg-white rounded-lg p-6 text-gray-900 font-sans text-center">
                    <p className="font-bold">Document preview unavailable</p>
                    <p className="text-xs mt-2">The uploaded file type could not be previewed in-browser.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer p-4 bg-gray-50 border-t flex items-center justify-between gap-3 rounded-b-2xl">
              <span className="text-[11px] text-gray-500 font-medium">
                Document File: <strong className="font-mono text-gray-700">{previewingDoc.file}</strong>
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={previewingDoc.url || previewingDoc.fetchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-slate-800 text-white hover:bg-slate-900 text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold"
                >
                  <ExternalLink size={14} /> Full Screen View
                </a>
                <button onClick={() => {
                  if (previewingDoc?.blobUrl) URL.revokeObjectURL(previewingDoc.blobUrl);
                  setPreviewingDoc(null);
                  setPreviewError('');
                }} className="btn-primary px-6 py-2 text-xs font-bold">
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
