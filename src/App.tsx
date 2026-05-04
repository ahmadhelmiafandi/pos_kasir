import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './features/auth/store';

// Layout
import Layout from './components/Layout';

// Pages
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import POSPage from './features/pos/POSPage';
import ProductsPage from './features/products/ProductsPage';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" expand={true} richColors />
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
        />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Layout>
                <DashboardPage />
              </Layout>
            ) : <Navigate to="/login" />
          } 
        />

        <Route 
          path="/pos" 
          element={
            isAuthenticated ? (
              <Layout>
                <POSPage />
              </Layout>
            ) : <Navigate to="/login" />
          } 
        />

        <Route 
          path="/products" 
          element={
            isAuthenticated ? (
              <Layout>
                <ProductsPage />
              </Layout>
            ) : <Navigate to="/login" />
          } 
        />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
