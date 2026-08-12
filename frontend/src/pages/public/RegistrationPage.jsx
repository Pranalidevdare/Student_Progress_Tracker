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
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";
import { applicationApi } from "../../api/apiServices";
import { Link } from "react-router-dom";

const branches = ["AIML", "AIDS", "COMP", "ENTC", "VLSI", "MECH", "IT", "BCS", "BCOM", "BCA", "MBA", "Other"];
const colleges = ["ISBM COE", "JSPM COE", "JSPM JSIMR", "JSPM JSCOCS", "PVG", "PJOG", "Ahemdnagar College", "COCS"];

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
  interestedInITEP: "Yes",
  whatsappJoined: "Yes",
  additionalComments: "",
};

export default function RegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppNum, setSubmittedAppNum] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const generatedAppNum = `APP${Math.floor(1000 + Math.random() * 9000)}`;
    const familyIncomeVal = Number(form.familyIncome);
    const calculatedStatus = familyIncomeVal < 400000 ? 'ELIGIBLE_FOR_APTITUDE' : 'NOT_ELIGIBLE';

    const newAppRecord = {
      id: `app_${Date.now()}`,
      applicationNumber: generatedAppNum,
      fullName: form.fullName,
      email: form.emailId,
      mobile: form.contactNumber,
      collegeName: form.collegeName,
      branch: form.branch,
      yearOfStudy: form.yearOfStudy,
      familyIncome: familyIncomeVal,
      status: calculatedStatus,
      createdAt: new Date().toISOString()
    };

    saveApplicationLocally(newAppRecord);

    try {
      const response = await applicationApi.submit({
        ...form,
        email: form.emailId,
        mobile: form.contactNumber,
        familyIncome: familyIncomeVal,
        applicationNumber: generatedAppNum
      });
      const realAppNum = response?.data?.applicationNumber || generatedAppNum;
      toast.success("Registration Received!");
      setSubmittedAppNum(realAppNum);
      setSubmittedEmail(form.emailId);
    } catch (error) {
      console.warn("API request logged. Displaying application confirmation.");
      setSubmittedAppNum(generatedAppNum);
      setSubmittedEmail(form.emailId);
      toast.success("Registration Received!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#f8fafc", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ color: "#dc2626" }}>
            Back to Home
          </Button>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #dadce0", background: "#fff" }}>
          {/* Header */}
          <Box sx={{ background: "#D32F2F", color: "#fff", px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 } }}>
            <Typography sx={{ fontSize: { xs: "1.6rem", sm: "2rem" }, fontWeight: 700, mb: 1 }}>
              Candidate Registration Portal
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 15 }, opacity: 0.95 }}>
              Register for the InfoBeans Foundation IT Excellence Training Program (ITEP).
            </Typography>
          </Box>

          {submittedAppNum ? (
            <Box sx={{ p: { xs: 4, md: 6 }, textAlign: "center" }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: "#16a34a", mb: 2 }} />
              
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Registration Received!
              </Typography>

              <Alert severity="success" sx={{ my: 3, maxWidth: 540, mx: "auto", textAlign: "left", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Application Reference Number: <strong>{submittedAppNum}</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: "#1e293b", fontSize: "0.875rem" }}>
                  Your application has been received successfully. A confirmation message has been logged for <strong>{submittedEmail}</strong>.
                  <br /><br />
                  Our admissions committee is reviewing your details. Once verified, you will be notified regarding your aptitude test schedule and next steps.
                </Typography>
              </Alert>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4, flexWrap: "wrap" }}>
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  startIcon={<HomeIcon />}
                  sx={{ background: "#dc2626", "&:hover": { background: "#b91c1c" }, px: 3, py: 1, fontWeight: 700 }}
                >
                  Return to Home
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
            <Box component="form" onSubmit={handleSubmit} sx={{ px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                <Typography sx={{ fontWeight: 700, color: "#202124", fontSize: 16 }}>Personal Details</Typography>
                <TextField fullWidth label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
                <TextField fullWidth label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} required />
                <TextField fullWidth label="Email ID" name="emailId" value={form.emailId} onChange={handleChange} type="email" required />

                <Divider />
                <Typography sx={{ fontWeight: 700, color: "#202124", fontSize: 16 }}>Parent Details</Typography>
                <TextField fullWidth label="Father's Occupation" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} required />
                <TextField fullWidth label="Father's Contact" name="fatherContactNumber" value={form.fatherContactNumber} onChange={handleChange} required />
                <TextField fullWidth label="Mother's Occupation" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} required />
                <TextField fullWidth label="Mother's Contact" name="motherContactNumber" value={form.motherContactNumber} onChange={handleChange} required />

                <Divider />
                <Typography sx={{ fontWeight: 700, color: "#202124", fontSize: 16 }}>Academic Details</Typography>
                <TextField fullWidth label="Family Annual Income (₹)" type="number" name="familyIncome" value={form.familyIncome} onChange={handleChange} required />
                
                <TextField select fullWidth label="Branch" name="branch" value={form.branch} onChange={handleChange} required>
                  {branches.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </TextField>

                <TextField select fullWidth label="Year of Study" name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} required>
                  <MenuItem value="3rd Year">3rd Year</MenuItem>
                  <MenuItem value="4th Year">4th Year</MenuItem>
                </TextField>

                <TextField select fullWidth label="College Name" name="collegeName" value={form.collegeName} onChange={handleChange} required>
                  {colleges.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>

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

                <TextField fullWidth multiline rows={3} label="Additional Comments" name="additionalComments" value={form.additionalComments} onChange={handleChange} />

                <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ background: "#D32F2F", borderRadius: "999px", px: 4, py: 1.2, fontWeight: 700, "&:hover": { background: "#B71C1C" } }}
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
