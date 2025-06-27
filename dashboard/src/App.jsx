import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminLayout from './pages/AdminLayout.jsx';
import Auth from './pages/Auth.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EgpNotices from './pages/EgpNotices.jsx';
import { SidebarProvider } from './contexts/SidebarContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import WinnerList from "./pages/WinnerList.jsx";

const App = () => {
    return (
        <AuthProvider>
            <SidebarProvider>
                <Toaster richColors position="top-right" />
                <Routes>
                    {/* Public Routes under /admin */}
                    <Route path="/admin/auth" element={<Auth />} />
                    <Route path="/admin/verify-email" element={<VerifyEmail />} />
                    <Route path="/admin/reset-password" element={<ResetPassword />} />

                    {/* Dashboard Routes (Protected under /admin) */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/admin/*" element={<AdminLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="egp-notices" element={<EgpNotices />} />
                            <Route path="winner-list" element={<WinnerList />} />
                        </Route>
                    </Route>

                    {/* Redirect any unmatched routes to /admin/auth */}
                    <Route path="*" element={<Navigate to="/admin/auth" replace />} />
                </Routes>
            </SidebarProvider>
        </AuthProvider>
    );
};

export default App;