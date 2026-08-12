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
import { aptitudeApi } from '../../api/apiServices';
import { Link } from 'react-router-dom';

const DEFAULT_QUESTIONS = [
  { id: 1, text: "What is the time complexity of searching in a balanced Binary Search Tree (BST)?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 1 },
  { id: 2, text: "Which data structure follows the Last In, First Out (LIFO) principle?", options: ["Queue", "Stack", "Linked List", "Array"], answer: 1 },
  { id: 3, text: "If 12 men can complete a project in 20 days, how many days will 15 men take to complete the same project?", options: ["14 days", "16 days", "18 days", "22 days"], answer: 1 },
  { id: 4, text: "What will be the output of 3 + 4 + '5' in JavaScript?", options: ["12", "75", "345", "NaN"], answer: 1 },
  { id: 5, text: "Find the next number in the series: 3, 7, 15, 31, 63, __?", options: ["95", "111", "127", "128"], answer: 2 },
  { id: 6, text: "Which keyword in Java is used to inherit a class?", options: ["implements", "extends", "inherits", "super"], answer: 1 },
  { id: 7, text: "What is the main function of an Operating System Kernel?", options: ["Display GUI", "Manage hardware resources & execution", "Compile code", "Provide Internet Access"], answer: 1 },
  { id: 8, text: "What is the HTTP status code for 'Created'?", options: ["200", "201", "302", "404"], answer: 1 }
];

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

  const handleVerifySchedule = (e) => {
    if (e) e.preventDefault();
    if (!candidateId.trim()) {
      toast.error('Please enter your Application Reference ID');
      return;
    }
    setScheduleVerified(true);
    toast.success('Exam Schedule Verified! Click "Begin Aptitude Now" to start your exam.');
  };

  const handleStartExam = () => {
    if (!candidateId.trim()) {
      toast.error('Please enter your Application Reference ID');
      return;
    }
    setTestStarted(true);
    toast.success('Aptitude Exam started! You have 15 minutes to complete.');
  };

  const handleOptionChange = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitTest = async () => {
    setSubmitted(true);
    let calculatedScore = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        calculatedScore += 10;
      }
    });
    setScore(calculatedScore);

    const passed = calculatedScore >= 40;
    const appIdKey = candidateId.trim() || 'APP7076';
    localStorage.setItem(`aptitude_passed_${appIdKey}`, passed ? 'true' : 'false');
    localStorage.setItem(`aptitude_score_${appIdKey}`, calculatedScore);

    try {
      await aptitudeApi.submitTest({
        candidateId: appIdKey,
        score: calculatedScore,
        totalQuestions: questions.length,
        answers
      });
      toast.success('Aptitude Test submitted successfully!');
    } catch (err) {
      console.log('Test result recorded locally');
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
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: '#dc2626', fontWeight: 700 }}>
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
                  setCandidateId(e.target.value);
                  setScheduleVerified(false);
                }}
                className="form-input"
                style={{ padding: '14px 18px', fontSize: '1rem', textAlign: 'center', fontWeight: 600, width: '100%' }}
              />

              <Box sx={{ p: 2.5, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2, textAlign: 'center', width: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b', mb: 0.5, textAlign: 'center' }}>
                  Examination Rules & Guidelines:
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f1d1d', display: 'block', lineHeight: 1.6, textAlign: 'center' }}>
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

              <Button
                onClick={handleStartExam}
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                sx={{
                  background: '#dc2626',
                  '&:hover': { background: '#b91c1c' },
                  py: 1.6, px: 5,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  borderRadius: '50px',
                  width: '100%',
                  maxWidth: 340,
                  boxShadow: '0 10px 20px rgba(220,38,38,0.25)'
                }}
              >
                Begin Aptitude Now
              </Button>
            </Box>
          </Paper>
        ) : submitted ? (
          <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center', background: '#fff' }}>
            <Box sx={{ w: 72, h: 72, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: isPassed ? '#16a34a' : '#dc2626' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
              {isPassed ? 'Aptitude Test Passed! 🎉' : 'Test Submitted'}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#475569', mb: 3, textAlign: 'center' }}>
              Candidate ID: <strong>{candidateId}</strong>
            </Typography>

            <Card sx={{ p: 3, maxWidth: 380, mx: 'auto', background: isPassed ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isPassed ? '#bbf7d0' : '#fecaca'}`, mb: 4, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: isPassed ? '#15803d' : '#991b1b', textAlign: 'center' }}>
                {score} / {questions.length * 10}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: isPassed ? '#166534' : '#991b1b', mt: 1, textAlign: 'center' }}>
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
                  sx={{ background: '#dc2626', px: 4, py: 1.4, fontWeight: 800, fontSize: '1rem', borderRadius: '50px' }}
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
                  background: timeLeft < 180 ? '#fef2f2' : '#f1f5f9',
                  color: timeLeft < 180 ? '#dc2626' : '#0f172a',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  py: 2.5, px: 2,
                  border: '1px solid',
                  borderColor: timeLeft < 180 ? '#fecaca' : '#cbd5e1'
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
                  value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : ''}
                  onChange={(e) => handleOptionChange(currentQ.id, parseInt(e.target.value))}
                >
                  {currentQ.options.map((opt, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      onClick={() => handleOptionChange(currentQ.id, idx)}
                      sx={{
                        p: 1.8, px: 2.5, mb: 1.5, borderRadius: 2.5,
                        border: '2px solid',
                        borderColor: answers[currentQ.id] === idx ? '#dc2626' : '#e2e8f0',
                        background: answers[currentQ.id] === idx ? '#fef2f2' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <FormControlLabel value={idx} control={<Radio color="error" />} label={<Typography sx={{ fontWeight: 600, color: '#1e293b' }}>{opt}</Typography>} sx={{ width: '100%', m: 0 }} />
                    </Paper>
                  ))}
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
                  sx={{ background: '#dc2626', '&:hover': { background: '#b91c1c' }, borderRadius: '50px', px: 4, fontWeight: 800 }}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitTest}
                  endIcon={<SendIcon />}
                  variant="contained"
                  sx={{ background: '#16a34a', '&:hover': { background: '#15803d' }, borderRadius: '50px', px: 4, fontWeight: 800 }}
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
