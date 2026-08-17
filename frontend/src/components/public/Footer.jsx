import React from "react";
import { Box, Container, Typography, Grid, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        background: "#111",
        color: "#fff",
        py: { xs: 5, md: 6 },
        mt: 8,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid xs={12} md={4}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 22,
                mb: 2,
              }}
            >
              InfoBeans Foundation
            </Typography>
            <Typography
              sx={{
                color: "#ccc",
                lineHeight: 1.8,
                fontSize: 15,
              }}
            >
              Student Process Tracker portal for registration, selection,
              training, performance tracking, and student management.
            </Typography>
          </Grid>

          <Grid xs={12} sm={6} md={2}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="#" underline="none" color="#ccc">
                Home
              </Link>
              <Link href="#" underline="none" color="#ccc">
                About
              </Link>
              <Link href="#" underline="none" color="#ccc">
                Programs
              </Link>
              <Link href="#" underline="none" color="#ccc">
                Contact
              </Link>
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              Contact
            </Typography>
            <Typography sx={{ color: "#ccc", fontSize: 15, lineHeight: 1.9 }}>
              Email: info@infobeansfoundation.com
              <br />
              Phone: +91 98765 43210
              <br />
              Pune, Maharashtra, India
            </Typography>
          </Grid>

          <Grid xs={12} md={3}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              About Project
            </Typography>
            <Typography sx={{ color: "#ccc", fontSize: 15, lineHeight: 1.9 }}>
              Built using React, Material UI, Bootstrap, Spring Boot, and MySQL.
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: "1px solid #333",
            mt: 4,
            pt: 3,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#aaa", fontSize: 14 }}>
            © 2026 Student Process Tracker | InfoBeans Foundation
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}