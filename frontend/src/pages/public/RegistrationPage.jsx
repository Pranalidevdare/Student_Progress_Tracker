import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Stack,
  Alert
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";
import { applicationApi } from "../../api/apiServices";
import { Link } from "react-router-dom";

const branches = ["AIML", "AIDS", "COMP", "ENTC", "VLSI", "MECH", "IT", "BCS", "BCOM", "BCA", "MBA", "Other"];
const colleges = ["ISBM COE", "JSPM COE", "JSPM JSIMR", "JSPM JSCOCS", "PVG", "PJOG", "Ahemdnagar College", "COCS", "Other"];

const initialForm = {
  fullName: "",
  contactNumber: "",
  emailId: "",
  fatherOccupation: "",
  fatherContactNumber: "",
  motherOccupation: "",
  motherContactNumber: "",
  familyIncome: "",
  branch: "",
  yearOfStudy: "",
  collegeName: "",
  customCollegeName: "",
  interestedInITEP: "Yes",
  additionalComments: "",
};

const isValidIndianMobile = (value) => /^[6-9]\d{9}$/.test(String(value || '').trim());
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export default function RegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppNum, setSubmittedAppNum] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "collegeName" && value !== "Other") {
      setErrors((prev) => ({ ...prev, customCollegeName: "" }));
    }
  };

  const saveApplicationLocally = (newApp) => {
    try {
      const existingRaw = localStorage.getItem('spt_registered_applications');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [newApp, ...existing.filter(a => a.email !== newApp.email)];
      localStorage.setItem('spt_registered_applications', JSON.stringify(updated));
    } catch (e) {
      console.warn('Saved application locally');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name
    if (!form.fullName.trim()) {
      newErrors.fullName = "Candidate name is required.";
    } else if (form.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters.";
    }

    // Contact Number
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = "Please enter a valid mobile number.";
    } else if (!isValidIndianMobile(form.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid 10-digit mobile number starting with 6–9.";
    }

    // Email ID
    if (!form.emailId.trim()) {
      newErrors.emailId = "Please enter a valid email address.";
    } else if (!isValidEmail(form.emailId)) {
      newErrors.emailId = "Please enter a valid email address.";
    }

    // Father Details
    if (!form.fatherOccupation.trim()) {
      newErrors.fatherOccupation = "Father's occupation is required.";
    }
    if (!form.fatherContactNumber.trim()) {
      newErrors.fatherContactNumber = "Please enter a valid father contact number.";
    } else if (!isValidIndianMobile(form.fatherContactNumber)) {
      newErrors.fatherContactNumber = "Please enter a valid father contact number.";
    }

    // Mother Details
    if (!form.motherOccupation.trim()) {
      newErrors.motherOccupation = "Mother's occupation is required.";
    }
    if (!form.motherContactNumber.trim()) {
      newErrors.motherContactNumber = "Please enter a valid mother contact number.";
    } else if (!isValidIndianMobile(form.motherContactNumber)) {
      newErrors.motherContactNumber = "Please enter a valid mother contact number.";
    }

    // Family Income
    if (!form.familyIncome || Number(form.familyIncome) <= 0) {
      newErrors.familyIncome = "Family income should be greater than zero.";
    }

    // Branch
    if (!form.branch) {
      newErrors.branch = "Please select a branch.";
    }

    // Year of Study
    if (!form.yearOfStudy) {
      newErrors.yearOfStudy = "Please select year of study.";
    }

    // College Name
    if (!form.collegeName) {
      newErrors.collegeName = "Please select a college.";
    } else if (form.collegeName === "Other" && !form.customCollegeName.trim()) {
      newErrors.customCollegeName = "Please enter your college name.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorMessage = Object.values(validationErrors)[0];
      toast.error(firstErrorMessage);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const generatedAppNum = `APP${Math.floor(1000 + Math.random() * 9000)}`;
    const familyIncomeVal = Number(form.familyIncome);
    const calculatedStatus = familyIncomeVal <= 400000 ? 'ELIGIBLE_FOR_APTITUDE' : 'NOT_ELIGIBLE';
    const effectiveCollegeName = form.collegeName === "Other" ? form.customCollegeName.trim() : form.collegeName;

    try {
      // Map frontend form values to backend DTO expected types/names
      const payload = {
        fullName: form.fullName.trim(),
        email: form.emailId.trim(),
        mobile: form.contactNumber.trim(),
        fatherOccupation: form.fatherOccupation.trim(),
        fatherContactNumber: form.fatherContactNumber.trim(),
        motherOccupation: form.motherOccupation.trim(),
        motherContactNumber: form.motherContactNumber.trim(),
        familyIncome: familyIncomeVal,
        branch: form.branch,
        yearOfStudy: form.yearOfStudy,
        collegeName: effectiveCollegeName,
        interestedInITEP: form.interestedInITEP === "Yes",
        additionalComments: form.additionalComments,
        applicationNumber: generatedAppNum
      };

      const response = await applicationApi.submit(payload);
      const realAppNum = response?.data?.applicationNumber || generatedAppNum;

      const newAppRecord = {
        id: `app_${Date.now()}`,
        applicationNumber: realAppNum,
        fullName: form.fullName,
        email: form.emailId,
        mobile: form.contactNumber,
        collegeName: effectiveCollegeName,
        branch: form.branch,
        yearOfStudy: form.yearOfStudy,
        familyIncome: familyIncomeVal,
        status: calculatedStatus,
        createdAt: new Date().toISOString()
      };

      saveApplicationLocally(newAppRecord);
      toast.success("Registration Received!");
      setSubmittedAppNum(realAppNum);
      setSubmittedEmail(form.emailId);
    } catch (error) {
      console.error('Application submission failed:', error);
      const backendData = error?.response?.data;

      // Handle backend validation map: { email: "Invalid email format", mobile: "..." }
      if (backendData && typeof backendData === 'object' && !backendData.message) {
        const mappedErrors = {};
        if (backendData.email) mappedErrors.emailId = backendData.email;
        if (backendData.mobile) mappedErrors.contactNumber = backendData.mobile;
        if (backendData.fullName) mappedErrors.fullName = backendData.fullName;
        if (backendData.fatherOccupation) mappedErrors.fatherOccupation = backendData.fatherOccupation;
        if (backendData.fatherContactNumber) mappedErrors.fatherContactNumber = backendData.fatherContactNumber;
        if (backendData.motherOccupation) mappedErrors.motherOccupation = backendData.motherOccupation;
        if (backendData.motherContactNumber) mappedErrors.motherContactNumber = backendData.motherContactNumber;
        if (backendData.familyIncome) mappedErrors.familyIncome = backendData.familyIncome;
        if (backendData.branch) mappedErrors.branch = backendData.branch;
        if (backendData.yearOfStudy) mappedErrors.yearOfStudy = backendData.yearOfStudy;
        if (backendData.collegeName) {
          if (form.collegeName === "Other") {
            mappedErrors.customCollegeName = backendData.collegeName;
          } else {
            mappedErrors.collegeName = backendData.collegeName;
          }
        }
        setErrors(mappedErrors);
        const firstBackendError = Object.values(backendData)[0];
        toast.error(firstBackendError || "Please correct the highlighted fields.");
      } else {
        const specificMessage = backendData?.message || error.message || 'Please check the form values and try again.';
        toast.error(specificMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#f8fafc", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: 'var(--primary)', fontWeight: 700 }}>
            Back to Home
          </Button>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #dadce0", background: "#fff" }}>
          {/* Header */}
          <Box sx={{ background: 'var(--primary)', color: "#fff", px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 } }}>
            <Typography sx={{ fontSize: { xs: "1.6rem", sm: "2rem" }, fontWeight: 700, mb: 1 }}>
              Candidate Registration Portal
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 15 }, opacity: 0.95 }}>
              Register for the InfoBeans Foundation IT Excellence Training Program (ITEP).
            </Typography>
          </Box>

          {submittedAppNum ? (
            <Box sx={{ p: { xs: 4, md: 6 }, textAlign: "center" }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: 'var(--success)', mb: 2 }} />
              
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                Application Received!
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#64748b", mb: 3 }}>
                Your application has been successfully received.
              </Typography>

              <Alert severity="success" sx={{ my: 3, maxWidth: 540, mx: "auto", textAlign: "left", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: "0.95rem" }}>
                  Application Reference ID: <strong>{submittedAppNum}</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: "#1e293b", fontSize: "0.875rem", mb: 1 }}>
                  A confirmation message has been logged for <strong>{submittedEmail}</strong>.
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: "rgba(46, 125, 50, 0.2)" }} />
                <Typography variant="body2" sx={{ color: "#1e293b", fontSize: "0.875rem", fontWeight: 700, mb: 0.5 }}>
                  Instructions:
                </Typography>
                <Typography variant="body2" sx={{ color: "#1e293b", fontSize: "0.875rem", mb: 1 }}>
                  Please save this Application Reference ID. You can use this ID to check your selection status.
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.825rem" }}>
                  Our admissions committee is reviewing your details. Once verified, you will be notified regarding your aptitude test schedule and next steps.
                </Typography>
              </Alert>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4, flexWrap: "wrap" }}>
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  sx={{ background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' }, px: 4, py: 1, fontWeight: 700 }}
                >
                  OK
                </Button>
                <Button
                  component={Link}
                  to="/selection-status"
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  sx={{ color: "#334155", borderColor: "#cbd5e1", px: 3, py: 1, fontWeight: 600 }}
                >
                  Check Selection Status
                </Button>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                <Typography sx={{ fontWeight: 700, color: "#202124", fontSize: 16 }}>Personal Details</Typography>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName}
                  required
                />
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  error={Boolean(errors.contactNumber)}
                  helperText={errors.contactNumber}
                  required
                  inputProps={{ maxLength: 10 }}
                />
                <TextField
                  fullWidth
                  label="Email ID"
                  name="emailId"
                  value={form.emailId}
                  onChange={handleChange}
                  type="email"
                  error={Boolean(errors.emailId)}
                  helperText={errors.emailId}
                  required
                />

                <Divider />
                <Typography sx={{ fontWeight: 700, color: "#202124", fontSize: 16 }}>Parent Details</Typography>
                <TextField
                  fullWidth
                  label="Father's Occupation"
                  name="fatherOccupation"
                  value={form.fatherOccupation}
                  onChange={handleChange}
                  error={Boolean(errors.fatherOccupation)}
                  helperText={errors.fatherOccupation}
                  required
                />
                <TextField
                  fullWidth
                  label="Father's Contact"
                  name="fatherContactNumber"
                  value={form.fatherContactNumber}
                  onChange={handleChange}
                  error={Boolean(errors.fatherContactNumber)}
                  helperText={errors.fatherContactNumber}
                  required
                  inputProps={{ maxLength: 10 }}
                />
                <TextField
                  fullWidth
                  label="Mother's Occupation"
                  name="motherOccupation"
                  value={form.motherOccupation}
                  onChange={handleChange}
                  error={Boolean(errors.motherOccupation)}
                  helperText={errors.motherOccupation}
                  required
                />
                <TextField
                  fullWidth
                  label="Mother's Contact"
                  name="motherContactNumber"
                  value={form.motherContactNumber}
                  onChange={handleChange}
                  error={Boolean(errors.motherContactNumber)}
                  helperText={errors.motherContactNumber}
                  required
                  inputProps={{ maxLength: 10 }}
                />

                <Divider />
                <Typography sx={{ fontWeight: 700, color: "#202124", fontSize: 16 }}>Academic Details</Typography>
                <TextField
                  fullWidth
                  label="Family Annual Income (₹)"
                  type="number"
                  name="familyIncome"
                  value={form.familyIncome}
                  onChange={handleChange}
                  error={Boolean(errors.familyIncome)}
                  helperText={errors.familyIncome}
                  required
                />
                
                <TextField
                  select
                  fullWidth
                  label="Branch"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  error={Boolean(errors.branch)}
                  helperText={errors.branch}
                  required
                >
                  {branches.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Year of Study"
                  name="yearOfStudy"
                  value={form.yearOfStudy}
                  onChange={handleChange}
                  error={Boolean(errors.yearOfStudy)}
                  helperText={errors.yearOfStudy}
                  required
                >
                  <MenuItem value="1st Year">1st Year</MenuItem>
                  <MenuItem value="2nd Year">2nd Year</MenuItem>
                  <MenuItem value="3rd Year">3rd Year</MenuItem>
                  <MenuItem value="4th Year">4th Year</MenuItem>
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="College Name"
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleChange}
                  error={Boolean(errors.collegeName)}
                  helperText={errors.collegeName}
                  required
                >
                  {colleges.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>

                {form.collegeName === "Other" && (
                  <TextField
                    fullWidth
                    label="College Name"
                    placeholder="Enter your college name"
                    name="customCollegeName"
                    value={form.customCollegeName}
                    onChange={handleChange}
                    error={Boolean(errors.customCollegeName)}
                    helperText={errors.customCollegeName}
                    required
                  />
                )}

                <Divider />
                <Typography sx={{ fontWeight: 700, color: "#202124", fontSize: 16 }}>Program Preferences</Typography>
                <FormControl>
                  <FormLabel sx={{ color: "#202124", mb: 1 }}>Interested in ITEP Program?</FormLabel>
                  <RadioGroup name="interestedInITEP" value={form.interestedInITEP} onChange={handleChange} row>
                    <FormControlLabel value="Yes" control={<Radio color="error" />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio color="error" />} label="No" />
                    <FormControlLabel value="Maybe" control={<Radio color="error" />} label="Maybe" />
                  </RadioGroup>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Comments"
                  name="additionalComments"
                  value={form.additionalComments}
                  onChange={handleChange}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ background: 'var(--primary)', borderRadius: "999px", px: 4, py: 1.2, fontWeight: 700, '&:hover': { background: 'var(--primary-dark)' } }}
                  >
                    {submitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
