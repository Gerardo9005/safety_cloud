import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner">Cargando...</div></div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner">Cargando...</div></div>;
  }

  return isAdmin ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/nosotros" element={<div style={{padding: '2rem', textAlign: 'center'}}><h1>Nosotros</h1><p>Página en construcción</p></div>} />
            <Route path="/recursos" element={<Home />} />
            <Route path="/apoyo" element={<div style={{padding: '2rem', textAlign: 'center'}}><h1>Apoyo</h1><p>Página en construcción</p></div>} />
            <Route path="/blog" element={<div style={{padding: '2rem', textAlign: 'center'}}><h1>Blog</h1><p>Página en construcción</p></div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
