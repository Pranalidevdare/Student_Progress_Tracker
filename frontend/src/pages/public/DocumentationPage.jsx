import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, Grid, Card, Chip, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import CancelIcon from '@mui/icons-material/Cancel';
import toast from 'react-hot-toast';
import { documentationApi, applicationApi } from '../../api/apiServices';

const emptyProfile = {
  candidateName: '',
  dateOfBirth: '',
  age: '',
  gender: 'MALE',
  otherGender: '',
  fatherName: '',
  fatherOccupation: '',
  motherName: '',
  motherOccupation: '',
  firstGraduate: 'NO',
  maritalStatus: 'UNMARRIED',
  mailingFullName: '',
  mailingAddress: '',
  mailingPincode: '',
  personalMobile: '',
  personalEmail: '',
  guardianFullName: '',
  guardianAddress: '',
  guardianPincode: '',
  guardianMobile: '',
  guardianLandline: '',
  tenthSchoolName: '',
  tenthBoard: '',
  tenthPassingYear: '',
  tenthMarks: '',
  tenthPercentage: '',
  twelfthSchoolName: '',
  twelfthBoard: '',
  twelfthPassingYear: '',
  twelfthMarks: '',
  twelfthPercentage: '',
  graduationCollege: '',
  graduationDegree: '',
  graduationMarks: '',
  graduationPercentage: '',
  graduationPassingYear: '',
  postGraduationCollege: '',
  postGraduationDegree: '',
  postGraduationPassingYear: '',
  postGraduationMarks: '',
  postGraduationPercentage: '',
  declarationAccepted: false
};

