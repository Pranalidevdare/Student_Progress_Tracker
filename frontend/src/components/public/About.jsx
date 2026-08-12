import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
} from "@mui/material";

import DoneIcon from "@mui/icons-material/Done";

import img1 from "../../assets/about.jpg";
import img2 from "../../assets/about-2.jpg";
import img3 from "../../assets/about-3.jpg";

const programs = [
  "Computer software programming: Java, HTML, CSS, Database, JavaScript, MERN (Node.js, MongoDB, React JS, REST APIs) and live projects.",
  "Advanced computer skills: Word, Excel, PowerPoint.",
  "English language skills: Vocabulary, Conversation, Phonetics and Functional Grammar.",
  "Soft skills: Interview preparation, Resume building and Communication."
];

export default function ProgramsSection() {
  return (
    <Box
      sx={{
        background: "#FFF9EF",
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="xl">

        <Typography
          align="center"
          sx={{
            fontSize: {
              xs: "2rem",
              md: "3rem",
            },
            fontWeight: 700,
            mb: 8,
          }}
        >
          Our{" "}
          <Box
            component="span"
            sx={{
              color: "#D32F2F",
            }}
          >
            Programs
          </Box>
        </Typography>

        <Grid
          container
          spacing={8}
          alignItems="center"
        >

          {/* LEFT */}

          <Grid size={{ xs: 12, md: 5 }}>

            {programs.map((item, index) => (

              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 4,
                }}
              >

                <DoneIcon
                  sx={{
                    color: "#B98E5A",
                    mt: 0.5,
                    mr: 2,
                  }}
                />

                <Typography
                  sx={{
                    color: "#444",
                    lineHeight: 1.9,
                    fontSize: {
                      xs: 15,
                      md: 16,
                    },
                  }}
                >
                  {item}
                </Typography>

              </Box>

            ))}

          </Grid>

          {/* RIGHT */}

          <Grid
            size={{ xs: 12, md: 7 }}
          >

            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: {
                  xs: 550,
                  md: 520,
                },
              }}
            >

              {/* TOP */}

              <Box
                component="img"
                src={img1}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: {
                    xs: "50%",
                    md: "35%",
                  },
                  transform: {
                    xs: "translateX(-50%)",
                    md: "none",
                  },
                  width: {
                    xs: 220,
                    md: 250,
                  },
                  height: {
                    xs: 220,
                    md: 250,
                  },
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "8px solid white",
                  boxShadow: "0 12px 35px rgba(0,0,0,.18)",
                }}
              />

              {/* RIGHT */}

              <Box
                component="img"
                src={img2}
                sx={{
                  position: "absolute",
                  top: {
                    xs: 170,
                    md: 120,
                  },
                  right: {
                    xs: "50%",
                    md: 30,
                  },
                  transform: {
                    xs: "translateX(50%)",
                    md: "none",
                  },
                  width: {
                    xs: 220,
                    md: 250,
                  },
                  height: {
                    xs: 220,
                    md: 250,
                  },
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "8px solid white",
                  boxShadow: "0 12px 35px rgba(0,0,0,.18)",
                }}
              />

              {/* BOTTOM */}

              <Box
                component="img"
                src={img3}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: {
                    xs: "50%",
                    md: "28%",
                  },
                  transform: {
                    xs: "translateX(-50%)",
                    md: "none",
                  },
                  width: {
                    xs: 220,
                    md: 250,
                  },
                  height: {
                    xs: 220,
                    md: 250,
                  },
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "8px solid white",
                  boxShadow: "0 12px 35px rgba(0,0,0,.18)",
                }}
              />

            </Box>

          </Grid>

        </Grid>

      </Container>
    </Box>
  );
}