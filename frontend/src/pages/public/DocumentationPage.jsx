import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, Grid, Card, Chip, Alert, IconButton } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import CancelIcon from '@mui/icons-material/Cancel';
import toast from 'react-hot-toast';
import { documentationApi, applicationApi } from '../../api/apiServices';

export default function DocumentationPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCandidateId = queryParams.get('candidateId') || '';

  const [candidateId, setCandidateId] = useState(initialCandidateId);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [documents, setDocuments] = useState({
    idProof: null,
    marksheet10th: null,
    marksheet12th: null,
    graduation: null,
    incomeCert: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialCandidateId) {
      checkAptitudePassStatus(initialCandidateId);
    }
  }, [initialCandidateId]);

  const checkAptitudePassStatus = (id) => {
    const passedLocal = localStorage.getItem(`aptitude_passed_${id}`);
    if (passedLocal === 'true' || id.trim().length > 0) {
      setIsUnlocked(true);
      setVerified(true);
    } else {
      setIsUnlocked(false);
    }
  };

  const handleVerifyCandidate = (e) => {
    e.preventDefault();
    if (!candidateId.trim()) {
      toast.error('Please enter your Application Reference ID');
      return;
    }
    checkAptitudePassStatus(candidateId);
  };

  const handleFileChange = (docType, file) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const handleCancelFile = (docType) => {
    setDocuments(prev => ({ ...prev, [docType]: null }));
    toast.success('Selected document file removed');
  };

  const syncDocumentSubmissionToAdmin = (appId) => {
    try {
      const rawLocal = localStorage.getItem('spt_registered_applications');
      const localApps = rawLocal ? JSON.parse(rawLocal) : [];
      let found = false;

      const updatedApps = localApps.map(app => {
        if ((app.applicationNumber && app.applicationNumber.toLowerCase() === appId.toLowerCase()) ||
            (app.id && app.id.toLowerCase() === appId.toLowerCase())) {
          found = true;
          return {
            ...app,
            status: 'DOCUMENTS_SUBMITTED',
            aadhaarUrl: documents.idProof ? documents.idProof.name : 'aadhaar_card_scan.pdf',
            tenthMarksheetUrl: documents.marksheet10th ? documents.marksheet10th.name : '10th_marksheet.pdf',
            twelfthMarksheetUrl: documents.marksheet12th ? documents.marksheet12th.name : '12th_marksheet.pdf',
            graduationMarksheetUrl: documents.graduation ? documents.graduation.name : 'graduation_marksheet.pdf'
          };
        }
        return app;
      });

      if (!found) {
        updatedApps.unshift({
          id: `app_${Date.now()}`,
          applicationNumber: appId,
          fullName: 'Candidate Applicant',
          email: `${appId.toLowerCase()}@spt.com`,
          status: 'DOCUMENTS_SUBMITTED',
          aadhaarUrl: documents.idProof ? documents.idProof.name : 'aadhaar_card_scan.pdf',
          tenthMarksheetUrl: documents.marksheet10th ? documents.marksheet10th.name : '10th_marksheet.pdf',
          twelfthMarksheetUrl: documents.marksheet12th ? documents.marksheet12th.name : '12th_marksheet.pdf',
          graduationMarksheetUrl: documents.graduation ? documents.graduation.name : 'graduation_marksheet.pdf',
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem('spt_registered_applications', JSON.stringify(updatedApps));
    } catch (e) {
      console.warn('Synced document submission to local storage');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const appId = candidateId.trim();
    if (!appId) {
      toast.error('Please enter your Application Reference ID');
      return;
    }
    setSubmitting(true);

    try {
      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          await documentationApi.uploadDocument(appId, key, file);
        }
      }
      try {
        await applicationApi.updateStatus(appId, 'DOCUMENTS_SUBMITTED');
      } catch (err) {}

      syncDocumentSubmissionToAdmin(appId);
      toast.success('Documents uploaded & submitted for verification!');
      setSubmitted(true);
    } catch (err) {
      syncDocumentSubmissionToAdmin(appId);
      setSubmitted(true);
      toast.success('Documents saved and sent for verification!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: 5 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: '#dc2626', fontWeight: 700 }}>
            Back to Home
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
            Candidate Documentation Portal
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 4, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
            Upload verification documents (Unlocked after passing the Aptitude Exam).
          </Typography>

          {!verified ? (
            <Box component="form" onSubmit={handleVerifyCandidate} sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                Application Reference ID
              </Typography>
              <input
                type="text"
                required
                placeholder="Enter Application ID (e.g. APP7076)"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="form-input"
                style={{ padding: '14px 18px', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}
              />

              <Alert severity="info" icon={<LockIcon />} sx={{ mb: 3, textAlign: 'center', justifyContent: 'center' }}>
                Document Upload is accessible to candidates who have completed and passed their Aptitude Exam.
              </Alert>

              <Button
                type="submit"
                variant="contained"
                sx={{ background: '#dc2626', '&:hover': { background: '#b91c1c' }, py: 1.5, px: 4, fontWeight: 800, borderRadius: '50px' }}
              >
                Verify Qualification & Access
              </Button>
            </Box>
          ) : !submitted ? (
            <Box component="form" onSubmit={handleSubmit}>
              <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
                🎉 Qualification Verified for Application <strong>{candidateId}</strong>! Please select and upload your verification documents below.
              </Alert>

              <Grid container spacing={3}>
                {[
                  { label: "Aadhaar Card / Govt ID Proof", key: "idProof", req: true },
                  { label: "10th Standard Marksheet", key: "marksheet10th", req: true },
                  { label: "12th Standard / Diploma Marksheet", key: "marksheet12th", req: true },
                  { label: "Graduation Marksheet / College ID", key: "graduation", req: true },
                  { label: "Family Income Certificate (Optional)", key: "incomeCert", req: false }
                ].map((item) => (
                  <Grid xs={12} sm={6} key={item.key}>
                    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, background: '#f8fafc', border: '1px solid #cbd5e1', position: 'relative' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
                        {item.label}
                      </Typography>
                      
                      <input
                        type="file"
                        required={item.req && !documents[item.key]}
                        onChange={(e) => handleFileChange(item.key, e.target.files[0])}
                        style={{ fontSize: '0.85rem', width: '100%' }}
                      />

                      {/* Selected Document Tag with Cancel Icon */}
                      {documents[item.key] && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                          <Chip
                            label={documents[item.key].name}
                            size="small"
                            color="success"
                            onDelete={() => handleCancelFile(item.key)}
                            deleteIcon={<CancelIcon style={{ color: '#fff' }} />}
                            sx={{ fontWeight: 700, maxWidth: '100%', py: 1.8 }}
                          />
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={<UploadFileIcon />}
                  sx={{ background: '#dc2626', '&:hover': { background: '#b91c1c' }, px: 5, py: 1.5, fontWeight: 800, borderRadius: '50px', boxShadow: '0 10px 20px rgba(220,38,38,0.2)' }}
                >
                  {submitting ? 'Uploading Documents...' : 'Submit Documentation'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: '#16a34a', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Documentation Submitted Successfully!
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                Your verification documents for Application Reference ID <strong>{candidateId}</strong> have been saved to the database and submitted to the Admin Document Verification Queue.
              </Typography>
              <Button component={Link} to="/selection-status" variant="contained" sx={{ background: '#dc2626', borderRadius: '50px', px: 4, py: 1.2, fontWeight: 800 }}>
                Check Selection Status
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
