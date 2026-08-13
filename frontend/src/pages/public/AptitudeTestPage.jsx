import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, Chip, CircularProgress, Card, Alert } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LockIcon from '@mui/icons-material/Lock';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import toast from 'react-hot-toast';
import { aptitudeApi, applicationApi } from '../../api/apiServices';
import { Link } from 'react-router-dom';

const DEFAULT_QUESTIONS = [];
const APTITUDE_STORAGE_KEY = 'spt_aptitude_progress';

export default function AptitudeTestPage() {
  const [candidateId, setCandidateId] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleVerified, setScheduleVerified] = useState(false);

  const resetAptitudeProgress = (keepCandidate = false) => {
    setTestStarted(false);
    setQuestions(DEFAULT_QUESTIONS);
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(900);
    setSubmitted(false);
    setScore(null);
    setScheduleVerified(false);

    if (!keepCandidate) {
      setCandidateId('');
    }

    sessionStorage.removeItem(APTITUDE_STORAGE_KEY);
  };

  useEffect(() => {
    const restoreSavedState = async () => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(APTITUDE_STORAGE_KEY) || 'null');
        if (!saved) return;

        setCandidateId(saved.candidateId || '');
        setTestStarted(Boolean(saved.testStarted));
        setQuestions(Array.isArray(saved.questions) ? saved.questions : DEFAULT_QUESTIONS);
        setCurrentIndex(Number.isInteger(saved.currentIndex) ? saved.currentIndex : 0);
        setAnswers(saved.answers || {});
        setTimeLeft(Number.isFinite(saved.timeLeft) ? saved.timeLeft : 900);
        setSubmitted(Boolean(saved.submitted));
        setScore(saved.score ?? null);
        setScheduleVerified(Boolean(saved.scheduleVerified));

        const currentCandidateId = String(saved.candidateId || '').trim();
        if (currentCandidateId && (Boolean(saved.submitted) || Boolean(saved.testStarted))) {
          try {
            const res = await applicationApi.getByAppNumber(currentCandidateId);
            const currentStatus = String(res?.data?.status || '');

            if (currentStatus === 'APTITUDE_PASSED') {
              resetAptitudeProgress(true);
              setCandidateId(currentCandidateId);
              sessionStorage.removeItem(APTITUDE_STORAGE_KEY);
              window.location.assign(`/documentation?candidateId=${encodeURIComponent(currentCandidateId)}`);
              return;
            }

            if (currentStatus === 'APTITUDE_SCHEDULED') {
              resetAptitudeProgress(true);
              setCandidateId(currentCandidateId);
            }
          } catch (err) {
            console.warn('Unable to validate aptitude state against backend', err);
          }
        }
      } catch (err) {
        console.warn('Unable to restore aptitude state', err);
      }
    };

    restoreSavedState();
  }, []);

  useEffect(() => {
    const payload = {
      candidateId,
      testStarted,
      questions,
      currentIndex,
      answers,
      timeLeft,
      submitted,
      score,
      scheduleVerified
    };

    if (!candidateId && !testStarted && !scheduleVerified && !submitted && questions.length === 0) {
      sessionStorage.removeItem(APTITUDE_STORAGE_KEY);
      return;
    }

    sessionStorage.setItem(APTITUDE_STORAGE_KEY, JSON.stringify(payload));
  }, [candidateId, testStarted, questions, currentIndex, answers, timeLeft, submitted, score, scheduleVerified]);

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

  const handleVerifySchedule = async (e) => {
    if (e) e.preventDefault();
    if (!candidateId.trim()) {
      toast.error('Please enter your Application Reference ID');
      return;
    }

    setLoading(true);
    try {
      const res = await applicationApi.getByAppNumber(candidateId.trim());
      const app = res.data;
      if (!app) {
        resetAptitudeProgress(true);
        setScheduleVerified(false);
        toast.error('Invalid application/reference ID');
        return;
      }

      const currentStatus = String(app?.status || '');

      if (currentStatus === 'APTITUDE_PASSED') {
        resetAptitudeProgress(true);
        setScheduleVerified(false);
        sessionStorage.removeItem(APTITUDE_STORAGE_KEY);
        toast.success('Aptitude already passed. Redirecting to document upload.');
        window.location.assign(`/documentation?candidateId=${encodeURIComponent(candidateId.trim())}`);
        return;
      }

      if (currentStatus !== 'APTITUDE_SCHEDULED') {
        resetAptitudeProgress(true);
        setScheduleVerified(false);
        toast.error('This application is not scheduled for an aptitude test');
        return;
      }

      setTestStarted(false);
      setSubmitted(false);
      setScore(null);
      setQuestions(DEFAULT_QUESTIONS);
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeft(900);
      sessionStorage.removeItem(APTITUDE_STORAGE_KEY);
      setScheduleVerified(true);
      toast.success('Exam Schedule Verified! Click "Begin Aptitude Now" to start your exam.');
    } catch (err) {
      console.error('Schedule verification error', err);
      setScheduleVerified(false);
      toast.error('Unable to verify schedule. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!candidateId.trim()) {
      toast.error('Please enter your Application Reference ID');
      return;
    }

    if (!scheduleVerified) {
      toast.error('Please verify your exam schedule first');
      return;
    }

    setLoading(true);
    try {
      // Request backend to create/start an aptitude attempt
      const res = await aptitudeApi.startTest(candidateId.trim());
      const result = res.data;

      // Fetch questions from backend
      const qRes = await aptitudeApi.getQuestions();
      const serverQuestions = qRes.data || [];

      if (serverQuestions.length === 0) {
        toast.error('No active aptitude questions available');
        return;
      }

      // Map backend question shape to local shape
      const mapped = serverQuestions.map((q) => ({
        id: q.id,
        text: q.question,
        options: [q.optionA, q.optionB, q.optionC, q.optionD]
      }));

      setQuestions(mapped.length ? mapped : DEFAULT_QUESTIONS);

      // Set duration to server-side duration (30 minutes) to avoid premature expiry
      setTimeLeft(30 * 60);

      // Save assessmentId for submit
      setTestStarted(true);
      toast.success('Aptitude Exam started!');
    } catch (err) {
      console.error('Start exam error', err);
      toast.error('Unable to start exam. Please contact support.');
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

      const res = await aptitudeApi.submitTest(payload);
      const result = res.data;

      setSubmitted(true);
      setScore(result.marksObtained || 0);

      toast.success('Aptitude Test submitted successfully!');
    } catch (err) {
      console.error('Submit test error', err);
      toast.error('Failed to submit exam. Please try again or contact support.');
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

        {!testStarted ? (
          <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
              Online Aptitude Examination Portal
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 4, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
              Enter your Application Reference ID to verify your admin-scheduled exam slot and start your 15-minute aptitude test.
            </Typography>

              <Box component="form" onSubmit={handleVerifySchedule} sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 480, mx: 'auto', textAlign: 'center', alignItems: 'center' }}>
              <input
                type="text"
                required
                placeholder="Enter Application Reference ID (e.g. APP7076)"
                value={candidateId}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  if (nextValue !== candidateId) {
                    resetAptitudeProgress(true);
                    setCandidateId(nextValue);
                  }
                  setScheduleVerified(false);
                }}
                className="form-input"
                style={{ padding: '14px 18px', fontSize: '1rem', textAlign: 'center', fontWeight: 600, width: '100%' }}
              />

              <Box sx={{ p: 2.5, background: 'var(--primary-light)', border: `1px solid rgba(220,38,38,0.12)`, borderRadius: 2, textAlign: 'center', width: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--primary-dark)', mb: 0.5, textAlign: 'center' }}>
                  Examination Rules & Guidelines:
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--primary-dark)', display: 'block', lineHeight: 1.6, textAlign: 'center' }}>
                  • Total Duration: 15 Minutes ({questions.length} Multiple Choice Questions)<br />
                  • Question Format: 4 Multiple Choice Options (Radio Button)<br />
                  • Passing Criteria: Score $\ge 40$ Points (Unlocks Document Upload Portal)
                </Typography>
              </Box>

              {scheduleVerified && (
                <Alert severity="success" icon={<EventAvailableIcon />} sx={{ textAlign: 'center', justifyContent: 'center', width: '100%' }}>
                  Exam Schedule Verified for <strong>{candidateId}</strong>! Slot is ACTIVE.
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', maxWidth: 340 }}>
                <Button
                  onClick={handleVerifySchedule}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    borderRadius: '50px',
                    px: 4,
                    py: 1.4,
                    fontWeight: 800,
                    width: '50%'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify Schedule'}
                </Button>

                <Button
                  onClick={handleStartExam}
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  disabled={!scheduleVerified || loading}
                  sx={{
                    background: 'var(--primary)',
                    '&:hover': { background: 'var(--primary-dark)' },
                    py: 1.6, px: 5,
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    borderRadius: '50px',
                    width: '50%',
                    boxShadow: '0 10px 20px rgba(220,38,38,0.25)'
                  }}
                >
                  Begin Aptitude Now
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
          <Box>
            {/* Exam Header with Live Countdown Timer */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748b' }}>Candidate Reference ID: <strong>{candidateId}</strong></Typography>
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

            {/* Question Card with 4 Radio Options */}
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
                Q{currentIndex + 1}. {currentQ.text}
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[currentQ.id] ?? ''}
                  onChange={(e) => handleOptionChange(currentQ.id, e.target.value)}
                >
                  {currentQ.options.map((opt, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx);

                    return (
                      <Paper
                        key={idx}
                        elevation={0}
                        onClick={() => handleOptionChange(currentQ.id, optionLetter)}
                        sx={{
                          p: 1.8, px: 2.5, mb: 1.5, borderRadius: 2.5,
                          border: '2px solid',
                          borderColor: answers[currentQ.id] === optionLetter ? 'var(--primary)' : '#e2e8f0',
                          background: answers[currentQ.id] === optionLetter ? 'var(--primary-light)' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <FormControlLabel
                          value={optionLetter}
                          control={<Radio color="error" />}
                          label={<Typography sx={{ fontWeight: 600, color: '#1e293b' }}>{optionLetter}. {opt}</Typography>}
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Paper>
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* Bottom Navigation Controls: Previous, Next, Submit */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                sx={{ borderRadius: '50px', px: 3, fontWeight: 700 }}
              >
                Previous
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  endIcon={<ArrowForwardIcon />}
                  variant="contained"
                  sx={{ background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' }, borderRadius: '50px', px: 4, fontWeight: 800 }}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitTest}
                  endIcon={<SendIcon />}
                  variant="contained"
                  sx={{ background: 'var(--success)', '&:hover': { background: 'var(--success-dark)' }, borderRadius: '50px', px: 4, fontWeight: 800 }}
                >
                  Submit Examination
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
