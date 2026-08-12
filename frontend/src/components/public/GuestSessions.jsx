import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VideocamIcon from "@mui/icons-material/Videocam";
import BusinessIcon from "@mui/icons-material/Business";

const guestSessions = [
  {
    company: "InfoBeans",
    speaker: "Senior Developer",
    topic: "Industry Coding Practices",
    date: "12 Aug 2026",
    mode: "Offline",
  },
  {
    company: "TCS",
    speaker: "Technical Lead",
    topic: "Career Readiness & Skills",
    date: "19 Aug 2026",
    mode: "Online",
  },
  {
    company: "Infosys",
    speaker: "HR Manager",
    topic: "Interview Preparation",
    date: "26 Aug 2026",
    mode: "Offline",
  },
  {
    company: "Wipro",
    speaker: "Full Stack Engineer",
    topic: "Live Project Experience",
    date: "02 Sep 2026",
    mode: "Online",
  },
];

export default function GuestSessions() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, background: "#F8F9FC" }}>
      <Container maxWidth="xl">
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: { xs: "2rem", md: "3rem" },
            mb: 2,
          }}
        >
          Guest Sessions
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            maxWidth: 750,
            mx: "auto",
            mb: 6,
            fontSize: { xs: "15px", md: "17px" },
            px: { xs: 2, sm: 0 },
          }}
        >
          Industry experts and company professionals share knowledge, career guidance, and real-world experience.
        </Typography>

        <Grid container spacing={4}>
          {guestSessions.map((session, index) => (
            <Grid xs={12} sm={6} lg={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 5,
                  border: "1px solid #ECECEC",
                  transition: "0.35s ease",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 18px 35px rgba(0,0,0,0.12)",
                    borderColor: "#D32F2F",
                  },
                }}
              >
                <Box
                  sx={{
                    height: 6,
                    background: "#D32F2F",
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <BusinessIcon sx={{ color: "#D32F2F" }} />
                    <Typography sx={{ fontWeight: 800 }}>
                      {session.company}
                    </Typography>
                  </Box>

                  <Typography sx={{ color: "#333", fontWeight: 700, mb: 1 }}>
                    {session.topic}
                  </Typography>

                  <Typography sx={{ color: "#666", mb: 2 }}>
                    Speaker: {session.speaker}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EventIcon sx={{ fontSize: 18, color: "#D32F2F" }} />
                      <Typography variant="body2" color="text.secondary">
                        {session.date}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {session.mode === "Online" ? (
                        <VideocamIcon sx={{ fontSize: 18, color: "#D32F2F" }} />
                      ) : (
                        <LocationOnIcon sx={{ fontSize: 18, color: "#D32F2F" }} />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {session.mode}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label="Upcoming"
                    size="small"
                    sx={{
                      mt: 3,
                      background: "#FFF1F1",
                      color: "#D32F2F",
                      fontWeight: 700,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            variant="contained"
            sx={{
              background: "#D32F2F",
              borderRadius: "40px",
              px: 4,
              py: 1.4,
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                background: "#B71C1C",
              },
            }}
          >
            View All Sessions
          </Button>
        </Box>
      </Container>
    </Box>
  );
}