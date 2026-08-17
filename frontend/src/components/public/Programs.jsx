import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
  Stack
} from "@mui/material";

import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LanguageIcon from "@mui/icons-material/Language";
import TerminalIcon from "@mui/icons-material/Terminal";
import GroupsIcon from "@mui/icons-material/Groups";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";

const programs = [
  {
    id: "java",
    title: "Java Full Stack",
    icon: <CodeIcon sx={{ fontSize: 44, color: "#D32F2F" }} />,
    description:
      "Master Java, Spring Boot, React, REST APIs and MySQL with hands-on projects and industry-oriented training.",
    duration: "6 Months (Full-Time)",
    level: "Beginner to Advanced",
    overview: "The Java Full Stack program is designed to build high-performance software engineers capable of building scalable enterprise web applications.",
    modules: [
      "Core Java & Object-Oriented Programming (OOP)",
      "Spring Boot 3.x, Hibernate & Spring Data JPA",
      "RESTful API Microservices & Security",
      "Frontend UI with React.js, Vite & Modern CSS",
      "Database Architecture with MySQL & MongoDB",
      "Git, Maven, Docker & Production Deployment"
    ],
    outcomes: "Qualifies for roles like Java Developer, Full-Stack Software Engineer, and Backend Microservices Specialist."
  },
  {
    id: "mern",
    title: "MERN Stack",
    icon: <LanguageIcon sx={{ fontSize: 44, color: "#D32F2F" }} />,
    description:
      "Build modern web applications using MongoDB, Express, React and Node.js with real-world use cases.",
    duration: "6 Months (Full-Time)",
    level: "Beginner to Advanced",
    overview: "Comprehensive JavaScript-driven full-stack development program for building real-time, responsive web applications.",
    modules: [
      "Modern ES6+ JavaScript & Asynchronous Programming",
      "React.js Component Architecture, Context API & Redux",
      "Node.js Runtime & Express.js Server Framework",
      "NoSQL Database Management with MongoDB & Mongoose",
      "JWT Authentication & OAuth Security Patterns",
      "Full-Stack Web App Deployment on Cloud Platforms"
    ],
    outcomes: "Qualifies for roles like MERN Developer, Frontend Specialist, and Node.js Backend Engineer."
  },
  {
    id: "python",
    title: "Python Development",
    icon: <TerminalIcon sx={{ fontSize: 44, color: "#D32F2F" }} />,
    description:
      "Learn Python programming, automation, backend development and problem-solving from the basics.",
    duration: "4 Months (Full-Time)",
    level: "Beginner to Intermediate",
    overview: "Hands-on Python development program focusing on backend web development, automation scripts, and database integrations.",
    modules: [
      "Python Basics, Data Types & Control Flow",
      "Object-Oriented Python & Functional Paradigm",
      "Django & Fast API Backend Frameworks",
      "Database Connectivity with PostgreSQL & SQLite",
      "Web Scraping, Automation & API Integrations",
      "Unit Testing & Production Deployment"
    ],
    outcomes: "Qualifies for roles like Python Developer, Backend Web Engineer, and Automation Specialist."
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    icon: <StorageIcon sx={{ fontSize: 44, color: "#D32F2F" }} />,
    description:
      "Strengthen problem-solving skills with arrays, linked lists, trees, graphs, sorting and searching.",
    duration: "3 Months (Intensive)",
    level: "Intermediate to Advanced",
    overview: "Rigorous algorithmic problem-solving program to crack competitive coding tests and technical interview rounds.",
    modules: [
      "Time & Space Complexity Analysis (Big-O)",
      "Arrays, Strings & Two-Pointer Patterns",
      "Stacks, Queues & Linked List Operations",
      "Recursion, Backtracking & Dynamic Programming",
      "Trees, Binary Search Trees & Graph Algorithms",
      "LeetCode & CodeChef Interview Mock Sets"
    ],
    outcomes: "Qualifies for technical coding evaluations at top product and service IT organizations."
  },
  {
    id: "aptitude",
    title: "Aptitude & Reasoning",
    icon: <PsychologyIcon sx={{ fontSize: 44, color: "#D32F2F" }} />,
    description:
      "Prepare for placement tests with quantitative aptitude, logical reasoning and verbal ability practice.",
    duration: "2 Months (Continuous)",
    level: "All Levels",
    overview: "Structured placement readiness training covering numerical calculations, logical deduction, and verbal comprehension.",
    modules: [
      "Quantitative Aptitude: Speed Maths, Percentages, Ratio, Profit & Loss",
      "Time, Speed, Distance & Work Calculations",
      "Logical Reasoning: Seating Arrangements, Coding-Decoding, Puzzles",
      "Verbal Ability: Grammar, Vocabulary, Reading Comprehension",
      "Speed Accuracy Shortcuts & Mental Math Tips",
      "Mock Placement Aptitude Tests under Speed Constraints"
    ],
    outcomes: "Ensures high performance in campus placement aptitude screenings."
  },
  {
    id: "softskills",
    title: "Soft Skills & HR Preparation",
    icon: <GroupsIcon sx={{ fontSize: 44, color: "#D32F2F" }} />,
    description:
      "Improve communication, confidence, interview skills, resume building and group discussion performance.",
    duration: "2 Months (Continuous)",
    level: "All Levels",
    overview: "Comprehensive personality development and interview readiness training designed to transform students into corporate-ready professionals.",
    modules: [
      "Corporate English Communication & Body Language",
      "Professional Resume & LinkedIn Profile Optimization",
      "Mock HR Interviews & Behavioral Question Practice",
      "Group Discussion (GD) Tactics & Current Affairs Analysis",
      "Email Etiquette, Presentation Skills & Workplace Culture",
      "Confidence Building & Personal Grooming Workshops"
    ],
    outcomes: "Prepares students to clear HR round interviews and transition smoothly into IT careers."
  },
];

