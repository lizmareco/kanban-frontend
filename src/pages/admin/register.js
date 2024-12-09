// src/pages/admin/register.js

import React from 'react';
import CustomRegisterForm from '../../components/Auth/CustomRegisterForm';
//import Navbar from '../../components/Layout/Navbar';
import { Container, Box, Typography } from '@mui/material';

const AdminRegisterPage = () => {
  return (
    <>
      
      <Container>
        <Box mt={5}>
          <Typography variant="h4" align="center" gutterBottom>
            Registrar Nuevo Usuario
          </Typography>
          <CustomRegisterForm />
        </Box>
      </Container>
    </>
  );
};

export default AdminRegisterPage;
