import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import HowToRegIcon from "@mui/icons-material/HowToReg";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CodeIcon from "@mui/icons-material/Code";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import VerifiedIcon from "@mui/icons-material/Verified";

const steps = [
  {
    label: "Registration",
    icon: <HowToRegIcon sx={{ color: "#D32F2F", fontSize: 32 }} />,
    desc: "Candidate fills the registration form with personal, academic, and family details.",
  },
  {
    label: "Aptitude Test",
    icon: <PsychologyIcon sx={{ color: "#D32F2F", fontSize: 32 }} />,
    desc: "Candidates attempt the aptitude test to check logical thinking and problem-solving skills.",
  },
  {
    label: "Technical Assessment",
    icon: <CodeIcon sx={{ color: "#D32F2F", fontSize: 32 }} />,
    desc: "Technical knowledge is assessed through coding, MCQs, or practical questions.",
  },
  {
    label: "HR Interview",
    icon: <RecordVoiceOverIcon sx={{ color: "#D32F2F", fontSize: 32 }} />,
    desc: "Communication, confidence, and overall suitability are checked in the interview round.",
  },
  {
    label: "Final Selection",
    icon: <VerifiedIcon sx={{ color: "#D32F2F", fontSize: 32 }} />,
    desc: "Selected candidates get access to the Student Process Tracker dashboard and training program.",
  },
];

export default function SelectionProcess() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: "#fff",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: {
              xs: "2rem",
              sm: "2.4rem",
              md: "3rem",
            },
            mb: 2,
          }}
        >
          Selection Process
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            maxWidth: 780,
            mx: "auto",
            mb: { xs: 5, md: 8 },
            fontSize: {
              xs: "14px",
              sm: "15px",
              md: "17px",
            },
            px: { xs: 2, sm: 0 },
            lineHeight: 1.8,
          }}
        >
          Candidates move through a structured roadmap before joining the training program.
        </Typography>

        {isMobile ? (
          <Box
            sx={{
              position: "relative",
              pl: 3,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 14,
                top: 0,
                bottom: 0,
                width: "2px",
                background: "#D32F2F",
                opacity: 0.25,
              }}
            />

            {steps.map((step, index) => (
              <Box
                key={step.label}
                sx={{
                  position: "relative",
                  mb: 4,
                  pl: 4,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: -1,
                    top: 8,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#D32F2F",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: "0 6px 16px rgba(211,47,47,0.25)",
                    zIndex: 2,
                  }}
                >
                  {index + 1}
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid #ECECEC",
                    background: "#FFF8F8",
                    transition: "all .3s ease",

                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "#D32F2F",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "16px",
                        background: "#FFF1F1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {step.icon}
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.15rem",
                        color: "#222",
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      color: "#666",
                      lineHeight: 1.8,
                      fontSize: "15px",
                    }}
                  >
                    {step.desc}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              py: 4,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "2px",
                background: "linear-gradient(180deg, #D32F2F 0%, #F3B0B0 100%)",
                transform: "translateX(-50%)",
                opacity: 0.35,
              }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  md: "1fr 1fr",
                },
                gap: 0,
              }}
            >
              {steps.map((step, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <Box
                    key={step.label}
                    sx={{
                      display: "flex",
                      justifyContent: isLeft ? "flex-end" : "flex-start",
                      position: "relative",
                      minHeight: 190,
                      py: 2,
                      pr: isLeft ? 4 : 0,
                      pl: isLeft ? 0 : 4,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#D32F2F",
                        border: "4px solid #fff",
                        boxShadow: "0 6px 16px rgba(211,47,47,0.25)",
                        zIndex: 3,
                      }}
                    />

                    <Paper
                      elevation={0}
                      sx={{
                        width: "100%",
                        maxWidth: 430,
                        p: 3,
                        borderRadius: 5,
                        border: "1px solid #ECECEC",
                        background: index % 2 === 0 ? "#FFF8F8" : "#fff",
                        transition: "all .3s ease",
                        position: "relative",

                        "&:hover": {
                          transform: "translateY(-6px)",
                          borderColor: "#D32F2F",
                          boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "16px",
                            background: "#FFF1F1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {step.icon}
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              color: "#D32F2F",
                              fontWeight: 700,
                              mb: 0.3,
                            }}
                          >
                            STEP {index + 1}
                          </Typography>

                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "1.25rem",
                              color: "#222",
                            }}
                          >
                            {step.label}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        sx={{
                          color: "#666",
                          lineHeight: 1.85,
                          fontSize: "15px",
                        }}
                      >
                        {step.desc}
                      </Typography>
                    </Paper>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}