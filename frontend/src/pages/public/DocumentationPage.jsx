import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
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
  // Guardian's Full Name is INDEPENDENT — never auto-filled from candidate or parent names
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
  graduationStatus: 'PURSUING',
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
  const [yearOfStudy, setYearOfStudy] = useState('');
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Field element refs for smooth scrolling on validation failure
  const fieldRefs = useRef({});

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
    nextProfile.fatherOccupation = app.fatherOccupation || '';
    nextProfile.motherOccupation = app.motherOccupation || '';

    // Determine default graduation status based on registered yearOfStudy
    const appYear = String(app.yearOfStudy || '').toLowerCase();
    if (appYear.includes('graduated') || appYear.includes('completed')) {
      nextProfile.graduationStatus = 'GRADUATED';
    } else {
      // 1st Year, 2nd Year, 3rd Year, 4th Year / Final Year default to PURSUING
      nextProfile.graduationStatus = 'PURSUING';
    }

    // GUARDIAN NAME IS EXPLICITLY LEFT EMPTY (NOT auto-filled from candidateName)
    nextProfile.guardianFullName = '';

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

      const resolvedAppId = app.id || app.applicationNumber || trimmed;
      setApplicationId(resolvedAppId);
      setYearOfStudy(app.yearOfStudy || '');

      const initialHydrated = hydrateProfileFromApplication(app);

      // Check if a saved documentation record exists in the backend for this candidate
      try {
        const docRes = await documentationApi.getByApplicationId(resolvedAppId);
        const savedDoc = docRes?.data;
        if (savedDoc) {
          // If existing documentation record contains a previously saved guardian name, load it
          if (savedDoc.guardianFullName) {
            initialHydrated.guardianFullName = savedDoc.guardianFullName;
          }
          if (savedDoc.guardianAddress) initialHydrated.guardianAddress = savedDoc.guardianAddress;
          if (savedDoc.guardianPincode) initialHydrated.guardianPincode = savedDoc.guardianPincode;
          if (savedDoc.guardianMobile) initialHydrated.guardianMobile = savedDoc.guardianMobile;
          if (savedDoc.guardianLandline) initialHydrated.guardianLandline = savedDoc.guardianLandline;
          if (savedDoc.fatherName) initialHydrated.fatherName = savedDoc.fatherName;
          if (savedDoc.fatherOccupation) initialHydrated.fatherOccupation = savedDoc.fatherOccupation;
          if (savedDoc.motherName) initialHydrated.motherName = savedDoc.motherName;
          if (savedDoc.motherOccupation) initialHydrated.motherOccupation = savedDoc.motherOccupation;
          if (savedDoc.dateOfBirth) initialHydrated.dateOfBirth = savedDoc.dateOfBirth;
          if (savedDoc.age) initialHydrated.age = savedDoc.age;
          if (savedDoc.gender) initialHydrated.gender = savedDoc.gender;
          if (savedDoc.otherGender) initialHydrated.otherGender = savedDoc.otherGender;
          if (savedDoc.firstGraduate) initialHydrated.firstGraduate = savedDoc.firstGraduate;
          if (savedDoc.maritalStatus) initialHydrated.maritalStatus = savedDoc.maritalStatus;
          if (savedDoc.mailingAddress) initialHydrated.mailingAddress = savedDoc.mailingAddress;
          if (savedDoc.mailingPincode) initialHydrated.mailingPincode = savedDoc.mailingPincode;
          if (savedDoc.tenthSchoolName) initialHydrated.tenthSchoolName = savedDoc.tenthSchoolName;
          if (savedDoc.tenthBoard) initialHydrated.tenthBoard = savedDoc.tenthBoard;
          if (savedDoc.tenthPassingYear) initialHydrated.tenthPassingYear = savedDoc.tenthPassingYear;
          if (savedDoc.tenthMarks) initialHydrated.tenthMarks = savedDoc.tenthMarks;
          if (savedDoc.tenthPercentage) initialHydrated.tenthPercentage = savedDoc.tenthPercentage;
          if (savedDoc.twelfthSchoolName) initialHydrated.twelfthSchoolName = savedDoc.twelfthSchoolName;
          if (savedDoc.twelfthBoard) initialHydrated.twelfthBoard = savedDoc.twelfthBoard;
          if (savedDoc.twelfthPassingYear) initialHydrated.twelfthPassingYear = savedDoc.twelfthPassingYear;
          if (savedDoc.twelfthMarks) initialHydrated.twelfthMarks = savedDoc.twelfthMarks;
          if (savedDoc.twelfthPercentage) initialHydrated.twelfthPercentage = savedDoc.twelfthPercentage;
          if (savedDoc.graduationCollege) initialHydrated.graduationCollege = savedDoc.graduationCollege;
          if (savedDoc.graduationDegree) initialHydrated.graduationDegree = savedDoc.graduationDegree;
          if (savedDoc.graduationMarks) initialHydrated.graduationMarks = savedDoc.graduationMarks;
          if (savedDoc.graduationPercentage) initialHydrated.graduationPercentage = savedDoc.graduationPercentage;
          if (savedDoc.graduationPassingYear) {
            initialHydrated.graduationPassingYear = savedDoc.graduationPassingYear;
            initialHydrated.graduationStatus = 'GRADUATED';
          }
        }
      } catch (err) {
        // Fresh application — no prior documentation record saved yet
      }

      setProfile(initialHydrated);
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
    // Clear error on user edit
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileChange = (docType, file) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
    if (fieldErrors[docType]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[docType];
        return next;
      });
    }
  };

  const handleCancelFile = (docType) => {
    setDocuments(prev => ({ ...prev, [docType]: null }));
    toast.success('Selected document file removed');
  };

  const scrollToFirstError = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;
    const firstKey = errorKeys[0];
    const el = fieldRefs.current[firstKey];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') {
        el.focus();
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Personal Information
    if (!String(profile.candidateName || '').trim()) {
      errors.candidateName = 'Candidate name is required.';
    }
    if (!profile.dateOfBirth) {
      errors.dateOfBirth = 'Please enter your date of birth.';
    }
    if (!profile.age || Number(profile.age) <= 0) {
      errors.age = 'Please enter a valid age greater than zero.';
    }
    if (!profile.gender) {
      errors.gender = 'Please select gender.';
    }
    if (profile.gender === 'OTHER' && !String(profile.otherGender || '').trim()) {
      errors.otherGender = 'Please specify gender.';
    }
    if (!profile.firstGraduate) {
      errors.firstGraduate = 'First graduate information is required.';
    }
    if (!profile.maritalStatus) {
      errors.maritalStatus = 'Marital status is required.';
    }

    // 2. Family Information
    if (!String(profile.fatherName || '').trim()) {
      errors.fatherName = "Father's name is required.";
    }
    if (!String(profile.fatherOccupation || '').trim()) {
      errors.fatherOccupation = "Father's occupation is required.";
    }
    if (!String(profile.motherName || '').trim()) {
      errors.motherName = "Mother's name is required.";
    }
    if (!String(profile.motherOccupation || '').trim()) {
      errors.motherOccupation = "Mother's occupation is required.";
    }
    if (!String(profile.guardianFullName || '').trim()) {
      errors.guardianFullName = "Guardian's full name is required.";
    }
    if (!String(profile.guardianAddress || '').trim()) {
      errors.guardianAddress = "Guardian's address is required.";
    }
    if (!profile.guardianPincode || !/^[1-9][0-9]{5}$/.test(String(profile.guardianPincode).trim())) {
      errors.guardianPincode = 'Please enter a valid 6-digit guardian pincode.';
    }
    if (!profile.guardianMobile || !/^[6-9]\d{9}$/.test(String(profile.guardianMobile).trim())) {
      errors.guardianMobile = 'Please enter a valid 10-digit guardian mobile number.';
    }

    // 3. Contact Information
    if (!String(profile.mailingFullName || '').trim()) {
      errors.mailingFullName = 'Mailing full name is required.';
    }
    if (!String(profile.mailingAddress || '').trim()) {
      errors.mailingAddress = 'Mailing address is required.';
    }
    if (!profile.mailingPincode || !/^[1-9][0-9]{5}$/.test(String(profile.mailingPincode).trim())) {
      errors.mailingPincode = 'Please enter a valid 6-digit mailing pincode.';
    }
    if (!profile.personalMobile || !/^[6-9]\d{9}$/.test(String(profile.personalMobile).trim())) {
      errors.personalMobile = 'Please enter a valid 10-digit personal mobile number.';
    }
    if (!profile.personalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profile.personalEmail).trim())) {
      errors.personalEmail = 'Please enter a valid email address.';
    }

    // 4. 10th Details
    if (!String(profile.tenthSchoolName || '').trim()) {
      errors.tenthSchoolName = '10th school name is required.';
    }
    if (!String(profile.tenthBoard || '').trim()) {
      errors.tenthBoard = '10th board is required.';
    }
    if (!profile.tenthPassingYear || Number(profile.tenthPassingYear) < 1980 || Number(profile.tenthPassingYear) > new Date().getFullYear()) {
      errors.tenthPassingYear = 'Please enter a valid 10th passing year.';
    }
    if (!String(profile.tenthMarks || '').trim()) {
      errors.tenthMarks = '10th marks are required.';
    }
    if (profile.tenthPercentage === '' || Number(profile.tenthPercentage) <= 0 || Number(profile.tenthPercentage) > 100) {
      errors.tenthPercentage = 'Please enter a valid 10th percentage (1-100).';
    }

    // 5. 12th Details
    if (!String(profile.twelfthSchoolName || '').trim()) {
      errors.twelfthSchoolName = '12th school name is required.';
    }
    if (!String(profile.twelfthBoard || '').trim()) {
      errors.twelfthBoard = '12th board is required.';
    }
    if (!profile.twelfthPassingYear || Number(profile.twelfthPassingYear) < 1980 || Number(profile.twelfthPassingYear) > new Date().getFullYear()) {
      errors.twelfthPassingYear = 'Please enter a valid 12th passing year.';
    }
    if (!String(profile.twelfthMarks || '').trim()) {
      errors.twelfthMarks = '12th marks are required.';
    }
    if (profile.twelfthPercentage === '' || Number(profile.twelfthPercentage) <= 0 || Number(profile.twelfthPercentage) > 100) {
      errors.twelfthPercentage = 'Please enter a valid 12th percentage (1-100).';
    }

    // 6. Graduation Details (Supports Pursuing vs Graduated Candidates)
    if (!String(profile.graduationCollege || '').trim()) {
      errors.graduationCollege = 'Graduation college / university is required.';
    }
    if (!String(profile.graduationDegree || '').trim()) {
      errors.graduationDegree = 'Graduation degree & branch is required.';
    }
    if (!String(profile.graduationMarks || '').trim()) {
      errors.graduationMarks = profile.graduationStatus === 'PURSUING'
        ? 'Please enter your current aggregate marks / CGPA till last semester.'
        : 'Graduation final marks / CGPA is required.';
    }
    if (profile.graduationPercentage === '' || Number(profile.graduationPercentage) <= 0 || Number(profile.graduationPercentage) > 100) {
      errors.graduationPercentage = profile.graduationStatus === 'PURSUING'
        ? 'Please enter your aggregate percentage till date (1-100).'
        : 'Please enter a valid graduation percentage (1-100).';
    }
    if (profile.graduationPassingYear) {
      const pYear = Number(profile.graduationPassingYear);
      if (pYear < 1980 || pYear > 2035) {
        errors.graduationPassingYear = 'Please enter a valid 4-digit passing year.';
      }
    }

    // 7. Required Document Files
    if (!documents.passportPhoto) {
      errors.passportPhoto = 'Please upload Passport photograph.';
    }
    if (!documents.aadharDocument) {
      errors.aadharDocument = 'Please upload Aadhaar Card / Govt ID.';
    }
    if (!documents.tenthMarksheet) {
      errors.tenthMarksheet = 'Please upload 10th Marksheet.';
    }
    if (!documents.twelfthMarksheet) {
      errors.twelfthMarksheet = 'Please upload 12th Marksheet.';
    }
    if (!documents.bachelorMarksheet) {
      errors.bachelorMarksheet = profile.graduationStatus === 'PURSUING'
        ? 'Please upload your latest semester marksheet / transcript.'
        : 'Please upload Graduation Marksheet.';
    }

    // 8. Declaration
    if (!profile.declarationAccepted) {
      errors.declarationAccepted = 'Please accept the declaration before submitting.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const appRef = candidateId.trim();
    if (!appRef) {
      toast.error('Please enter your Application Reference ID');
      return;
    }

    // 1. Run Comprehensive Field-Level Validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      scrollToFirstError(validationErrors);
      toast.error('Please correct the highlighted fields.');
      return;
    }

    setFieldErrors({});

    const payload = {
      ...profile,
      guardianFullName: profile.guardianFullName.trim(),
      age: Number(profile.age),
      dateOfBirth: profile.dateOfBirth,
      fatherOccupation: profile.fatherOccupation || 'Not specified',
      motherOccupation: profile.motherOccupation || 'Not specified',
      mailingPincode: String(profile.mailingPincode || ''),
      guardianPincode: String(profile.guardianPincode || ''),
      tenthPassingYear: Number(profile.tenthPassingYear),
      tenthPercentage: Number(profile.tenthPercentage),
      twelfthPassingYear: Number(profile.twelfthPassingYear),
      twelfthPercentage: Number(profile.twelfthPercentage),
      graduationPassingYear: profile.graduationPassingYear ? Number(profile.graduationPassingYear) : null,
      graduationPercentage: Number(profile.graduationPercentage),
      postGraduationPassingYear: profile.postGraduationPassingYear ? Number(profile.postGraduationPassingYear) : null,
      postGraduationPercentage: profile.postGraduationPercentage ? Number(profile.postGraduationPercentage) : null,
      declarationAccepted: true
    };

    setSubmitting(true);

    try {
      const dbApp = await applicationApi.getByAppNumber(appRef);
      const resolvedApplicationId = dbApp?.data?.id || applicationId;

      if (!resolvedApplicationId) {
        throw new Error('Unable to resolve application ID.');
      }

      await documentationApi.submitDocumentation(
        resolvedApplicationId,
        payload,
        documents
      );

      toast.success('Documents uploaded and submitted to the admin verification queue.');
      setSubmitted(true);
    } catch (error) {
      console.error('Document submission failed:', error);
      const resData = error?.response?.data;

      // Handle field-specific backend validation errors (Map<String, String>)
      if (resData && typeof resData === 'object' && !resData.message && !resData.error) {
        const backendFieldErrors = {};
        Object.entries(resData).forEach(([field, msg]) => {
          backendFieldErrors[field] = msg;
        });
        setFieldErrors(backendFieldErrors);
        scrollToFirstError(backendFieldErrors);
        toast.error('Please correct the highlighted fields.');
      } else {
        const backendMessage = resData?.message || resData?.error || error?.message || 'Document upload failed.';
        // Map common backend messages to fields if possible
        const mappedErrors = {};
        const lowerMsg = backendMessage.toLowerCase();
        if (lowerMsg.includes('guardian mobile')) mappedErrors.guardianMobile = backendMessage;
        else if (lowerMsg.includes('guardian name') || lowerMsg.includes('guardian full name')) mappedErrors.guardianFullName = backendMessage;
        else if (lowerMsg.includes('personal mobile')) mappedErrors.personalMobile = backendMessage;
        else if (lowerMsg.includes('personal email')) mappedErrors.personalEmail = backendMessage;
        else if (lowerMsg.includes('pincode')) mappedErrors.mailingPincode = backendMessage;
        else if (lowerMsg.includes('declaration')) mappedErrors.declarationAccepted = backendMessage;
        else if (lowerMsg.includes('passport')) mappedErrors.passportPhoto = backendMessage;
        else if (lowerMsg.includes('aadhar')) mappedErrors.aadharDocument = backendMessage;

        if (Object.keys(mappedErrors).length > 0) {
          setFieldErrors(mappedErrors);
          scrollToFirstError(mappedErrors);
        }
        toast.error(backendMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper renderer for Form Input Fields (Google Form style)
  const renderField = ({
    name,
    label,
    type = 'text',
    required = false,
    options = null,
    placeholder = '',
    readOnly = false,
    helperText = '',
    gridCols = { xs: 12, sm: 6 }
  }) => {
    const errorMsg = fieldErrors[name];
    const isError = Boolean(errorMsg);

    return (
      <Grid item {...gridCols} key={name}>
        <Box
          ref={(el) => { if (el) fieldRefs.current[name] = el; }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            width: '100%'
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: isError ? '#dc2626' : '#1e293b'
            }}
          >
            <span>{label}</span>
            {required && <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>}
          </label>

          {options ? (
            <select
              value={profile[name] ?? ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              disabled={readOnly}
              className="form-input"
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: '0.925rem',
                borderRadius: '8px',
                border: isError ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                background: isError ? '#fff5f5' : readOnly ? '#f1f5f9' : '#fff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={profile[name] ?? ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              readOnly={readOnly}
              placeholder={placeholder || `Enter ${label}`}
              className="form-input"
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: '0.925rem',
                borderRadius: '8px',
                border: isError ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                background: isError ? '#fff5f5' : readOnly ? '#f1f5f9' : '#fff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            />
          )}

          {isError ? (
            <Typography
              variant="caption"
              sx={{
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.25
              }}
            >
              <ErrorOutlineOutlinedIcon sx={{ fontSize: 15 }} />
              {errorMsg}
            </Typography>
          ) : helperText ? (
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              {helperText}
            </Typography>
          ) : null}
        </Box>
      </Grid>
    );
  };

  // Helper renderer for Document Upload Cards (Google Form style)
  const renderDocumentUpload = (key, label, required = true, accept = '.pdf,.jpg,.jpeg,.png', customHelper = '') => {
    const errorMsg = fieldErrors[key];
    const isError = Boolean(errorMsg);
    const file = documents[key];

    return (
      <Grid item xs={12} sm={6} key={key}>
        <Card
          ref={(el) => { if (el) fieldRefs.current[key] = el; }}
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: isError ? '#fff5f5' : '#f8fafc',
            border: isError ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            transition: 'all 0.2s ease'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isError ? '#dc2626' : '#1e293b', fontSize: '0.9rem' }}>
              {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
            </Typography>
            {file && (
              <Chip
                label="Selected"
                size="small"
                color="success"
                sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
              />
            )}
          </Box>

          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(key, e.target.files[0])}
            style={{
              fontSize: '0.85rem',
              width: '100%',
              color: '#334155'
            }}
          />

          {file && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={file.name}
                size="small"
                color="success"
                onDelete={() => handleCancelFile(key)}
                deleteIcon={<CancelIcon style={{ color: '#fff' }} />}
                sx={{ fontWeight: 700, maxWidth: '100%', py: 1.6 }}
              />
            </Box>
          )}

          {isError ? (
            <Typography
              variant="caption"
              sx={{
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <ErrorOutlineOutlinedIcon sx={{ fontSize: 15 }} />
              {errorMsg}
            </Typography>
          ) : customHelper ? (
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              {customHelper}
            </Typography>
          ) : null}
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: 5 }}>
      <Container maxWidth="md">
        {/* Top Back-To-Home Navigation */}
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: 'var(--primary, #d80202)', fontWeight: 700 }}>
            Back to Home
          </Button>
        </Box>

        {/* Verification Entry View */}
        {!verified ? (
          <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
              Candidate Documentation Portal
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
              Upload verification documents only after your aptitude examination has been approved.
            </Typography>

            <Box component="form" onSubmit={handleVerifyCandidate} sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
              <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Application Reference ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Application ID (e.g. APP-2026-000044)"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="form-input"
                  style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <Alert severity="info" icon={<LockIcon />} sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
                Document Upload is accessible to qualified candidates whose aptitude status is <strong>APTITUDE_PASSED</strong>.
              </Alert>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'var(--primary, #d80202)',
                  '&:hover': { background: 'var(--primary-dark, #b70000)' },
                  py: 1.4,
                  px: 4,
                  fontWeight: 800,
                  borderRadius: '8px',
                  width: '100%',
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Verify Qualification & Access
              </Button>
            </Box>
          </Paper>
        ) : !submitted ? (
          /* Structured Google-Form-Like Candidate Documentation Portal */
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* Top Qualification Verified Banner */}
            <Alert
              severity="success"
              icon={<CheckCircleOutlinedIcon />}
              sx={{
                borderRadius: 2.5,
                border: '1px solid #bbf7d0',
                background: '#f0fdf4',
                color: '#166534',
                fontSize: '0.925rem',
                fontWeight: 600
              }}
            >
              Qualification Verified for Application <strong>{candidateId}</strong>. Please complete the form sections below and upload your required verification documents.
            </Alert>

            {/* Error Summary Alert (if multiple errors exist) */}
            {Object.keys(fieldErrors).length > 0 && (
              <Alert
                severity="error"
                icon={<ErrorOutlineOutlinedIcon />}
                sx={{ borderRadius: 2.5, fontWeight: 600, fontSize: '0.9rem' }}
              >
                Please correct the <strong>{Object.keys(fieldErrors).length} highlighted field{Object.keys(fieldErrors).length > 1 ? 's' : ''}</strong> before submitting.
              </Alert>
            )}

            {/* 1. PERSONAL INFORMATION CARD */}
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <PersonOutlinedIcon sx={{ color: 'var(--primary, #d80202)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                    1. Personal Information
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Personal identity and demographic details
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {renderField({ name: 'candidateName', label: 'Candidate Full Name', required: true, readOnly: true, helperText: 'Auto-populated from application' })}
                {renderField({ name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true })}
                {renderField({ name: 'age', label: 'Age', type: 'number', required: true, placeholder: 'e.g. 21' })}
                {renderField({
                  name: 'gender',
                  label: 'Gender',
                  required: true,
                  options: [
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' }
                  ]
                })}
                {profile.gender === 'OTHER' && renderField({ name: 'otherGender', label: 'Specify Gender', required: true })}
                {renderField({
                  name: 'firstGraduate',
                  label: 'First Graduate in Family?',
                  required: true,
                  options: [
                    { value: 'NO', label: 'No' },
                    { value: 'YES', label: 'Yes' }
                  ]
                })}
                {renderField({
                  name: 'maritalStatus',
                  label: 'Marital Status',
                  required: true,
                  options: [
                    { value: 'UNMARRIED', label: 'Unmarried' },
                    { value: 'MARRIED', label: 'Married' },
                    { value: 'OTHER', label: 'Other' }
                  ]
                })}
              </Grid>
            </Paper>

            {/* 2. FAMILY & GUARDIAN INFORMATION CARD */}
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <FamilyRestroomIcon sx={{ color: 'var(--primary, #d80202)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                    2. Family & Guardian Information
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Parental and guardian contact records
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {renderField({ name: 'fatherName', label: "Father's Full Name", required: true, placeholder: "Enter Father's Full Name" })}
                {renderField({ name: 'fatherOccupation', label: "Father's Occupation", required: true, placeholder: 'e.g. Farmer / Business / Service' })}
                {renderField({ name: 'motherName', label: "Mother's Full Name", required: true, placeholder: "Enter Mother's Full Name" })}
                {renderField({ name: 'motherOccupation', label: "Mother's Occupation", required: true, placeholder: 'e.g. Homemaker / Teacher' })}
                {/* Guardian's Full Name — Independent, initially empty unless saved in backend */}
                {renderField({
                  name: 'guardianFullName',
                  label: "Guardian's Full Name",
                  required: true,
                  placeholder: "Enter Guardian's Full Name",
                  helperText: "Enter the guardian's actual name (not auto-filled)"
                })}
                {renderField({ name: 'guardianMobile', label: "Guardian's Mobile Number", required: true, placeholder: '10-digit mobile number' })}
                {renderField({ name: 'guardianAddress', label: "Guardian's Complete Address", required: true, gridCols: { xs: 12, sm: 12 }, placeholder: "Enter Guardian's Full Address" })}
                {renderField({ name: 'guardianPincode', label: "Guardian's Pincode", required: true, placeholder: '6-digit pincode' })}
                {renderField({ name: 'guardianLandline', label: 'Guardian Landline (Optional)', placeholder: 'e.g. 020-12345678' })}
              </Grid>
            </Paper>

            {/* 3. CONTACT & MAILING INFORMATION CARD */}
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <ContactPhoneIcon sx={{ color: 'var(--primary, #d80202)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                    3. Contact & Mailing Address
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Current communication and mailing coordinates
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {renderField({ name: 'mailingFullName', label: 'Mailing Full Name', required: true })}
                {renderField({ name: 'personalEmail', label: 'Personal Email Address', type: 'email', required: true, readOnly: true, helperText: 'Registered application email' })}
                {renderField({ name: 'personalMobile', label: 'Personal Mobile Number', required: true, readOnly: true, helperText: 'Registered contact number' })}
                {renderField({ name: 'mailingPincode', label: 'Mailing Pincode', required: true, placeholder: '6-digit pincode' })}
                {renderField({ name: 'mailingAddress', label: 'Mailing Complete Address', required: true, gridCols: { xs: 12, sm: 12 } })}
              </Grid>
            </Paper>

            {/* 4. ACADEMIC QUALIFICATIONS CARD */}
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <SchoolIcon sx={{ color: 'var(--primary, #d80202)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                    4. Academic Qualifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Secondary, higher secondary, and graduation academic records
                  </Typography>
                </Box>
              </Box>

              {/* 10th Standard Sub-Section */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5, mt: 1 }}>
                Secondary (10th Standard) Details
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {renderField({ name: 'tenthSchoolName', label: '10th School / Institute Name', required: true })}
                {renderField({ name: 'tenthBoard', label: '10th Board Name', required: true, placeholder: 'e.g. CBSE / State Board' })}
                {renderField({ name: 'tenthPassingYear', label: '10th Passing Year', type: 'number', required: true, placeholder: 'e.g. 2020' })}
                {renderField({ name: 'tenthMarks', label: '10th Marks Obtained', required: true, placeholder: 'e.g. 480/500' })}
                {renderField({ name: 'tenthPercentage', label: '10th Percentage (%)', type: 'number', required: true, placeholder: 'e.g. 85.5' })}
              </Grid>

              {/* 12th Standard Sub-Section */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5 }}>
                Higher Secondary (12th / Diploma) Details
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {renderField({ name: 'twelfthSchoolName', label: '12th School / College Name', required: true })}
                {renderField({ name: 'twelfthBoard', label: '12th Board / Council Name', required: true, placeholder: 'e.g. CBSE / HSC' })}
                {renderField({ name: 'twelfthPassingYear', label: '12th Passing Year', type: 'number', required: true, placeholder: 'e.g. 2022' })}
                {renderField({ name: 'twelfthMarks', label: '12th Marks Obtained', required: true, placeholder: 'e.g. 450/500' })}
                {renderField({ name: 'twelfthPercentage', label: '12th Percentage (%)', type: 'number', required: true, placeholder: 'e.g. 82.0' })}
              </Grid>

              {/* Graduation Sub-Section — Supports 3rd-Year/Final-Year/Pursuing Students */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                  Graduation (Bachelor Degree) Details
                </Typography>
                {yearOfStudy && (
                  <Chip
                    label={`Application Status: ${yearOfStudy}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                  />
                )}
              </Box>

              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {renderField({
                  name: 'graduationStatus',
                  label: 'Current Graduation Status',
                  required: true,
                  options: [
                    { value: 'PURSUING', label: 'Currently Pursuing (3rd Year / Final Year / Undergraduate)' },
                    { value: 'GRADUATED', label: 'Graduated / Degree Completed' }
                  ],
                  gridCols: { xs: 12, sm: 12 },
                  helperText: profile.graduationStatus === 'PURSUING'
                    ? 'As a currently studying student, enter your aggregate marks and latest marksheet till date.'
                    : 'Enter your final degree marks and completion year.'
                })}
                {renderField({ name: 'graduationCollege', label: 'Graduation College / University', required: true, readOnly: true, helperText: 'Auto-populated from application' })}
                {renderField({ name: 'graduationDegree', label: 'Graduation Degree & Branch', required: true, placeholder: 'e.g. B.Tech IT / B.Sc CS' })}
                {renderField({
                  name: 'graduationMarks',
                  label: profile.graduationStatus === 'PURSUING' ? 'Current Aggregate CGPA / Marks (till last sem)' : 'Graduation Final Marks / CGPA',
                  required: true,
                  placeholder: profile.graduationStatus === 'PURSUING' ? 'e.g. 8.4 CGPA (till Sem 5)' : 'e.g. 8.4 CGPA / 840/1000'
                })}
                {renderField({
                  name: 'graduationPercentage',
                  label: profile.graduationStatus === 'PURSUING' ? 'Current Aggregate Percentage (%)' : 'Graduation Final Percentage (%)',
                  type: 'number',
                  required: true,
                  placeholder: 'e.g. 78.5'
                })}
                {renderField({
                  name: 'graduationPassingYear',
                  label: profile.graduationStatus === 'PURSUING' ? 'Expected Passing Year (Optional)' : 'Graduation Passing Year (Optional)',
                  type: 'number',
                  placeholder: 'e.g. 2026'
                })}
              </Grid>

              {/* Post-Graduation (Optional) */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 1.5 }}>
                Post Graduation Details (Optional)
              </Typography>
              <Grid container spacing={2.5}>
                {renderField({ name: 'postGraduationCollege', label: 'Post Graduation College (Optional)' })}
                {renderField({ name: 'postGraduationDegree', label: 'Post Graduation Degree (Optional)' })}
                {renderField({ name: 'postGraduationPassingYear', label: 'Post Graduation Passing Year (Optional)', type: 'number' })}
                {renderField({ name: 'postGraduationMarks', label: 'Post Graduation Marks (Optional)' })}
                {renderField({ name: 'postGraduationPercentage', label: 'Post Graduation Percentage (%) (Optional)', type: 'number' })}
              </Grid>
            </Paper>

            {/* 5. REQUIRED DOCUMENT UPLOADS CARD */}
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <DescriptionIcon sx={{ color: 'var(--primary, #d80202)', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                    5. Document Uploads
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Upload clear scanned copies (PDF, JPG, PNG under 10MB each)
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {renderDocumentUpload('passportPhoto', 'Passport Photograph', true, '.jpg,.jpeg,.png')}
                {renderDocumentUpload('aadharDocument', 'Aadhaar Card / Govt ID Proof', true)}
                {renderDocumentUpload('tenthMarksheet', '10th Standard Marksheet', true)}
                {renderDocumentUpload('twelfthMarksheet', '12th / Diploma Marksheet', true)}
                {renderDocumentUpload(
                  'bachelorMarksheet',
                  profile.graduationStatus === 'PURSUING' ? 'Latest Semester Marksheet / Transcript' : 'Graduation Marksheet / Degree',
                  true,
                  '.pdf,.jpg,.jpeg,.png',
                  profile.graduationStatus === 'PURSUING' ? 'Upload latest available semester marksheet / transcript' : 'Upload final graduation marksheet / degree'
                )}
                {renderDocumentUpload('familyIncomeCertificate', 'Family Income Certificate', false)}
                {renderDocumentUpload('masterMarksheet', "Master's Degree Marksheet (Optional)", false)}
              </Grid>
            </Paper>

            {/* 6. DECLARATION & SUBMISSION CARD */}
            <Paper
              ref={(el) => { if (el) fieldRefs.current['declarationAccepted'] = el; }}
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 3,
                border: fieldErrors.declarationAccepted ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                background: fieldErrors.declarationAccepted ? '#fff5f5' : '#fff'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <HowToRegIcon sx={{ color: 'var(--primary, #d80202)', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                  6. Declaration & Confirmation
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mt: 2 }}>
                <input
                  type="checkbox"
                  id="declaration-checkbox"
                  checked={profile.declarationAccepted}
                  onChange={(e) => handleFieldChange('declarationAccepted', e.target.checked)}
                  style={{ marginTop: '4px', cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary, #d80202)' }}
                />
                <label
                  htmlFor="declaration-checkbox"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: fieldErrors.declarationAccepted ? '#dc2626' : '#334155',
                    lineHeight: 1.6,
                    cursor: 'pointer'
                  }}
                >
                  I hereby declare that all information provided in this documentation form is true, correct, and complete to the best of my knowledge, and all uploaded documents are authentic.
                </label>
              </Box>

              {fieldErrors.declarationAccepted && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#dc2626',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 1,
                    ml: 4
                  }}
                >
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                  {fieldErrors.declarationAccepted}
                </Typography>
              )}

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
                  sx={{
                    background: 'var(--primary, #d80202)',
                    '&:hover': { background: 'var(--primary-dark, #b70000)' },
                    px: 6,
                    py: 1.5,
                    fontWeight: 800,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: 'none'
                  }}
                >
                  {submitting ? 'Uploading Documents...' : 'Submit Documentation'}
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : (
          /* Submission Success View */
          <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center', background: '#fff' }}>
            <Box sx={{ w: 72, h: 72, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 72, color: 'var(--success, #16a34a)' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textAlign: 'center' }}>
              Documentation Submitted Successfully!
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
              Your verification documents for Application Reference ID <strong>{candidateId}</strong> have been saved and submitted to the admin verification queue.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to={`/selection-status?candidateId=${encodeURIComponent(candidateId)}`}
                variant="contained"
                sx={{
                  background: 'var(--primary, #d80202)',
                  borderRadius: '8px',
                  px: 4,
                  py: 1.4,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { background: 'var(--primary-dark, #b70000)' },
                  boxShadow: 'none'
                }}
              >
                Check Selection Status
              </Button>
              <Button
                component={Link}
                to="/"
                variant="outlined"
                sx={{
                  borderRadius: '8px',
                  px: 3,
                  py: 1.4,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }}
              >
                Return to Home
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