export default function Programs() {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const handleOpenModal = (program) => {
    setSelectedProgram(program);
  };

  const handleCloseModal = () => {
    setSelectedProgram(null);
  };

  return (
    <Box
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        background: "#F8F9FC",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          sx={{
            fontWeight: 800,
            textAlign: "center",
            fontSize: {
              xs: "1.9rem",
              sm: "2.4rem",
              md: "3rem",
            },
            mb: 2,
          }}
        >
          Our Training Programs
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            maxWidth: 700,
            mx: "auto",
            mb: { xs: 5, md: 7 },
            fontSize: {
              xs: "14px",
              sm: "15px",
              md: "17px",
            },
            px: { xs: 2, sm: 0 },
            lineHeight: 1.8,
          }}
        >
          Industry-oriented programs designed to prepare students for real-world careers through practical learning,
          assessments, mentorship and live projects.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 3, sm: 3, md: 4 },
          }}
        >
          {programs.map((program, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 5,
                p: { xs: 2.5, sm: 3, md: 3 },
                border: "1px solid #ECECEC",
                transition: "all .35s ease",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                minHeight: { xs: "auto", sm: 320, md: 340 },

                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,.12)",
                  borderColor: "#D32F2F",
                },
              }}
            >
              <CardContent sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Box
                    sx={{
                      width: { xs: 60, sm: 64 },
                      height: { xs: 60, sm: 64 },
                      borderRadius: "16px",
                      background: "#FFF2F2",
                      display: "flex",
                      alignItems: "center",
                      justify: "center",
                      mb: 2.5,
                    }}
                  >
                    {program.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: {
                        xs: 20,
                        sm: 22,
                        md: 24,
                      },
                      mb: 1.5,
                      color: "#222",
                    }}
                  >
                    {program.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#666",
                      lineHeight: 1.7,
                      fontSize: {
                        xs: 14,
                        sm: 14.5,
                        md: 15,
                      },
                    }}
                  >
                    {program.description}
                  </Typography>
                </Box>

                <Button
                  onClick={() => handleOpenModal(program)}
                  sx={{
                    mt: 3,
                    color: "#D32F2F",
                    p: 0,
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    minWidth: "auto",

                    "&:hover": {
                      background: "transparent",
                      color: "#B71C1C",
                    },
                  }}
                >
                  Learn More →
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Learn More Information Dialog Modal */}
        <Dialog
          open={Boolean(selectedProgram)}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, p: 1 }
          }}
        >
          {selectedProgram && (
            <>
              <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", alignItems: "center", justify: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, background: "var(--primary-light)" }}>
                    {selectedProgram.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827" }}>
                      {selectedProgram.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip label={selectedProgram.duration} size="small" sx={{ background: "#fee2e2", color: "var(--primary-dark)", fontWeight: 700, fontSize: 11 }} />
                      <Chip label={selectedProgram.level} size="small" sx={{ background: "#f1f5f9", color: "#334155", fontWeight: 600, fontSize: 11 }} />
                    </Stack>
                  </Box>
                </Box>
                <IconButton onClick={handleCloseModal} sx={{ color: "#9ca3af" }}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <Divider />

              <DialogContent sx={{ py: 3, px: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f2937", mb: 1 }}>
                  Program Overview
                </Typography>
                <Typography variant="body2" sx={{ color: "#4b5563", lineHeight: 1.7, mb: 3 }}>
                  {selectedProgram.overview}
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f2937", mb: 1.5 }}>
                  Key Modules & Curriculum
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mb: 3 }}>
                  {selectedProgram.modules.map((mod, idx) => (
                      <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1.2, background: "#f8fafc", borderRadius: 2, border: "1px solid #f1f5f9" }}>
                      <CheckCircleIcon sx={{ color: "var(--success)", fontSize: 18, mt: 0.2 }} />
                      <Typography variant="body2" sx={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
                        {mod}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f2937", mb: 1 }}>
                  Career Opportunities & Target Roles
                </Typography>
                <Typography variant="body2" sx={{ color: "#1e293b", background: "#f0fdf4", border: "1px solid #bbf7d0", p: 2, borderRadius: 2, fontSize: 13, fontWeight: 600 }}>
                  🎯 {selectedProgram.outcomes}
                </Typography>
              </DialogContent>

              <Divider />

              <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
                <Button onClick={handleCloseModal} sx={{ color: "#6b7280", fontWeight: 600 }}>
                  Close
                </Button>
                <Button
                  component={Link}
                  to="/registration"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' }, px: 3, py: 1, borderRadius: '50px', fontWeight: 700 }}
                >
                  Apply for this Program
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}