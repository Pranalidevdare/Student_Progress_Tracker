import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeedbackByTrainer, submitStudentFeedback, getStudentFeedback } from '../api/feedbackApi';
import {
  MessageSquare, Star, User, Send, CheckCircle2, AlertCircle, HelpCircle,
  MessageCircle, Sparkles, Lock, Clock, UserCheck, ShieldCheck, ChevronRight,
  ThumbsUp, Target, BookOpen, Layers, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Feedback() {
  const { user } = useAuth();
  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const studentId = user?.id || user?.studentId || user?.email || 'STU001';
  const studentName = user?.fullName || 'Student Candidate';
  const studentBatchId = user?.batchId || user?.batch || 'BATCH001';
  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';

  const [activeTab, setActiveTab] = useState('GIVE_FEEDBACK'); // GIVE_FEEDBACK, FROM_TRAINERS, MY_FEEDBACK, QUERIES
  const [loading, setLoading] = useState(true);

  // Student Feedback Records from Backend
  const [studentFeedbacks, setStudentFeedbacks] = useState([]);
  // Trainer View Feedback List
  const [trainerFeedbacks, setTrainerFeedbacks] = useState([]);

  // Form State for Student -> Trainer Feedback
  const [trainerType, setTrainerType] = useState('TECHNICAL'); // TECHNICAL or SOFT_SKILL
  const [submitting, setSubmitting] = useState(false);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [commentsText, setCommentsText] = useState('');

  // 8 Parameter Ratings State (1 to 5 Stars)
  const [techRatings, setTechRatings] = useState({
    conceptClarity: 5,
    teachingQuality: 5,
    practicalExplanation: 5,
    doubtResolution: 5,
    paceOfTeaching: 4,
    industryRelevance: 5,
    interaction: 5,
    overallSatisfaction: 5
  });

  const [softRatings, setSoftRatings] = useState({
    communicationSkills: 5,
    sessionClarity: 5,
    engagement: 5,
    activityApproach: 4,
    confidenceBuilding: 5,
    individualAttention: 5,
    relevanceOfTopics: 5,
    overallSatisfaction: 5
  });

  // Query Form State
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [queryRecipient, setQueryRecipient] = useState('TECHNICAL');
  const [querySubject, setQuerySubject] = useState('');
  const [queryDescription, setQueryDescription] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);

  useEffect(() => {
    fetchData();
  }, [isStudent, studentId, trainerId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const res = await getStudentFeedback(studentId);
        setStudentFeedbacks(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await getFeedbackByTrainer(trainerId);
        setTrainerFeedbacks(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
      toast.error('Unable to load feedback data.');
    } finally {
      setLoading(false);
    }
  };

  // Compute Overall Rating for Form
  const computeCalculatedRating = () => {
    const currentRatings = trainerType === 'TECHNICAL' ? techRatings : softRatings;
    const values = Object.values(currentRatings);
    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length).toFixed(1);
  };

  const handleStarChange = (paramKey, value) => {
    if (trainerType === 'TECHNICAL') {
      setTechRatings(prev => ({ ...prev, [paramKey]: value }));
    } else {
      setSoftRatings(prev => ({ ...prev, [paramKey]: value }));
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const overallVal = parseFloat(computeCalculatedRating());
      const assignedTrainerName = trainerType === 'TECHNICAL' ? 'Technical Trainer' : 'Soft Skill Specialist';

      const payload = {
        studentId,
        studentName,
        trainerId: trainerType === 'TECHNICAL' ? 'TRAINER_TECH' : 'TRAINER_SOFT',
        trainerName: assignedTrainerName,
        batchId: studentBatchId,
        trainerType,
        direction: 'STUDENT_TO_TRAINER',
        rating: Math.round(overallVal),
        overallRating: overallVal,
        subject: subjectTitle.trim() || `${trainerType === 'TECHNICAL' ? 'Technical' : 'Soft Skill'} Session Feedback`,
        comments: commentsText.trim() || 'No written comments provided.',
        status: 'SUBMITTED'
      };

      await submitStudentFeedback(payload);
      toast.success('Feedback submitted successfully!');
      setCommentsText('');
      setSubjectTitle('');
      fetchData();
      setActiveTab('MY_FEEDBACK');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    setSubmittingQuery(true);
    try {
      const payload = {
        studentId,
        studentName,
        trainerId: queryRecipient === 'TECHNICAL' ? 'TRAINER_TECH' : 'TRAINER_SOFT',
        trainerName: queryRecipient === 'TECHNICAL' ? 'Technical Trainer' : 'Soft Skill Trainer',
        batchId: studentBatchId,
        trainerType: queryRecipient,
        direction: 'QUERY',
        subject: querySubject.trim(),
        comments: queryDescription.trim(),
        status: 'OPEN'
      };

      await submitStudentFeedback(payload);
      toast.success('Query submitted to trainer!');
      setQuerySubject('');
      setQueryDescription('');
      setQueryModalOpen(false);
      fetchData();
      setActiveTab('QUERIES');
    } catch (err) {
      console.error('Failed to submit query:', err);
      toast.error('Failed to submit query.');
    } finally {
      setSubmittingQuery(false);
    }
  };

  const renderStarRatingInput = (label, paramKey, currentVal) => {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-200/80">
        <span className="text-xs font-bold text-gray-800">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starNum) => (
            <button
              key={starNum}
              type="button"
              onClick={() => handleStarChange(paramKey, starNum)}
              className="p-1 transition hover:scale-110"
            >
              <Star
                size={18}
                className={starNum <= currentVal ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
              />
            </button>
          ))}
          <span className="text-xs font-bold text-amber-700 ml-1.5 min-w-[20px]">{currentVal}/5</span>
        </div>
      </div>
    );
  };

  const renderStarsReadOnly = (ratingVal = 5) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.round(ratingVal) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
      />
    ));
  };

  // Filter Subscribed Student Records
  const submittedFeedbacks = studentFeedbacks.filter(f => f.direction === 'STUDENT_TO_TRAINER' || !f.direction);
  const trainerEvaluations = studentFeedbacks.filter(f => f.direction === 'TRAINER_TO_STUDENT');
  const studentQueries = studentFeedbacks.filter(f => f.direction === 'QUERY');

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto font-sans pb-12">
      {/* Top Banner Header */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-500/20 rounded-xl text-teal-300 border border-teal-400/30">
              <MessageCircle size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Feedback & Queries</h1>
          </div>
          <p className="text-xs text-teal-200/80 max-w-xl">
            {isStudent
              ? 'Share your experience with your trainers and view feedback received from your trainers.'
              : 'Review feedback and rating submissions from batch candidates.'}
          </p>
        </div>

        {isStudent && (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-white">{studentName}</p>
              <p className="text-[10px] text-teal-200 font-mono">Batch: {studentBatchId}</p>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded text-teal-300 border border-teal-300/30 ml-1">
              STUDENT
            </span>
          </div>
        )}
      </div>

      {/* STUDENT PORTAL TAB NAVIGATION */}
      {isStudent && (
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {[
            { id: 'GIVE_FEEDBACK', label: 'Give Feedback', icon: Send },
            { id: 'FROM_TRAINERS', label: 'Feedback From Trainers', icon: ShieldCheck, badge: trainerEvaluations.length },
            { id: 'MY_FEEDBACK', label: 'My Submitted Feedback', icon: CheckCircle2, badge: submittedFeedbacks.length },
            { id: 'QUERIES', label: 'Queries & Doubts', icon: HelpCircle, badge: studentQueries.length }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-950/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-white text-teal-900 font-extrabold' : 'bg-gray-200 text-gray-700 font-bold'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* OVERVIEW STATS (For Student) */}
      {isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 text-center border-l-4 border-l-teal-600 bg-teal-50/30">
            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Feedback Given</span>
            <span className="text-xl font-black text-teal-900">{submittedFeedbacks.length}</span>
          </div>

          <div className="card p-4 text-center border-l-4 border-l-indigo-600 bg-indigo-50/30">
            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Trainer Feedback Received</span>
            <span className="text-xl font-black text-indigo-900">{trainerEvaluations.length}</span>
          </div>

          <div className="card p-4 text-center border-l-4 border-l-amber-600 bg-amber-50/30">
            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Queries Submitted</span>
            <span className="text-xl font-black text-amber-900">{studentQueries.length}</span>
          </div>

          <div className="card p-4 text-center border-l-4 border-l-purple-600 bg-purple-50/30">
            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Average Rating Given</span>
            <span className="text-xl font-black text-purple-900">
              {submittedFeedbacks.length > 0
                ? (submittedFeedbacks.reduce((acc, f) => acc + (f.overallRating || f.rating || 5), 0) / submittedFeedbacks.length).toFixed(1)
                : '5.0'} / 5
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-16 text-center">
          <div className="spinner w-8 h-8 border-teal-600 mx-auto" />
          <p className="text-xs text-gray-400 mt-3 font-semibold">Loading feedback records...</p>
        </div>
      ) : isStudent ? (
        /* ================= STUDENT PORTAL VIEWS ================= */
        <div className="space-y-6">

          {/* TAB 1: GIVE FEEDBACK */}
          {activeTab === 'GIVE_FEEDBACK' && (
            <div className="card p-6 border-t-4 border-t-teal-600 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">Rate Your Session Trainer</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Your honest rating helps improve course delivery and trainer effectiveness.</p>
                </div>

                <div className="flex items-center gap-2 bg-teal-50 p-1.5 rounded-xl border border-teal-200 text-xs">
                  <span className="text-gray-500 font-bold px-2">Select Trainer Type:</span>
                  <button
                    type="button"
                    onClick={() => setTrainerType('TECHNICAL')}
                    className={`px-3 py-1 rounded-lg font-extrabold text-xs transition ${
                      trainerType === 'TECHNICAL' ? 'bg-teal-700 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Technical Trainer
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrainerType('SOFT_SKILL')}
                    className={`px-3 py-1 rounded-lg font-extrabold text-xs transition ${
                      trainerType === 'SOFT_SKILL' ? 'bg-teal-700 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Soft Skill Trainer
                  </button>
                </div>
              </div>

              {/* TRAINER & BATCH CONTEXT INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Trainer Type</span>
                  <span className="font-extrabold text-teal-800">{trainerType === 'TECHNICAL' ? 'Technical Trainer' : 'Soft Skill Trainer'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Assigned Faculty</span>
                  <span className="font-extrabold text-gray-900">{trainerType === 'TECHNICAL' ? 'Default Technical Trainer' : 'Default Soft Skill Trainer'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Target Batch</span>
                  <span className="font-mono font-bold text-red-700 flex items-center gap-1">
                    {studentBatchId} <Lock size={12} className="text-gray-400" />
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div className="form-group">
                  <label className="form-label text-xs font-bold">Feedback Subject / Session Title</label>
                  <input
                    type="text"
                    placeholder={trainerType === 'TECHNICAL' ? "e.g. Java Streams & Spring Boot REST API Feedback" : "e.g. Business Communication & Interview Presentation"}
                    value={subjectTitle}
                    onChange={(e) => setSubjectTitle(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                {/* 8 PARAMETERS RATING GRID */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">
                    SESSION PARAMETER EVALUATION (1 - 5 STARS)
                  </h3>

                  {trainerType === 'TECHNICAL' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {renderStarRatingInput("1. Subject / Concept Clarity", "conceptClarity", techRatings.conceptClarity)}
                      {renderStarRatingInput("2. Teaching Quality", "teachingQuality", techRatings.teachingQuality)}
                      {renderStarRatingInput("3. Practical / Coding Explanation", "practicalExplanation", techRatings.practicalExplanation)}
                      {renderStarRatingInput("4. Doubt Resolution", "doubtResolution", techRatings.doubtResolution)}
                      {renderStarRatingInput("5. Pace of Teaching", "paceOfTeaching", techRatings.paceOfTeaching)}
                      {renderStarRatingInput("6. Industry Relevance", "industryRelevance", techRatings.industryRelevance)}
                      {renderStarRatingInput("7. Interaction & Engagement", "interaction", techRatings.interaction)}
                      {renderStarRatingInput("8. Overall Satisfaction", "overallSatisfaction", techRatings.overallSatisfaction)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {renderStarRatingInput("1. Communication Skills", "communicationSkills", softRatings.communicationSkills)}
                      {renderStarRatingInput("2. Session Clarity", "sessionClarity", softRatings.sessionClarity)}
                      {renderStarRatingInput("3. Engagement", "engagement", softRatings.engagement)}
                      {renderStarRatingInput("4. Activity / Practical Approach", "activityApproach", softRatings.activityApproach)}
                      {renderStarRatingInput("5. Confidence Building", "confidenceBuilding", softRatings.confidenceBuilding)}
                      {renderStarRatingInput("6. Individual Attention", "individualAttention", softRatings.individualAttention)}
                      {renderStarRatingInput("7. Relevance of Topics", "relevanceOfTopics", softRatings.relevanceOfTopics)}
                      {renderStarRatingInput("8. Overall Satisfaction", "overallSatisfaction", softRatings.overallSatisfaction)}
                    </div>
                  )}
                </div>

                {/* OVERALL CALCULATED SCORE */}
                <div className="bg-teal-50/80 p-4 rounded-2xl border border-teal-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-teal-950 uppercase block">Calculated Overall Rating</span>
                    <p className="text-[11px] text-teal-800">Computed automatically from your parameter scores.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">{renderStarsReadOnly(parseFloat(computeCalculatedRating()))}</div>
                    <span className="text-lg font-black text-teal-900">{computeCalculatedRating()} / 5</span>
                  </div>
                </div>

                {/* COMMENTS TEXTAREA */}
                <div className="form-group">
                  <label className="form-label text-xs font-bold">Additional Comments & Suggestions</label>
                  <textarea
                    rows="3"
                    placeholder="Share your experience, suggestions, or anything that could help improve future sessions..."
                    value={commentsText}
                    onChange={(e) => setCommentsText(e.target.value)}
                    className="form-textarea text-xs"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={submitting} className="btn bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md flex items-center gap-2">
                    {submitting ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Send size={16} />}
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: FEEDBACK FROM TRAINERS */}
          {activeTab === 'FROM_TRAINERS' && (
            <div className="space-y-4">
              {trainerEvaluations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trainerEvaluations.map((item) => (
                    <div key={item.id} className="card p-6 space-y-4 border-t-4 border-t-indigo-600 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="badge bg-indigo-50 text-indigo-700 font-extrabold text-[10px]">
                            {item.trainerType === 'TECHNICAL' ? 'Technical Trainer Evaluation' : 'Soft Skill Evaluation'}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-gray-900">{item.trainerName || 'Faculty Instructor'}</h3>
                          <p className="text-xs text-indigo-700 font-semibold">{item.subject || 'Student Academic Evaluation'}</p>
                        </div>

                        {item.strengths && (
                          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-1">
                            <span className="font-extrabold text-emerald-900 block">✓ Key Strengths</span>
                            <p className="text-emerald-800 leading-relaxed">{item.strengths}</p>
                          </div>
                        )}

                        {item.areasForImprovement && (
                          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs space-y-1">
                            <span className="font-extrabold text-amber-900 block">• Areas for Improvement</span>
                            <p className="text-amber-800 leading-relaxed">{item.areasForImprovement}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-900">Trainer Remarks: </span>"{item.comments || item.trainerRemarks || 'Good progress shown in coursework.'}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-800">No Trainer Feedback Yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Your trainer evaluations and performance feedback will appear here once submitted by your instructors.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY SUBMITTED FEEDBACK */}
          {activeTab === 'MY_FEEDBACK' && (
            <div className="space-y-4">
              {submittedFeedbacks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submittedFeedbacks.map((item) => (
                    <div key={item.id} className="card p-5 space-y-3 flex flex-col justify-between border-t-4 border-t-teal-600">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="badge bg-teal-50 text-teal-800 font-bold text-[10px]">
                            {item.trainerType === 'TECHNICAL' ? 'Technical Trainer' : 'Soft Skill Trainer'}
                          </span>
                          <div className="flex items-center gap-1">
                            {renderStarsReadOnly(item.overallRating || item.rating || 5)}
                            <span className="text-xs font-extrabold text-teal-900 ml-1">{item.overallRating || item.rating || 5}/5</span>
                          </div>
                        </div>

                        <h3 className="text-sm font-extrabold text-gray-900">{item.subject || 'Session Feedback'}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                          "{item.comments || 'No additional comments provided.'}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                        <span>Submitted for: {item.trainerName || 'Faculty Trainer'}</span>
                        <span className="badge-gray">{item.status || 'SUBMITTED'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-800">No Feedback Submitted Yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    You haven't submitted any feedback for your technical or soft skill trainers yet.
                  </p>
                  <button onClick={() => setActiveTab('GIVE_FEEDBACK')} className="btn bg-teal-700 text-white font-bold text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5">
                    <Send size={14} />
                    <span>Give Feedback Now</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUERIES & DOUBTS */}
          {activeTab === 'QUERIES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900">Queries & Academic Doubts</h2>
                  <p className="text-xs text-gray-500">Ask questions directly to your technical or soft skill trainers.</p>
                </div>

                <button onClick={() => setQueryModalOpen(true)} className="btn bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5">
                  <Plus size={16} />
                  <span>Ask a Query</span>
                </button>
              </div>

              {studentQueries.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {studentQueries.map((item) => (
                    <div key={item.id} className="card p-5 space-y-3 border-l-4 border-l-amber-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="badge bg-amber-50 text-amber-800 font-extrabold text-[10px]">
                            To: {item.trainerType === 'TECHNICAL' ? 'Technical Trainer' : 'Soft Skill Trainer'}
                          </span>
                          <h3 className="text-sm font-extrabold text-gray-900">{item.subject}</h3>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status || 'OPEN'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {item.comments}
                      </p>

                      {item.trainerResponse && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                          <span className="font-extrabold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 size={14} className="text-emerald-600" /> Trainer Reply:
                          </span>
                          <p className="text-emerald-800 leading-relaxed">{item.trainerResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <HelpCircle size={24} />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-800">No Queries Submitted</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Have doubts regarding technical concepts or soft skill sessions? Ask your trainer directly.
                  </p>
                  <button onClick={() => setQueryModalOpen(true)} className="btn bg-amber-600 text-white font-bold text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5">
                    <Plus size={14} />
                    <span>Ask a Query Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ================= TRAINER / ADMIN PORTAL VIEW ================= */
        <div className="space-y-6">
          <div className="page-header">
            <div>
              <h2 className="page-title">Student Feedback & Reviews</h2>
              <p className="page-subtitle">View ratings and comments submitted by candidates for your sessions.</p>
            </div>
          </div>

          {trainerFeedbacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trainerFeedbacks.map((item) => (
                <div key={item.id} className="card p-5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStarsReadOnly(item.rating || 5)}
                        <span className="text-xs font-bold text-gray-700 ml-1.5">{item.rating || 5}/5</span>
                      </div>
                      <span className="badge-blue">{item.subject || 'General'}</span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed italic">
                      "{item.comments || 'No written comments provided.'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium text-gray-600">
                      <User size={14} className="text-teal-600" />
                      {item.studentName || 'Student Candidate'}
                    </span>
                    <span className="badge-gray">{item.status || 'SUBMITTED'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="empty-state py-16">
                <div className="empty-icon"><MessageSquare size={32} /></div>
                <h4 className="text-sm font-bold text-gray-700">No Student Feedback Received</h4>
                <p className="text-xs text-gray-400 max-w-sm">Feedback submitted by candidates for your batch lectures will automatically appear here.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ASK A QUERY MODAL */}
      {queryModalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-lg">
            <div className="modal-header">
              <h3 className="text-base font-bold text-gray-800">Ask an Academic Query / Doubt</h3>
              <button onClick={() => setQueryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuery}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label text-xs font-bold">Select Recipient Trainer *</label>
                  <select
                    value={queryRecipient}
                    onChange={(e) => setQueryRecipient(e.target.value)}
                    className="form-select text-xs font-bold"
                  >
                    <option value="TECHNICAL">Technical Trainer</option>
                    <option value="SOFT_SKILL">Soft Skill Trainer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs font-bold">Query Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Need clarification on JWT Refresh Token implementation"
                    value={querySubject}
                    onChange={(e) => setQuerySubject(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs font-bold">Query Description *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Provide detailed description of your question or doubt..."
                    value={queryDescription}
                    onChange={(e) => setQueryDescription(e.target.value)}
                    className="form-textarea text-xs"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Target Batch</span>
                  <span className="font-mono font-bold text-red-700">{studentBatchId} (READ ONLY)</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setQueryModalOpen(false)} className="btn-outline text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submittingQuery} className="btn bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl">
                  {submittingQuery ? <div className="spinner border-white border-t-transparent w-4 h-4" /> : <Send size={15} />}
                  <span>Submit Query</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
