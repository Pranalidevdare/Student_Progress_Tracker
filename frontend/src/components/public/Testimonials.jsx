import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";

import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const testimonials = [
  {
    name: "Aarav Patil",
    role: "Java Full Stack Student",
    feedback:
      "The training process was very well structured. The aptitude test, technical rounds, and guest sessions helped me build confidence and improve my skills.",
  },
  {
    name: "Sneha Kulkarni",
    role: "Aptitude Batch Student",
    feedback:
      "The Student Process Tracker made it easy to follow the complete journey. I liked the dashboard, study materials, and performance tracking feature.",
  },
  {
    name: "Rohit Sharma",
    role: "Selected Candidate",
    feedback:
      "The registration and selection process were smooth. The HR interview preparation and technical assessments were very useful for placement readiness.",
  },
  {
    name: "Priya Shah",
    role: "MERN Stack Student",
    feedback:
      "Excellent mentors and practical sessions. Every topic was explained with real-world examples.",
  },
  {
    name: "Rahul Jadhav",
    role: "Python Student",
    feedback:
      "Weekly assessments helped me improve consistently. Highly recommended training.",
  },
  {
    name: "Neha Verma",
    role: "Aptitude Student",
    feedback:
      "The weekly tests and detailed performance reports motivated me to improve every week.",
  },
];

export default function Testimonials() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        background: "#fff",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          align="center"
          sx={{
            fontWeight: 800,
            fontSize: {
              xs: "2rem",
              sm: "2.5rem",
              md: "3rem",
            },
            mb: 2,
          }}
        >
          Testimonials
        </Typography>

        <Typography
          align="center"
          sx={{
            color: "#666",
            maxWidth: 700,
            mx: "auto",
            mb: 7,
            px: 2,
            fontSize: {
              xs: 15,
              md: 17,
            },
            lineHeight: 1.8,
          }}
        >
          Hear what our students say about their journey with the Student
          Process Tracker and InfoBeans Foundation.
        </Typography>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={25}
          loop={true}
          speed={5000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1200: {
              slidesPerView: 3,
            },
          }}
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={index}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 5,
                  border: "1px solid #ECECEC",
                  p: 3,
                  height: 320,
                  transition: ".3s",
                  background: "#fff",

                  "&:hover": {
                    transform: "translateY(-8px)",
                    borderColor: "#D32F2F",
                    boxShadow: "0 20px 40px rgba(0,0,0,.10)",
                  },
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <FormatQuoteIcon
                    sx={{
                      color: "#D32F2F",
                      fontSize: 45,
                      mb: 2,
                    }}
                  />

                  <Typography
                    sx={{
                      color: "#666",
                      lineHeight: 1.9,
                      mb: 4,
                      minHeight: 130,
                    }}
                  >
                    {item.feedback}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#FFF1F1",
                        color: "#D32F2F",
                        fontWeight: 700,
                        mr: 2,
                        width: 55,
                        height: 55,
                      }}
                    >
                      {item.name.charAt(0)}
                    </Avatar>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {item.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#777",
                          fontSize: 14,
                        }}
                      >
                        {item.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </Box>
  );
}