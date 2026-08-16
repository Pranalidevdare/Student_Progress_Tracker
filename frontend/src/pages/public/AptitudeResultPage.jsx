import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Paper, Typography, Button, Card, Alert, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useLocation } from 'react-router-dom';
import { aptitudeApi } from '../../api/apiServices';

export default function AptitudeResultPage() {
  const location = useLocation();
  const candidateId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('candidateId') || '').trim();
  }, [location.search]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(Boolean(candidateId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!candidateId) {
      setLoading(false);
      setError('Candidate ID is required to load the aptitude result.');
      return;
    }

    let isMounted = true;

    const fetchResult = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await aptitudeApi.getResult(candidateId);
        if (isMounted) {
          setResult(response?.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load your aptitude result. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [candidateId]);

  const status = result?.status || '';
  const marksObtained = result?.marksObtained ?? null;
  const totalMarks = result?.totalMarks ?? null;
  const isPassed = status === 'PASS';

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center' }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button component={Link} to="/" startIcon={<HomeIcon />} sx={{ color: 'var(--primary)', fontWeight: 700 }}>
              Back to Home
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 5 }}>
              <CircularProgress sx={{ color: 'var(--primary)' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Loading result...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ py: 3 }}>
              <Alert severity="error" sx={{ textAlign: 'center', justifyContent: 'center', mb: 3 }}>
                {error}
              </Alert>
              <Button component={Link} to="/aptitude-test" variant="contained" sx={{ borderRadius: '50px', px: 4, py: 1.4, fontWeight: 800, background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' } }}>
                Go to Aptitude Test
              </Button>
            </Box>
          ) : !result ? (
            <Box sx={{ py: 3 }}>
              <Alert severity="warning" sx={{ textAlign: 'center', justifyContent: 'center', mb: 3 }}>
                Result not found.
              </Alert>
              <Button component={Link} to="/aptitude-test" variant="contained" sx={{ borderRadius: '50px', px: 4, py: 1.4, fontWeight: 800, background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' } }}>
                Retry Aptitude Test
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ w: 72, h: 72, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isPassed ? <CheckCircleIcon sx={{ fontSize: 72, color: 'var(--success)' }} /> : <CancelIcon sx={{ fontSize: 72, color: 'var(--primary)' }} />}
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
                {isPassed ? 'Aptitude Test Passed! 🎉' : 'Test Submitted'}
              </Typography>

              <Typography variant="subtitle1" sx={{ color: '#475569', mb: 3, textAlign: 'center' }}>
                Candidate ID: <strong>{result.candidateId || candidateId}</strong>
              </Typography>

              <Card sx={{ p: 3, maxWidth: 380, mx: 'auto', background: isPassed ? '#f0fdf4' : 'var(--primary-light)', border: `1px solid ${isPassed ? '#bbf7d0' : 'rgba(220,38,38,0.12)'}`, mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: isPassed ? 'var(--success-dark)' : 'var(--primary-dark)', textAlign: 'center' }}>
                  {marksObtained ?? 0} / {totalMarks ?? 0}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: isPassed ? 'var(--success)' : 'var(--primary-dark)', mt: 1, textAlign: 'center' }}>
                  STATUS: {status || 'PENDING'}
                </Typography>
              </Card>

              {isPassed ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Alert severity="success" sx={{ maxWidth: 500, mb: 2, textAlign: 'center' }}>
                    Congratulations! You have passed the Aptitude Exam. You are now unlocked and eligible to upload your verification documents.
                  </Alert>
                  <Button
                    component={Link}
                    to={`/documentation?candidateId=${encodeURIComponent(result.candidateId || candidateId)}`}
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    sx={{ background: 'var(--primary)', px: 4, py: 1.4, fontWeight: 800, fontSize: '1rem', borderRadius: '50px', '&:hover': { background: 'var(--primary-dark)' } }}
                  >
                    Proceed to Upload Documents
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button component={Link} to="/aptitude-test" variant="outlined" sx={{ borderRadius: '50px' }}>
                    Retake Aptitude Test
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
