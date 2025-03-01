// src/pages/_app.js
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
    <Layout>
      <Component {...pageProps} />
    </Layout> 
    </AuthProvider>
  );
}

export default MyApp;




