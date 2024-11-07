// src/components/Layout/Layout.js

import Navbar from './Navbar';
import Footer from './Footer';
import { Container } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <Container component="main" sx={{ minHeight: '80vh', marginTop: '2rem' }}>
        {children}
      </Container>
      <Footer />
    </div>
  );
};

export default Layout;
