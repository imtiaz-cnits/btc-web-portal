import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminLayout from './pages/AdminLayout.jsx';
import Auth from './pages/Auth.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Notices from './pages/Notices.jsx';
import { SidebarProvider } from './contexts/SidebarContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

const App = () => {
    return (
        <AuthProvider>
            <SidebarProvider>
                <Toaster richColors position="top-right" />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Dashboard Routes (Protected under /admin) */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/admin/*" element={<AdminLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="notices" element={<Notices />} />
                        </Route>
                    </Route>

                    {/* Redirect any unmatched routes to /auth */}
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </SidebarProvider>
        </AuthProvider>
    );
};

export default App;