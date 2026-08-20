import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, Chip, CircularProgress, Card, Alert } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LockIcon from '@mui/icons-material/Lock';
import toast from 'react-hot-toast';
import { aptitudeApi } from '../../api/apiServices';
import { Link, useNavigate } from 'react-router-dom';

const DEFAULT_QUESTIONS = [];
const APTITUDE_STORAGE_KEY = 'spt_aptitude_progress';

export default function AptitudeTestPage() {
  const navigate = useNavigate();
  const [candidateId, setCandidateId] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [alreadyAttemptedResult, setAlreadyAttemptedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const resetAptitudeProgress = (keepCandidate = false) => {
    setTestStarted(false);
    setQuestions(DEFAULT_QUESTIONS);
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(1800);
    setSubmitted(false);
    setScore(null);
    setAlreadyAttempted(false);
    setAlreadyAttemptedResult(null);
    setErrorMessage('');
    setScheduleInfo(null);
    setCountdown(0);

    if (!keepCandidate) {
      setCandidateId('');
    }

    sessionStorage.removeItem(APTITUDE_STORAGE_KEY);
  };

  useEffect(() => {
    // Clear any previous aptitude session cache on mount so that Application ID entry page ALWAYS appears
    sessionStorage.removeItem(APTITUDE_STORAGE_KEY);
  }, []);

  // Live Exam Test Timer
  useEffect(() => {
    let timer;
    if (testStarted && !submitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, submitted, timeLeft]);

  // Live Countdown Timer to Exam Start Time
  useEffect(() => {
    let timer;
    if (scheduleInfo?.scheduled && !scheduleInfo?.canStart && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setScheduleInfo(curr => curr ? { ...curr, canStart: true } : null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [scheduleInfo?.scheduled, scheduleInfo?.canStart, countdown]);

  const startExamSession = async (candidateIdClean, preloadedDuration = null) => {
    setLoading(true);
    try {
      // Start/Resume attempt in backend
      const startRes = await aptitudeApi.startTest(candidateIdClean);
      const attemptData = startRes.data || {};

      // Fetch Active Questions
      const qRes = await aptitudeApi.getQuestions();
      const serverQuestions = qRes.data || [];

      if (serverQuestions.length === 0) {
        setErrorMessage('No active aptitude questions available. Please contact administrator.');
        toast.error('No active aptitude questions available');
        return;
      }

      const mapped = serverQuestions.map((q) => ({
        id: q.id,
        text: q.question,
        options: [q.optionA, q.optionB, q.optionC, q.optionD]
      }));

      setQuestions(mapped.length ? mapped : DEFAULT_QUESTIONS);
      setCurrentIndex(0);
      setAnswers({});
      
      const secondsLeft = attemptData.remainingSeconds != null
        ? attemptData.remainingSeconds
        : (preloadedDuration != null ? preloadedDuration : 1800);
      setTimeLeft(secondsLeft);
      setTestStarted(true);
      toast.success('Aptitude Exam started!');
    } catch (err) {
      console.error('Start exam session error', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to start examination.';
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Application ID Verification & Continuing to Exam
  const handleVerifyAndContinue = async (e) => {
    if (e) e.preventDefault();
    const candidateIdClean = candidateId.trim();
    if (!candidateIdClean) {
      setErrorMessage('Please enter your Application ID.');
      toast.error('Please enter your Application ID');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setAlreadyAttempted(false);
    setAlreadyAttemptedResult(null);
    setScheduleInfo(null);
    setCountdown(0);

    try {
      // 1. Verify Application ID & Admin Schedule & Previous Attempt
      const res = await aptitudeApi.checkEligibility(candidateIdClean);
      const data = res.data;

      // 2. Check if already attempted
      if (data.alreadyAttempted) {
        setTestStarted(false);
        setAlreadyAttempted(true);
        setAlreadyAttemptedResult(data.previousResult);
        toast.error('You have already given the aptitude test.');
        return;
      }

      // 3. Check if scheduled for a future time
      if (data.scheduled && !data.canStart) {
        setTestStarted(false);
        setScheduleInfo(data);
        setCountdown(data.remainingSecondsToStart || 0);
        return;
      }

      // 4. Check if eligible to start
      if (!data.eligible && !data.canStart) {
        setTestStarted(false);
        const errMsg = data.message || 'Aptitude test has not been scheduled yet. Please wait for the administrator to schedule your test.';
        setErrorMessage(errMsg);
        toast.error(errMsg);
        return;
      }

      // 5. Start / Resume Exam directly
      await startExamSession(candidateIdClean, data.remainingSecondsForExam);
    } catch (err) {
      console.error('Application verification error', err);
      let errMsg = err?.response?.data?.message || err?.message || 'Unable to verify Application ID. Please try again.';
      if (err?.response?.status === 404 || errMsg.toLowerCase().includes('not found')) {
        errMsg = 'Application ID not found. Please enter a valid Application ID.';
      }
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId, optionLetter) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionLetter }));
  };

  const handleSubmitTest = async () => {
    setLoading(true);
    try {
      const answersArray = Object.keys(answers).map((questionId) => ({
        questionId: String(questionId),
        selectedAnswer: String(answers[questionId] || '')
      }));

      const payload = {
        candidateId: candidateId.trim(),
        assessmentId: 'APTITUDE',
        answers: answersArray
      };

      await aptitudeApi.submitTest(payload);

      setSubmitted(true);
      setScore(null);
      sessionStorage.removeItem(APTITUDE_STORAGE_KEY);

      toast.success('Aptitude Test submitted successfully!');
      navigate(`/result?candidateId=${encodeURIComponent(candidateId.trim())}`);
    } catch (err) {
      console.error('Submit test error', err);
      const errMsg = err?.response?.data?.message || 'Failed to submit exam. Please try again or contact support.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const isPassed = score !== null && score >= 40;

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: 5, fontWait: 500 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: 'var(--primary)', fontWeight: 700 }}>
            Back to Home
          </Button>
        </Box>

        {/* 1. APPLICATION ID ENTRY / VERIFICATION PAGE */}
        {!testStarted ? (
          <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
              Aptitude Test
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
              Enter your Application ID to continue.
            </Typography>

            <Box component="form" onSubmit={handleVerifyAndContinue} sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 480, mx: 'auto', textAlign: 'center', alignItems: 'center' }}>
              <div style={{ width: '100%', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Application ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Application ID (e.g. APP-2026-000044)"
                  value={candidateId}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    if (nextValue !== candidateId) {
                      resetAptitudeProgress(true);
                      setCandidateId(nextValue);
                    }
                  }}
                  className="form-input"
                  style={{ padding: '14px 18px', fontSize: '1rem', textAlign: 'left', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {alreadyAttempted && (
                <Box sx={{ width: '100%', textAlign: 'left' }}>
                  <Alert severity="info" icon={<LockIcon />} sx={{ textAlign: 'left', mb: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      You have already given the aptitude test.
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#1e293b' }}>
                      A completed aptitude test submission exists for Application ID: <strong>{candidateId}</strong>. Candidates cannot re-attempt the test.
                    </Typography>
                  </Alert>

                  {alreadyAttemptedResult && (
                    <Card sx={{ p: 2.5, background: alreadyAttemptedResult.status === 'PASS' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${alreadyAttemptedResult.status === 'PASS' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 2, textAlign: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Your Saved Score
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: alreadyAttemptedResult.status === 'PASS' ? 'var(--success-dark)' : 'var(--primary-dark)', my: 0.5 }}>
                        {alreadyAttemptedResult.marksObtained ?? 0} / {alreadyAttemptedResult.totalMarks ?? 0}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: alreadyAttemptedResult.status === 'PASS' ? 'var(--success)' : 'var(--primary-dark)' }}>
                        Status: {alreadyAttemptedResult.status === 'PASS' ? 'PASSED (QUALIFIED FOR DOCUMENT UPLOAD)' : 'NEEDS IMPROVEMENT'}
                      </Typography>
                    </Card>
                  )}

                  {alreadyAttemptedResult?.status === 'PASS' && (
                    <Button
                      component={Link}
                      to={`/documentation?candidateId=${encodeURIComponent(candidateId.trim())}`}
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      sx={{ background: 'var(--primary)', px: 3, py: 1.2, fontWeight: 700, borderRadius: '8px', '&:hover': { background: 'var(--primary-dark)' }, width: '100%', mb: 1 }}
                    >
                      Proceed to Upload Documents
                    </Button>
                  )}
                </Box>
              )}

              {scheduleInfo && !scheduleInfo.canStart && (
                <Box sx={{ width: '100%', textAlign: 'left' }}>
                  <Alert severity="warning" icon={<TimerIcon />} sx={{ textAlign: 'left', mb: 2, borderRadius: 2, background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e', mb: 0.5 }}>
                      Aptitude Exam Scheduled
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#78350f' }}>
                      {scheduleInfo.message || `Your exam starts on ${scheduleInfo.testDate} at ${scheduleInfo.startTime}.`}
                    </Typography>
                  </Alert>

                  <Card sx={{ p: 3, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                      Time Remaining Until Exam Starts
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', my: 1, fontFamily: 'monospace' }}>
                      {(() => {
                        const totalSec = countdown > 0 ? countdown : (scheduleInfo.remainingSecondsToStart || 0);
                        const h = Math.floor(totalSec / 3600);
                        const m = Math.floor((totalSec % 3600) / 60);
                        const s = totalSec % 60;
                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                      })()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Scheduled Start Time: <strong>{scheduleInfo.startTime}</strong> (IST)
                    </Typography>
                  </Card>
                </Box>
              )}

              {errorMessage && !alreadyAttempted && (
                <Alert severity="error" icon={<LockIcon />} sx={{ textAlign: 'left', width: '100%', borderRadius: 2 }}>
                  {errorMessage}
                </Alert>
              )}

              <Box sx={{ width: '100%', pt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || (scheduleInfo && !scheduleInfo.canStart)}
                  startIcon={scheduleInfo && !scheduleInfo.canStart ? <LockIcon /> : null}
                  sx={{
                    borderRadius: '8px',
                    px: 4,
                    py: 1.4,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    background: (scheduleInfo && scheduleInfo.canStart) ? 'var(--success, #16a34a)' : 'var(--primary, #d80202)',
                    '&:hover': {
                      background: (scheduleInfo && scheduleInfo.canStart) ? 'var(--success-dark, #15803d)' : 'var(--primary-dark, #b70000)',
                    },
                    '&.Mui-disabled': {
                      background: '#e2e8f0',
                      color: '#94a3b8',
                    },
                    width: '100%',
                    boxShadow: 'none',
                  }}
                >
                  {loading
                    ? 'Verifying...'
                    : (scheduleInfo && !scheduleInfo.canStart)
                    ? `Exam Starts at ${scheduleInfo.startTime || 'Scheduled Time'}`
                    : (scheduleInfo && scheduleInfo.canStart)
                    ? 'START EXAM'
                    : 'Continue'}
                </Button>
              </Box>
            </Box>
          </Paper>
        ) : submitted ? (
          <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center', background: '#fff' }}>
            <Box sx={{ w: 72, h: 72, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: isPassed ? 'var(--success)' : 'var(--primary)' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
              {isPassed ? 'Aptitude Test Passed! 🎉' : 'Test Submitted'}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#475569', mb: 3, textAlign: 'center' }}>
              Candidate ID: <strong>{candidateId}</strong>
            </Typography>

            <Card sx={{ p: 3, maxWidth: 380, mx: 'auto', background: isPassed ? '#f0fdf4' : 'var(--primary-light)', border: `1px solid ${isPassed ? '#bbf7d0' : 'rgba(220,38,38,0.12)'}`, mb: 4, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: isPassed ? 'var(--success-dark)' : 'var(--primary-dark)', textAlign: 'center' }}>
                {score} / {questions.length * 10}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: isPassed ? 'var(--success)' : 'var(--primary-dark)', mt: 1, textAlign: 'center' }}>
                Status: {isPassed ? 'PASSED (QUALIFIED FOR DOCUMENT UPLOAD)' : 'NEEDS IMPROVEMENT'}
              </Typography>
            </Card>

            {isPassed ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Alert severity="success" sx={{ maxWidth: 500, mb: 2, textAlign: 'center' }}>
                  Congratulations! You have passed the Aptitude Exam. You are now unlocked and eligible to upload your verification documents.
                </Alert>
                <Button
                  component={Link}
                  to={`/documentation?candidateId=${candidateId}`}
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  sx={{ background: 'var(--primary)', px: 4, py: 1.4, fontWeight: 800, fontSize: '1rem', borderRadius: '50px', '&:hover': { background: 'var(--primary-dark)' } }}
                >
                  Proceed to Upload Documents
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button component={Link} to="/" variant="outlined" sx={{ borderRadius: '50px' }}>
                  Return to Home
                </Button>
              </Box>
            )}
          </Paper>
        ) : (
          /* 2. EXISTING APTITUDE TEST MODULE (Questions, Timer, Radio Options, Navigation & Submit) */
          <Box>
            {/* Exam Header with Live Countdown Timer */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748b' }}>Application ID: <strong>{candidateId}</strong></Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Question {currentIndex + 1} of {questions.length}
                </Typography>
              </Box>

              <Chip
                icon={<TimerIcon />}
                label={formatTime(timeLeft)}
                sx={{
                  background: timeLeft < 180 ? 'var(--primary-light)' : '#f1f5f9',
                  color: timeLeft < 180 ? 'var(--primary)' : '#0f172a',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  py: 2.5, px: 2,
                  border: '1px solid',
                  borderColor: timeLeft < 180 ? 'rgba(220,38,38,0.12)' : '#cbd5e1'
                }}
              />
            </Paper>

            {/* Current Question Body Card */}
            {currentQ && (
              <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#1e293b', mb: 3 }}>
                  {currentIndex + 1}. {currentQ.text}
                </Typography>

                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleOptionChange(currentQ.id, e.target.value)}
                  >
                    {currentQ.options.map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][oIdx];
                      const isSelected = answers[currentQ.id] === letter;
                      return (
                        <Paper
                          key={oIdx}
                          variant="outlined"
                          onClick={() => handleOptionChange(currentQ.id, letter)}
                          sx={{
                            p: 2, mb: 2, borderRadius: 2, cursor: 'pointer',
                            borderColor: isSelected ? 'var(--primary)' : '#e2e8f0',
                            background: isSelected ? 'var(--primary-light)' : '#fff',
                            '&:hover': { borderColor: 'var(--primary)', background: '#fafafa' }
                          }}
                        >
                          <FormControlLabel
                            value={letter}
                            control={<Radio sx={{ color: 'var(--primary)', '&.Mui-checked': { color: 'var(--primary)' } }} />}
                            label={<Typography sx={{ fontWeight: isSelected ? 700 : 500, color: '#334155' }}><strong>{letter}.</strong> {opt}</Typography>}
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Paper>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              </Paper>
            )}

            {/* Bottom Question Navigation & Submit Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: '50px', px: 3 }}
              >
                Previous
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ background: 'var(--primary)', borderRadius: '50px', px: 4, '&:hover': { background: 'var(--primary-dark)' } }}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="contained"
                  disabled={loading}
                  onClick={handleSubmitTest}
                  endIcon={<SendIcon />}
                  sx={{ background: 'var(--success)', borderRadius: '50px', px: 4, py: 1.2, fontWeight: 800, '&:hover': { background: 'var(--success-dark)' } }}
                >
                  {loading ? 'Submitting...' : 'Submit Aptitude Exam'}
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
