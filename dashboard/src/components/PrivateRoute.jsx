import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../api/index.js';
import useDarkMode from '../../src/hooks/useDarkMode.jsx';
import { HashLoader } from 'react-spinners';

const PrivateRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true = authenticated, false = unauthenticated
    const location = useLocation();
    const [dark] = useDarkMode(); // Destructure dark mode value from useDarkMode hook

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.post('/is-auth');
                setIsAuthenticated(response.data.success);
            } catch (error) {
                console.error('Authentication check failed:', error);
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        // Display a loading state while checking authentication
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--bg)] dark:bg-[var(--dark-bg)]">
                <HashLoader
                    color={dark ? '#ffffff' : '#4318ff'} // Dynamic color based on dark mode
                    size={50} // Size of the loader in pixels
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
        );
    }

    return isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to="/auth" state={{ from: location }} replace />
    );
};

export default PrivateRoute;