export default function DocumentationPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCandidateId = queryParams.get('candidateId') || '';

  const [candidateId, setCandidateId] = useState(initialCandidateId);
  const [applicationId, setApplicationId] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [documents, setDocuments] = useState({
    passportPhoto: null,
    aadharDocument: null,
    tenthMarksheet: null,
    twelfthMarksheet: null,
    bachelorMarksheet: null,
    masterMarksheet: null,
    familyIncomeCertificate: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialCandidateId) {
      verifyCandidateByBackend(initialCandidateId);
    }
  }, [initialCandidateId]);

  const hydrateProfileFromApplication = (app) => {
    const nextProfile = { ...emptyProfile };
    if (!app) return nextProfile;

    nextProfile.candidateName = app.fullName || '';
    nextProfile.mailingFullName = app.fullName || '';
    nextProfile.personalEmail = app.email || '';
    nextProfile.personalMobile = app.mobile || '';
    nextProfile.graduationCollege = app.collegeName || '';
    nextProfile.graduationDegree = app.branch || '';
    nextProfile.guardianFullName = app.fullName || '';

    return nextProfile;
  };

  const verifyCandidateByBackend = async (id) => {
    const trimmed = String(id || '').trim();
    if (!trimmed) {
      setIsUnlocked(false);
      setVerified(false);
      return;
    }

    try {
      const res = await applicationApi.getByAppNumber(trimmed);
      const app = res?.data;
      if (!app) {
        setIsUnlocked(false);
        setVerified(false);
        toast.error('Application reference not found.');
        return;
      }

      const status = String(app.status || '');
      const allowed = ['SUBMITTED', 'APTITUDE_PASSED', 'DOCUMENTATION_PENDING', 'DOCUMENTS_REJECTED'];
      if (!allowed.includes(status)) {
        setIsUnlocked(false);
        setVerified(false);
        toast.error('Document upload is unlocked only after the aptitude exam is passed.');
        return;
      }

      setApplicationId(app.id || app.applicationNumber || trimmed);
      setProfile(prev => ({ ...prev, ...hydrateProfileFromApplication(app) }));
      setIsUnlocked(true);
      setVerified(true);
      setCandidateId(trimmed);
    } catch (error) {
      console.error('Error verifying document eligibility:', error);
      setIsUnlocked(false);
      setVerified(false);
      toast.error('Unable to verify eligibility from the database.');
    }
  };

  const handleVerifyCandidate = async (e) => {
    e.preventDefault();
    const trimmed = candidateId.trim();
    if (!trimmed) {
      toast.error('Please enter your Application Reference ID');
      return;
    }
    await verifyCandidateByBackend(trimmed);
  };

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (docType, file) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const handleCancelFile = (docType) => {
    setDocuments(prev => ({ ...prev, [docType]: null }));
    toast.success('Selected document file removed');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const appRef = candidateId.trim();

  if (!appRef) {
    toast.error('Please enter your Application Reference ID');
    return;
  }

  if (!profile.declarationAccepted) {
    toast.error(
      'Please accept the declaration before submitting your documents.'
    );
    return;
  }

  // Only REQUIRED documents
  const requiredDocuments = {
    passportPhoto: documents.passportPhoto,
    aadharDocument: documents.aadharDocument,
    tenthMarksheet: documents.tenthMarksheet,
    twelfthMarksheet: documents.twelfthMarksheet,
    bachelorMarksheet: documents.bachelorMarksheet
  };

  const missingDocument = Object.entries(requiredDocuments)
    .find(([_, file]) => !file);

  if (missingDocument) {
    toast.error(
      `${missingDocument[0]} is required before submitting.`
    );
    return;
  }

  const payload = {
    ...profile,

    // Convert numeric fields correctly
    age: Number(profile.age),

    dateOfBirth: profile.dateOfBirth,

    fatherOccupation:
      profile.fatherOccupation || 'Not specified',

    motherOccupation:
      profile.motherOccupation || 'Not specified',

    mailingPincode:
      String(profile.mailingPincode || ''),

    guardianPincode:
      String(profile.guardianPincode || ''),

    tenthPassingYear:
      Number(profile.tenthPassingYear),

    tenthPercentage:
      Number(profile.tenthPercentage),

    twelfthPassingYear:
      Number(profile.twelfthPassingYear),

    twelfthPercentage:
      Number(profile.twelfthPercentage),

    graduationPassingYear:
      profile.graduationPassingYear
        ? Number(profile.graduationPassingYear)
        : null,

    graduationPercentage:
      Number(profile.graduationPercentage),

    postGraduationPassingYear:
      profile.postGraduationPassingYear
        ? Number(profile.postGraduationPassingYear)
        : null,

    postGraduationPercentage:
      profile.postGraduationPercentage
        ? Number(profile.postGraduationPercentage)
        : null,

    declarationAccepted: true
  };

  console.log('========== DOCUMENTATION SUBMIT ==========');
  console.log('Application Reference:', appRef);
  console.log('Application ID:', applicationId);
  console.log('Payload:', payload);
  console.log('Documents:', documents);

  setSubmitting(true);

  try {
    // Resolve the actual MongoDB Application ID
    const dbApp =
      await applicationApi.getByAppNumber(appRef);

    const resolvedApplicationId =
      dbApp?.data?.id ||
      applicationId;

    if (!resolvedApplicationId) {
      throw new Error(
        'Unable to resolve application ID.'
      );
    }

    console.log(
      'Resolved MongoDB Application ID:',
      resolvedApplicationId
    );

    // Submit documentation
    await documentationApi.submitDocumentation(
      resolvedApplicationId,
      payload,
      documents
    );

    // IMPORTANT:
    // Do NOT call applicationApi.updateStatus() here.
    // DocumentationServiceImpl already does it after
    // successfully saving CandidateDocumentation.

    toast.success(
      'Documents uploaded and submitted to the admin verification queue.'
    );

    setSubmitted(true);

  } catch (error) {

    console.error(
      'Document submission failed:',
      error
    );

    console.error(
      'Backend response:',
      error?.response?.data
    );

    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Document upload failed.';

    toast.error(backendMessage);

  } finally {
    setSubmitting(false);
  }
};

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: 5 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: 'var(--primary)', fontWeight: 700 }}>
            Back to Home
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
            Candidate Documentation Portal
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 4, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
            Upload verification documents only after your aptitude examination has been approved.
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
                Document Upload is accessible only to candidates whose aptitude status is APTITUDE_PASSED.
              </Alert>

              <Button type="submit" variant="contained" sx={{ background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' }, py: 1.5, px: 4, fontWeight: 800, borderRadius: '50px' }}>
                Verify Qualification & Access
              </Button>
            </Box>
          ) : !submitted ? (
            <Box component="form" onSubmit={handleSubmit}>
              <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
                Qualification Verified for Application <strong>{candidateId}</strong>. Please complete the form and upload the required verification documents.
              </Alert>

              <Grid container spacing={2}>
                {[
                  ['candidateName', 'Candidate Name'],
                  ['dateOfBirth', 'Date of Birth'],
                  ['age', 'Age'],
                  ['gender', 'Gender'],
                  ['fatherName', 'Father Name'],
                  ['fatherOccupation', 'Father Occupation'],
                  ['motherName', 'Mother Name'],
                  ['motherOccupation', 'Mother Occupation'],
                  ['firstGraduate', 'First Graduate'],
                  ['maritalStatus', 'Marital Status'],
                  ['mailingFullName', 'Mailing Full Name'],
                  ['mailingAddress', 'Mailing Address'],
                  ['mailingPincode', 'Mailing Pincode'],
                  ['personalMobile', 'Personal Mobile'],
                  ['personalEmail', 'Personal Email'],
                  ['guardianFullName', 'Guardian Name'],
                  ['guardianAddress', 'Guardian Address'],
                  ['guardianPincode', 'Guardian Pincode'],
                  ['guardianMobile', 'Guardian Mobile'],
                  ['guardianLandline', 'Guardian Landline'],
                  ['tenthSchoolName', '10th School Name'],
                  ['tenthBoard', '10th Board'],
                  ['tenthPassingYear', '10th Passing Year'],
                  ['tenthMarks', '10th Marks'],
                  ['tenthPercentage', '10th Percentage'],
                  ['twelfthSchoolName', '12th School Name'],
                  ['twelfthBoard', '12th Board'],
                  ['twelfthPassingYear', '12th Passing Year'],
                  ['twelfthMarks', '12th Marks'],
                  ['twelfthPercentage', '12th Percentage'],
                  ['graduationCollege', 'Graduation College'],
                  ['graduationDegree', 'Graduation Degree'],
                  ['graduationMarks', 'Graduation Marks'],
                  ['graduationPercentage', 'Graduation Percentage'],
                  ['graduationPassingYear', 'Graduation Passing Year'],
                  ['postGraduationCollege', 'Post Graduation College (Optional)'],
                  ['postGraduationDegree', 'Post Graduation Degree (Optional)'],
                  ['postGraduationPassingYear', 'Post Graduation Passing Year (Optional)'],
                  ['postGraduationMarks', 'Post Graduation Marks (Optional)'],
                  ['postGraduationPercentage', 'Post Graduation Percentage (Optional)']
                ].map(([field, label]) => (
                  <Grid xs={12} sm={6} key={field}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>{label}</label>
                    <input
                      type={field === 'dateOfBirth' ? 'date' : field.includes('Percentage') || field.includes('Year') || field.includes('Age') || field.includes('Pincode') || field.includes('Mobile') ? 'number' : 'text'}
                      value={profile[field] ?? ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="form-input"
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>Required document files</Typography>
                <Grid container spacing={2}>
                  {[
                    ['passportPhoto', 'Passport Photograph'],
                    ['aadharDocument', 'Aadhaar Card / Govt ID'],
                    ['tenthMarksheet', '10th Marksheet'],
                    ['twelfthMarksheet', '12th Marksheet'],
                    ['bachelorMarksheet', 'Graduation Marksheet'],
                    ['familyIncomeCertificate', 'Family Income Certificate']
                  ].map(([key, label]) => (
                    <Grid xs={12} sm={6} key={key}>
                      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, background: '#f8fafc', border: '1px solid #cbd5e1', position: 'relative' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1.5 }}>{label}</Typography>
                        <input type="file" onChange={(e) => handleFileChange(key, e.target.files[0])} style={{ fontSize: '0.85rem', width: '100%' }} />
                        {documents[key] && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                            <Chip
                              label={documents[key].name}
                              size="small"
                              color="success"
                              onDelete={() => handleCancelFile(key)}
                              deleteIcon={<CancelIcon style={{ color: '#fff' }} />}
                              sx={{ fontWeight: 700, maxWidth: '100%', py: 1.8 }}
                            />
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <input type="checkbox" checked={profile.declarationAccepted} onChange={(e) => handleFieldChange('declarationAccepted', e.target.checked)} />
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>I confirm that all information and uploaded documents are true and complete.</label>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" size="large" disabled={submitting} startIcon={<UploadFileIcon />} sx={{ background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' }, px: 5, py: 1.5, fontWeight: 800, borderRadius: '50px', boxShadow: '0 10px 20px rgba(220,38,38,0.2)' }}>
                  {submitting ? 'Uploading Documents...' : 'Submit Documentation'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: 'var(--success)', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Documentation Submitted Successfully!
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                Your verification documents for Application Reference ID <strong>{candidateId}</strong> have been saved to the database and submitted to the admin verification queue.
              </Typography>
              <Button component={Link} to="/selection-status" variant="contained" sx={{ background: 'var(--primary)', borderRadius: '50px', px: 4, py: 1.2, fontWeight: 800, '&:hover': { background: 'var(--primary-dark)' } }}>
                Check Selection Status
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
