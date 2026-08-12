import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

const stats = [
  {
    icon: <PeopleAltIcon sx={{ fontSize: 45, color: "#D32F2F" }} />,
    number: "500+",
    title: "Students Trained",
  },
  {
    icon: <SchoolIcon sx={{ fontSize: 45, color: "#D32F2F" }} />,
    number: "35+",
    title: "Expert Trainers",
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 45, color: "#D32F2F" }} />,
    number: "120+",
    title: "Guest Sessions",
  },
  {
    icon: <BusinessCenterIcon sx={{ fontSize: 45, color: "#D32F2F" }} />,
    number: "95%",
    title: "Placement Support",
  },
];

export default function Statistics() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        background: "#F8F9FC",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: {
              xs: "2rem",
              sm: "2.5rem",
              md: "3rem",
            },
            mb: 2,
          }}
        >
          Our Impact in Numbers
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            maxWidth: 650,
            mx: "auto",
            mb: { xs: 5, md: 7 },
            px: 2,
            lineHeight: 1.8,
          }}
        >
          Empowering students through quality training,
          mentorship and industry exposure.
        </Typography>

        <Grid container spacing={4} sx={{ justifyContent: "center" }}>
          {stats.map((item, index) => (
            <Grid
              key={index}
              xs={12}
              sm={6}
              md={3}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  maxWidth: 280,
                  minHeight: 250,
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: "20px",
                  transition: "0.3s",

                  "&:hover": {
                    transform: "translateY(-10px)",
                    borderBottom: "4px solid #D32F2F",
                    boxShadow: "0 12px 30px rgba(0,0,0,.15)",
                  },
                }}
              >
                <Box mb={2}>{item.icon}</Box>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="#D32F2F"
                >
                  {item.number}
                </Typography>

                <Typography
                  mt={1}
                  color="text.secondary"
                  fontWeight={500}
                >
                  {item.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}