import React from "react";
import BackButton from "./BackButton";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import LogoButton from "./LogoButton";
import '../../assets/styles/header/Header.scss'

function Header() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar style={{ background: '#fff' }} position="static" elevation={0}>
        <Toolbar>
          <BackButton />
          <LogoButton />
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;