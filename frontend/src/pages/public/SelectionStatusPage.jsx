import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button, Card, Chip, Divider, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import toast from 'react-hot-toast';
import { applicationApi } from '../../api/apiServices';
import { Link } from 'react-router-dom';

export default function SelectionStatusPage() {
  const [appNumber, setAppNumber] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFoundError, setNotFoundError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = appNumber.trim();
    if (!query) {
      toast.error('Please enter an Application Reference Number');
      return;
    }
    setLoading(true);
    setNotFoundError('');
    setCandidate(null);

    // Only check locally saved applications (no hardcoded demo data)

    // First check local registered applications in localStorage
    let foundApp = null;
    try {
      const rawLocal = localStorage.getItem('spt_registered_applications');
      let localApps = [];
      if (rawLocal) localApps = JSON.parse(rawLocal);
      
      const allPool = [...localApps];
      foundApp = allPool.find(a => 
        (a.applicationNumber && a.applicationNumber.toLowerCase() === query.toLowerCase()) ||
        (a.email && a.email.toLowerCase() === query.toLowerCase()) ||
        (a.id && a.id.toLowerCase() === query.toLowerCase()) ||
        (a.fullName && a.fullName.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (e) {}

    try {
      const res = await applicationApi.getByAppNumber(query);
      if (res.data) {
        setCandidate(res.data);
        toast.success('Application status loaded!');
      } else if (foundApp) {
        setCandidate(foundApp);
        toast.success('Application status loaded!');
      } else {
        setNotFoundError(`No registered candidate found with Application ID "${query}". Please check your application reference number or register first.`);
      }
    } catch (err) {
      if (foundApp) {
        setCandidate(foundApp);
        toast.success('Application status loaded!');
      } else {
        setNotFoundError(`No registered candidate found with Application ID "${query}". Please check your application reference number or register first.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOfficialEnrollmentLetter = () => {
    if (!candidate) return;

    const todayDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const studentName = candidate.fullName || 'Selected Candidate';
    const appNo = candidate.applicationNumber || appNumber;
    const college = candidate.collegeName || 'ISBM College of Engineering';
    const branch = candidate.branch || 'Computer Engineering';

    const letterHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Enrollment Letter - ${studentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hindi:wght@400;700&family=Inter:wght@400;600;700;800&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      background: #fff;
      line-height: 1.6;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    .header-title-hindi {
      font-family: 'Hindi', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--primary-dark);
      text-align: right;
      line-height: 1.3;
    }
    .red-line {
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--primary-dark));
      margin-bottom: 30px;
      border-radius: 2px;
    }
    .letter-title {
      text-align: center;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 25px;
      text-decoration: underline;
    }
    .date-str {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 20px;
    }
    .recipient-info {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 25px;
      line-height: 1.5;
    }
    .content-p {
      font-size: 14px;
      color: #334155;
      margin-bottom: 16px;
      text-align: justify;
    }
    .program-details {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid var(--primary);
      padding: 16px 20px;
      margin: 25px 0;
      border-radius: 6px;
      font-size: 13.5px;
    }
    .note-section {
      margin-top: 25px;
      font-size: 13px;
      color: #334155;
    }
    .note-section ul {
      padding-left: 20px;
      margin-top: 8px;
    }
    .note-section li {
      margin-bottom: 6px;
    }
    .signature-box {
      margin-top: 40px;
      font-size: 14px;
    }
    .signature-img {
      font-family: 'Brush Script MT', cursive, sans-serif;
      font-size: 24px;
      color: #1e3a8a;
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <table className="header-table" style="width: 100%;">
    <tr>
      <td style="vertical-align: middle;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: var(--primary); border-radius: 12px; color: white; font-weight: 900; font-size: 22px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 48px;">IB</div>
          <div>
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a;">InfoBeans Foundation</h2>
          </div>
        </div>
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <div className="header-title-hindi">
          उन्नत राष्ट्र की कल्पना<br />
          कम्यूटर साक्षरता घर-घर पहुँचाना
        </div>
      </td>
    </tr>
  </table>

  <div className="red-line"></div>

  <div className="letter-title">Enrollment Letter</div>

  <div className="date-str">${todayDate}</div>

  <div className="recipient-info">
    <strong>${studentName}</strong><br />
    Application ID: ${appNo}<br />
    Branch: ${branch}<br />
    College: ${college}
  </div>

  <p className="content-p">Dear <strong>${studentName}</strong>,</p>

  <p className="content-p"><strong>Congratulations!</strong></p>

  <p className="content-p">
    We are delighted to inform you that you have been selected for the one year <strong>Information Technology Excellence Program (ITEP)</strong> at InfoBeans Foundation, Pune.
  </p>

  <p className="content-p">
    Your performance in the aptitude test, document verification, and personal interview have demonstrated your potential and commitment towards advancing in the field of information technology. We believe that your participation in this program will open up new avenues of opportunity for you and empower you to shape a brighter future.
  </p>

  <p className="content-p">
    The Information Technology Excellence Program (ITEP) is designed to provide comprehensive training in various aspects of information technology over the course of one year. Through a combination of theoretical knowledge and practical hands-on experience, you will gain valuable insights into different tech stacks, latest technologies and industry trends. During the course, you will be guided by experienced instructors who are committed to your success.
  </p>

  <p className="content-p">
    Please refer to the program schedule and other relevant information. We kindly request you to ensure your availability for the commencement of the program.
  </p>

  <div className="program-details">
    <p style="margin: 4px 0;"><strong>Batch Start Date :</strong> Monday, August 25, 2025</p>
    <p style="margin: 4px 0;"><strong>Address :</strong> InfoBeans Foundation, Pune / ISBM College of Engineering, 4th Floor, Survey No. 44/1/2, Taluka Mulshi, Pashan Sus Road, Nande, Maharashtra 412115</p>
    <p style="margin: 4px 0;"><strong>Contact Person :</strong> Omkar Patankar Sir, Mobile: 9981336599</p>
  </div>

  <p className="content-p">
    Your participation in this program will necessitate a high level of dedication and commitment, potentially requiring adjustments to your current engagements. However, we assure you that the knowledge and skills you will acquire during this journey will prove invaluable in shaping your future career.
  </p>

  <p className="content-p">
    Once again, congratulations on your selection! We look forward to welcoming you to the Information Technology Excellence Program and witnessing your growth and success.
  </p>

  <div className="note-section">
    <strong>Please Note:</strong>
    <ul>
      <li>Failure to report on the batch commencement date without prior notification may result in the cancellation of your enrollment.</li>
      <li>If any discrepancy is identified in the information or documents provided at any point during the program, your registration may be subject to immediate cancellation.</li>
      <li>In the event of any change in the commencement date, you will be promptly informed through official channels.</li>
    </ul>
  </div>

  <div className="signature-box">
    <p style="margin-bottom: 4px;">Best regards,</p>
    <div className="signature-img">NBhopatkar</div>
    <p style="margin: 0; font-weight: 700; color: #0f172a;">Dr. Neha Bhopatkar</p>
    <p style="margin: 0; color: #64748b; font-size: 13px;">Associate Director HR, InfoBeans Foundation</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([letterHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Official_Enrollment_Letter_${appNo}.html`;
    a.click();
    toast.success('Official InfoBeans Enrollment Letter Downloaded!');
  };

  const statusStr = String(candidate?.status || 'SUBMITTED').toUpperCase();
  const isFullySelected = statusStr === 'SELECTED' || statusStr === 'BATCH_ASSIGNED';

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: 5, fontWait: 500 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: 'var(--primary)', fontWeight: 700 }}>
            Back to Home
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
            Application Selection Status Tracker
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 4, textAlign: 'center', maxWidth: 540, mx: 'auto' }}>
            Registered candidates can search using their Application Reference ID to check real-time selection stage progress and download official enrollment letters once selected.
          </Typography>

          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, maxWidth: 540, mx: 'auto', mb: candidate || notFoundError ? 4 : 0 }}>
            <input
              type="text"
              required
              placeholder="Enter Application Reference ID (e.g. APP7076)"
              value={appNumber}
              onChange={(e) => setAppNumber(e.target.value)}
              className="form-input"
              style={{ padding: '12px 16px', fontSize: '1rem', fontWeight: 600 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{ background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' }, px: 4, py: 1.4, whiteSpace: 'nowrap', fontWeight: 700, borderRadius: '50px' }}
            >
              {loading ? 'Searching...' : 'Check Status'}
            </Button>
          </Box>

          {notFoundError && (
            <Alert severity="error" icon={<LockIcon />} sx={{ mt: 3, maxWidth: 540, mx: 'auto' }}>
              {notFoundError}
            </Alert>
          )}

          {candidate && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 4 }} />
              <Card variant="outlined" sx={{ p: 4, borderRadius: 3, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justify: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {candidate.fullName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                      App Reference ID: <strong style={{ color: 'var(--primary)' }}>{candidate.applicationNumber || appNumber}</strong> • College: <strong>{candidate.collegeName || 'InfoBeans Applicant'}</strong> ({candidate.branch || 'ITEP'})
                    </Typography>
                  </Box>

                  <Chip
                    icon={isFullySelected ? <CheckCircleIcon /> : <PendingIcon />}
                    label={statusStr}
                    color={isFullySelected ? 'success' : 'warning'}
                    sx={{ fontWeight: 800, px: 1, py: 2.2, fontSize: '0.875rem' }}
                  />
                </Box>

                {/* Pipeline Metrics Grid */}
                {(() => {
                  const appIdKey = candidate.applicationNumber || appNumber;
                  const localAptitudePassed = localStorage.getItem(`aptitude_passed_${appIdKey}`) === 'true';
                  const isAptitudePassed = localAptitudePassed || [
                    'APTITUDE_PASSED', 'DOCUMENTS_SUBMITTED', 'DOCUMENTS_VERIFIED',
                    'TECHNICAL_INTERVIEW_PASSED', 'HR_INTERVIEW_PASSED', 'HOME_VISIT_COMPLETED',
                    'SELECTED', 'BATCH_ASSIGNED'
                  ].includes(statusStr);

                  const isDocSubmitted = ['DOCUMENTS_SUBMITTED', 'DOCUMENTS_VERIFIED', 'TECHNICAL_INTERVIEW_PASSED', 'HR_INTERVIEW_PASSED', 'HOME_VISIT_COMPLETED', 'SELECTED', 'BATCH_ASSIGNED'].includes(statusStr);
                  const isDocVerified = ['DOCUMENTS_VERIFIED', 'TECHNICAL_INTERVIEW_PASSED', 'HR_INTERVIEW_PASSED', 'HOME_VISIT_COMPLETED', 'SELECTED', 'BATCH_ASSIGNED'].includes(statusStr);
                  const isInterviewPassed = ['TECHNICAL_INTERVIEW_PASSED', 'HR_INTERVIEW_PASSED', 'HOME_VISIT_COMPLETED', 'SELECTED', 'BATCH_ASSIGNED'].includes(statusStr);

                  return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, my: 3 }}>
                      <Paper elevation={0} sx={{ p: 2.5, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Aptitude Exam</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isAptitudePassed ? 'var(--success)' : '#d97706', mt: 0.5 }}>
                          {isAptitudePassed ? 'PASSED (QUALIFIED)' : statusStr.includes('APTITUDE') ? 'SCHEDULED (PENDING)' : 'NOT STARTED'}
                        </Typography>
                      </Paper>

                      <Paper elevation={0} sx={{ p: 2.5, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Document Verification</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDocVerified ? '#2563eb' : isDocSubmitted ? '#d97706' : '#64748b', mt: 0.5 }}>
                          {isDocVerified ? 'VERIFIED & APPROVED' : isDocSubmitted ? 'SUBMITTED (PENDING)' : 'NOT SUBMITTED'}
                        </Typography>
                      </Paper>

                      <Paper elevation={0} sx={{ p: 2.5, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Technical/HR Interview</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isInterviewPassed ? 'var(--success)' : isDocVerified ? '#d97706' : '#64748b', mt: 0.5 }}>
                          {isInterviewPassed ? 'QUALIFIED & PASSED' : isDocVerified ? 'IN PROGRESS' : 'AWAITING DOC VERIFICATION'}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })()}

                {/* 7-STEP SELECTION PROCESS TIMELINE */}
                <Box sx={{ mt: 4, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                    Selection Process Timeline
                  </Typography>
                  
                  {(() => {
                    const pipelineSteps = [
                      { level: 1, title: '1. Registration Received', desc: 'Application submitted successfully' },
                      { level: 2, title: '2. Aptitude Examination', desc: 'Aptitude test score verified' },
                      { level: 3, title: '3. Document Submission', desc: 'Identity & academic records submitted' },
                      { level: 4, title: '4. Document Verification', desc: 'Documents verified by Admin' },
                      { level: 5, title: '5. Technical & HR Interviews', desc: 'Faculty trainer evaluations' },
                      { level: 6, title: '6. Home Visit Verification', desc: 'Background verification' },
                      { level: 7, title: '7. Final Program Selection', desc: 'Selection & batch enrollment' },
                    ];

                    const statusLevelMap = {
                      'SUBMITTED': 1,
                      'ELIGIBLE_FOR_APTITUDE': 1.5,
                      'APTITUDE_SCHEDULED': 1.8,
                      'APTITUDE_PASSED': 2,
                      'DOCUMENTS_SUBMITTED': 3,
                      'DOCUMENTS_VERIFIED': 4,
                      'TECHNICAL_INTERVIEW_PASSED': 4.8,
                      'HR_INTERVIEW_PASSED': 5,
                      'HOME_VISIT_COMPLETED': 6,
                      'SELECTED': 7,
                      'BATCH_ASSIGNED': 7
                    };

                    const currentLevel = statusLevelMap[statusStr] || 1;

                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {pipelineSteps.map((step, idx) => {
                          let st = 'PENDING';
                          if (currentLevel >= step.level) {
                            st = 'COMPLETED';
                          } else if (currentLevel >= step.level - 0.5) {
                            st = 'IN_PROGRESS';
                          }

                          return (
                            <Box
                              key={idx}
                              sx={{
                                p: 2,
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: st === 'COMPLETED' ? '#a7f3d0' : st === 'IN_PROGRESS' ? '#bfdbfe' : '#f1f5f9',
                                background: st === 'COMPLETED' ? '#ecfdf5' : st === 'IN_PROGRESS' ? '#eff6ff' : '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: st === 'COMPLETED' ? '#10b981' : st === 'IN_PROGRESS' ? '#2563eb' : '#cbd5e1',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {st === 'COMPLETED' ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : step.level}
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: st === 'COMPLETED' ? '#065f46' : st === 'IN_PROGRESS' ? '#1e40af' : '#475569' }}>
                                    {step.title}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {step.desc}
                                  </Typography>
                                </Box>
                              </Box>

                              <Chip
                                label={st === 'COMPLETED' ? 'COMPLETED' : st === 'IN_PROGRESS' ? 'IN PROGRESS' : 'PENDING'}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: 11,
                                  background: st === 'COMPLETED' ? '#d1fae5' : st === 'IN_PROGRESS' ? '#dbeafe' : '#f1f5f9',
                                  color: st === 'COMPLETED' ? '#065f46' : st === 'IN_PROGRESS' ? '#1e40af' : '#64748b'
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })()}
                </Box>

                {/* CONDITIONAL OFFER LETTER DOWNLOAD CONTROL */}
                {isFullySelected ? (
                  <Box sx={{ mt: 4, pt: 3, borderTop: '1px border-slate-200', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
                      <strong>Congratulations!</strong> You have successfully cleared the Aptitude Examination, Document Verification, and Technical/HR Interviews. You are officially <strong>SELECTED</strong> for the InfoBeans Foundation ITEP Batch!
                    </Alert>

                    <Button
                      onClick={handleDownloadOfficialEnrollmentLetter}
                      variant="contained"
                      size="large"
                      startIcon={<DownloadIcon />}
                      sx={{ background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' }, fontWeight: 800, fontSize: '1rem', py: 1.5, px: 4, borderRadius: '50px', boxShadow: '0 10px 20px rgba(220,38,38,0.25)' }}
                    >
                      Download Official Enrollment Letter
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="info" icon={<LockIcon />} sx={{ mt: 3, borderRadius: 2 }}>
                    <strong>Enrollment Letter Status: Locked</strong><br />
                    Your Official Enrollment Letter will be unlocked for download <strong>ONLY after passing your Technical & HR Interviews and Home Visit Verification</strong>. Current Stage: <strong>{statusStr}</strong>.
                  </Alert>
                )}
              </Card>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
