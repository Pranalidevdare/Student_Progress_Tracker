import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import "./InfoBeansChatbot.css";

const knowledgeBase = {
  about: {
    keywords: ["what is infobeans", "about infobeans", "who are infobeans", "foundation"],
    response: "InfoBeans Foundation is dedicated to empowering students with industry-ready skills in software engineering, practical project experience, and career mentorship."
  },
  programs: {
    keywords: ["program", "programs", "course", "courses", "technologies", "java", "mern", "react"],
    response: "We offer hands-on training in Java, React, Node.js, Spring Boot, Databases, Soft Skills, and Mock Interview Preparation."
  },
  aptitude: {
    keywords: ["aptitude", "exam", "test", "schedule"],
    response: "Applicants can complete their Online Aptitude Exam directly on this portal after registration to qualify for training batches."
  },
  placement: {
    keywords: ["placement", "job", "career", "interview", "hiring"],
    response: "InfoBeans Foundation provides comprehensive career assistance including technical mock interviews, resume building, and campus drives."
  }
};

const quickQuestions = [
  "What is InfoBeans Foundation?",
  "What programs are offered?",
  "How to take the Aptitude Test?",
  "Tell me about placement support"
];

const getResponse = (query) => {
  const q = query.toLowerCase();
  for (const cat of Object.values(knowledgeBase)) {
    if (cat.keywords.some(k => q.includes(k))) return cat.response;
  }
  if (q.includes("hi") || q.includes("hello")) return "Hello! How can I assist you with InfoBeans Foundation today?";
  return "I am the InfoBeans Foundation AI Assistant. Please ask about our training programs, candidate registration, online aptitude tests, or placement support!";
};

export default function InfoBeansChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Welcome to InfoBeans Foundation! 👋 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = (textToSend = input) => {
    const text = textToSend.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), sender: "user", text };
    const botMsg = { id: Date.now() + 1, sender: "bot", text: getResponse(text) };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <button className="ib-chatbot-fab" onClick={() => setOpen(!open)} title="Chat with Assistant">
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {open && (
        <Box className="ib-chatbot-window">
          <Box className="ib-chatbot-header">
            <Box className="ib-chatbot-header-left">
              <Box className="ib-chatbot-icon">
                <SmartToyIcon />
              </Box>
              <Box>
                <Typography className="ib-chatbot-title">InfoBeans Assistant</Typography>
                <Typography className="ib-chatbot-status">Online • Student Support</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className="ib-chatbot-scope">
            <Chip icon={<SmartToyIcon />} label="SPT Info & Help" size="small" className="ib-chatbot-chip" />
          </Box>

          <Box className="ib-chatbot-messages">
            {messages.map((m) => (
              <Box key={m.id} className={`ib-chat-message ${m.sender === "user" ? "ib-chat-message-user" : "ib-chat-message-bot"}`}>
                <Box className="ib-chat-avatar">
                  {m.sender === "user" ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Box>
                <Box className={`ib-chat-bubble ${m.sender === "user" ? "ib-chat-bubble-user" : "ib-chat-bubble-bot"}`}>
                  <Typography variant="body2">{m.text}</Typography>
                </Box>
              </Box>
            ))}
            <div ref={endRef} />
          </Box>

          <Box className="ib-chatbot-quick">
            <Typography className="ib-chatbot-quick-title">Quick questions:</Typography>
            <Box className="ib-chatbot-quick-list">
              {quickQuestions.map((q) => (
                <button key={q} className="ib-chatbot-quick-button" onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </Box>
          </Box>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="ib-chatbot-input-area">
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="ib-chatbot-input"
            />
            <IconButton type="submit" className="ib-chatbot-send" disabled={!input.trim()}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </>
  );
}
