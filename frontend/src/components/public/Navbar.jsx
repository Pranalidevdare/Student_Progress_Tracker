import logo from "../../assets/infobeans-logo.png";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";

const menuItems = [
  "Home",
  "About",
  "Programs",
  "Selection Process",
  "Guest Sessions",
  "Contact",
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "#373742",
        
         
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ height: 74 }}>

            

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: { xs: 1, md: 0 },
              }}
            >
  
            <Box
  component="img"
  src={logo}
  alt="InfoBeans Logo"
  sx={{
    width: 170,
    height: 150,
    objectFit: "contain",
    mr: 4,
  }}
/>
</Box>

            <Box
              sx={{
                flexGrow: 1,
                display: {
                  xs: "none",
                  md: "flex",
                },
                justifyContent: "center",
                gap: 2,
              }}
            >
              <button
              style={{
                border:'none',
                backgroundColor: '#373742',
                 color:'#ffffff'
              }}
              >Home</button>
             <button
              style={{
                border:'none',
                backgroundColor: '#373742',
                color:'#ffffff'
              }}
              onClick={() => window.location.href = './pages/Registration.jsx'}
             >Course Registration</button>
             <button
              style={{
                border:'none',
                backgroundColor: '#373742',
                 color:'#ffffff'
              }}
             >Illumin</button>
             <button
              style={{
                border:'none',
                backgroundColor: '#373742',
                 color:'#ffffff'
              }}
             >About infobeans</button>

            </Box>

            {/* Desktop Buttons */}

            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },
                gap: 2,
              }}
            >
           

              <Button
                variant="contained"
                sx={{
                  background: "#d80202",
                  px: 3,
                  textTransform: "none"
                }}
              >
                Contact Now
              </Button>
            </Box>

            {/* Mobile Menu */}

            <IconButton
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
              }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon sx={{ color: "#0056A6" }} />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer */}

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box sx={{ width: 280 }}>

          <List>

            {menuItems.map((item) => (
              <ListItem key={item} disablePadding>

                <ListItemButton>

                  <ListItemText primary={item} />

                </ListItemButton>

              </ListItem>
            ))}

            <Box p={2}>

              <Button
                fullWidth
                variant="outlined"
                sx={{
                  mb: 2,
                  color: "#0056A6",
                  borderColor: "#0056A6",
                  textTransform: "none",
                }}
              >
                Login
              </Button>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  background: "#0056A6",
                  textTransform: "none",
                }}
              >
                Apply Now
              </Button>

            </Box>

          </List>

        </Box>
      </Drawer>
    </>
  );
}