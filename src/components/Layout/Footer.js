// src/components/Layout/Footer.js
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', textAlign: 'center' }}>
      <Typography variant="body1">&copy; {new Date().getFullYear()} KanbanApp. Todos los derechos reservados.</Typography>
    </Box>
  );
};

export default Footer;
