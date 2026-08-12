import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import heroImage from "../../assets/Banner-ITEP.jpg";

export default function Hero() {
  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={5} sx={{ alignItems: "center" }}>
            <Grid xs={12} md={7}>
              <Typography
                sx={{
                  color: "#e20101",
                  fontWeight: 600,
                  mb: 2,
                  letterSpacing: 2,
                }}
              >
                INFOBEANS FOUNDATION
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  lineHeight: 1.2,
                  mb: 3,
                  fontSize: {
                    xs: "2.3rem",
                    md: "4rem",
                  },
                }}
              >
                Student Process Tracker
              </Typography>

              <Typography
                sx={{
                  fontSize: 20,
                  color: "#eeeeee",
                  mb: 4,
                  maxWidth: 650,
                  lineHeight: 1.8,
                }}
              >
                Learn from industry experts, participate in aptitude and
                technical assessments, join live projects, and become
                industry-ready through the Information Technology Excellence
                Program.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  component={Link}
                  to="/registration"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: "50px",
                    fontSize: 16,
                    fontWeight: 700,
                    background: "#df1515",

                    "&:hover": {
                      background: "#ffffff",
                      color: "#df1515"
                    },
                  }}
                >
                  Apply Now
                </Button>
              </Box>
            </Grid>

            <Grid xs={12} md={5}></Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}