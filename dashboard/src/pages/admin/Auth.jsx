import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useDarkMode from '../../hooks/useDarkMode';
import api from '../../api/index.js';
import { AuthContext } from '../../contexts/AuthContext';
import Cookies from 'js-cookie';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateToken } = useContext(AuthContext); // Access updateToken from context
    const [showSignup, setShowSignup] = useState(false);
    const [dark, setDark] = useDarkMode();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const darkIcon = document.getElementById('theme-toggle-dark-icon');
        const lightIcon = document.getElementById('theme-toggle-light-icon');

        if (darkIcon && lightIcon) {
            if (dark) {
                lightIcon.classList.remove('hidden');
                darkIcon.classList.add('hidden');
            } else {
                lightIcon.classList.add('hidden');
                darkIcon.classList.remove('hidden');
            }
        }
    }, [dark]);

    const toggleDarkMode = () => {
        setDark(!dark);
    };

    const handleSignupClick = (e) => {
        e.preventDefault();
        setShowSignup(true);
        setError('');
        setSuccess('');
    };

    const handleSignInClick = (e) => {
        e.preventDefault();
        setShowSignup(false);
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        const key = id === 'confirm_password' ? 'confirmPassword' : id;
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            toast.error('All fields are required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            toast.error('Please enter a valid email address');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        try {
            const response = await api.post('/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            if (response.data.success) {
                const { token } = response.data;
                if (token && updateToken) {
                    updateToken(token); // Update AuthContext
                    Cookies.set('token', token, { expires: 1 }); // Set cookie manually
                }

                await api.post('/send-verification-otp', {}, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                setSuccess(response.data.message);
                toast.success('Registration successful! Please verify your email.');

                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                setShowSignup(false);
                setTimeout(() => navigate('/verify-email'), 1000); // Delay navigation
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.email || !formData.password) {
            setError('All fields are required');
            toast.error('All fields are required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            const response = await api.post('/login', {
                email: formData.email,
                password: formData.password,
            });
            if (response.data.success) {
                const { token } = response.data; // Assume token is returned
                updateToken(token); // Update context with token
                setSuccess(response.data.message);
                toast.success('Login successful!');
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                });
                navigate('/admin', { replace: true });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <div className="flex h-screen sign_in bg-[var(--bg)] dark:bg-[var(--dark-bg)]">
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 md:py-[20px] relative bg-[var(--bg)] dark:bg-[var(--dark-bg)]">
                <div className="w-full h-screen max-w-md flex flex-col items-center justify-between py-[20px]">
                    <div className="w-full h-[20px]"></div>

                    {/* Sign In Form */}
                    <form onSubmit={handleSignInSubmit} className={`w-full dark:text-[var(--text-4)] main-form ${showSignup ? 'hidden' : ''}`}>
                        <h1 className="form_title text-[30px] font-bold text-[var(--text-1)] dark:text-[var(--text-4)]">Sign In</h1>
                        <p className="text-[var(--text-3)] mb-[20px]">Enter your email and password to sign in!</p>

                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        {success && <p className="text-green-500 mb-4">{success}</p>}

                        <button className="google_btn w-full gap-2 flex items-center justify-start rounded-[12px] py-[10px] px-[20px] bg-[var(--secondary-color)] text-[var(--text-1)] transition duration-400 cursor-pointer">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_402_2989)">
                                    <path d="M19.7874 10.225C19.7874 9.56668 19.7291 8.94168 19.6291 8.33334H10.2124V12.0917H15.6041C15.3624 13.325 14.6541 14.3667 13.6041 15.075V17.575H16.8207C18.7041 15.8333 19.7874 13.2667 19.7874 10.225Z" fill="#4285F4" />
                                    <path d="M10.2126 20C12.9126 20 15.1709 19.1 16.8209 17.575L13.6043 15.075C12.7043 15.675 11.5626 16.0417 10.2126 16.0417C7.60427 16.0417 5.39593 14.2833 4.60427 11.9083H1.2876V14.4833C2.92926 17.75 6.30427 20 10.2126 20Z" fill="#34A853" />
                                    <path d="M4.60407 11.9083C4.39574 11.3083 4.2874 10.6667 4.2874 9.99999C4.2874 9.33333 4.40407 8.69166 4.60407 8.09166V5.51666H1.2874C0.604068 6.86666 0.212402 8.38333 0.212402 9.99999C0.212402 11.6167 0.604068 13.1333 1.2874 14.4833L4.60407 11.9083Z" fill="#FBBC05" />
                                    <path d="M10.2126 3.95833C11.6876 3.95833 13.0043 4.46667 14.0459 5.45834L16.8959 2.60833C15.1709 0.991667 12.9126 0 10.2126 0C6.30427 0 2.92926 2.25 1.2876 5.51667L4.60427 8.09167C5.39593 5.71667 7.60427 3.95833 10.2126 3.95833Z" fill="#EA4335" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_402_2989">
                                        <rect width="20" height="20" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="flex items-center my-[20px]">
                            <div className="flex-grow border-t border-[var(--border-color2)]"></div>
                            <span className="flex-shrink mx-4 text-[var(--accent)]">or</span>
                            <div className="flex-grow border-t border-[var(--border-color2)]"></div>
                        </div>

                        <div className="form_grp mb-4">
                            <label htmlFor="email" className="block text-[var(--text-1)] font-semibold mb-2">Email*</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="mail@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                autoComplete="off"
                                className="w-full px-4 py-3 border border-[var(--border-color2)] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent duration-300 text-black dark:text-white"
                                required
                            />
                        </div>

                        <div className="form_grp mb-4 relative">
                            <label htmlFor="password" className="block text-[var(--text-1)] font-semibold mb-2">Password*</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={handleInputChange}
                                autoComplete="off"
                                className="w-full px-4 py-3 border border-[var(--border-color2)] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent duration-300 text-black dark:text-white"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[var(--accent)]"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                style={{ paddingTop: '30px' }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 "
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    {showPassword ? (
                                        <>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.977 9.977 0 012.1-3.675m5.767-2.475A10.05 10.05 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.977 9.977 0 01-2.1 3.675" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                        </>
                                    ) : (
                                        <>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.472 1.547-1.42 2.92-2.756 4.024A9.957 9.957 0 0112 19c-4.477 0-8.268-2.943-9.542-7z" />
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center justify-between my-[20px]">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="keep-logged-in"
                                    className="h-4 w-4 text-[var(--primary-color)] border-[var(--border-color2)] rounded focus:ring-[var(--primary-color)] cursor-pointer"
                                />
                                <label htmlFor="keep-logged-in" className="ml-2 text-[var(--text-1)] cursor-pointer">Keep me logged in</label>
                            </div>
                            <Link to="/reset-password" className="text-[var(--primary-color)] dark:text-[#6D80E7] font-semibold hover:underline transition duration-400">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            className="sign_in_btn w-full bg-[var(--primary-color)] text-[var(--text-4)] py-[10px] px-4 rounded-[12px] hover:bg-[var(--text-1)] transition duration-400 mb-[20px] shadow-md cursor-pointer"
                        >
                            Sign In
                        </button>

                        <p className="text-[var(--text-3)]">
                            Not registered yet?{' '}
                            <button
                                type="button"
                                onClick={handleSignupClick}
                                className="create_account_btn text-[var(--primary-color)] dark:text-[#6D80E7] font-semibold hover:underline transition duration-400 cursor-pointer"
                            >
                                Create an Account
                            </button>
                        </p>
                    </form>

                    {/* Sign Up Form */}
                    <div id="signup_section" className={`w-full ${showSignup ? '' : 'hidden'}`}>
                        <form className="w-full" onSubmit={handleSignUpSubmit}>
                            <h1 className="form_title text-[30px] font-bold text-[var(--text-1)] dark:text-[var(--text-4)]">Create Account</h1>
                            <p className="text-[var(--text-3)] mb-[20px]">Enter your details to create an account!</p>

                            {error && <p className="text-red-500 mb-4">{error}</p>}
                            {success && <p className="text-green-500 mb-4">{success}</p>}

                            <div className="form_grp mb-4">
                                <label htmlFor="name" className="block text-[var(--text-1)] font-semibold mb-2">Full Name*</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Your full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                    className="w-full px-4 py-3 border border-[var(--border-color2)] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent duration-300 text-black dark:text-white"
                                    required
                                />
                            </div>

                            <div className="form_grp mb-4">
                                <label htmlFor="email" className="block text-[var(--text-1)] font-semibold mb-2">Email*</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="mail@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                    className="w-full px-4 py-3 border border-[var(--border-color2)] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent duration-300 text-black dark:text-white"
                                    required
                                />
                            </div>

                            <div className="form_grp mb-4 relative">
                                <label htmlFor="password" className="block text-[var(--text-1)] font-semibold mb-2">Password*</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="Min. 8 characters"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                    className="w-full px-4 py-3 border border-[var(--border-color2)] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent duration-300 text-black dark:text-white"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[var(--accent)]"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    style={{ paddingTop: '30px' }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        {showPassword ? (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.977 9.977 0 012.1-3.675m5.767-2.475A10.05 10.05 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.977 9.977 0 01-2.1 3.675" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                            </>
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.472 1.547-1.42 2.92-2.756 4.024A9.957 9.957 0 0112 19c-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>

                            <div className="form_grp mb-4 relative">
                                <label htmlFor="confirm_password" className="block text-[var(--text-1)] font-semibold mb-2">Confirm Password*</label>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirm_password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                    className="w-full px-4 py-3 border border-[var(--border-color2)] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent duration-300 text-black dark:text-white"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[var(--accent)]"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    style={{ paddingTop: '30px' }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        {showConfirmPassword ? (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.977 9.977 0 012.1-3.675m5.767-2.475A10.05 10.05 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.977 9.977 0 01-2.1 3.675" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                            </>
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.472 1.547-1.42 2.92-2.756 4.024A9.957 9.957 0 0112 19c-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="sign_up_btn w-full bg-[var(--primary-color)] text-[var(--text-4)] py-[10px] px-4 rounded-[12px] hover:bg-[var(--text-1)] transition duration-400 mb-[20px] shadow-md cursor-pointer"
                            >
                                Sign Up
                            </button>

                            <p className="text-[var(--text-3)]">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={handleSignInClick}
                                    className="sign_in_toggle text-[var(--primary-color)] dark:text-[#6D80E7] font-semibold hover:underline transition duration-400 cursor-pointer"
                                >
                                    Sign In
                                </button>
                            </p>
                        </form>
                    </div>

                    <p className="copyright w-full text-[var(--text-3)]">© 2025 Horizon. All Rights Reserved. by CodeNext IT</p>
                </div>
            </div>

            <div
                className="hidden lg:flex w-1/2 bg-[var(--primary-color)] rounded-bl-[100px] items-center justify-center flex-col p-8 relative">
                <div
                    className="w-38 h-38 bg-[var(--primary-color)] rounded-full flex items-center justify-center mb-8 shadow-lg">
                    <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M69.0231 186.199H210.362V247.65H69.0231V186.199Z" fill="white" />
                        <path d="M215.278 199.103C215.278 178.894 207.315 159.512 193.14 145.222C178.965 130.932 159.739 122.903 139.693 122.903C119.646 122.903 100.421 130.932 86.2455 145.222C72.0705 159.512 64.107 178.894 64.107 199.103H139.693V199.103H215.278Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M140 218.153C183.272 218.153 218.351 183.075 218.351 139.803C218.351 96.5306 183.272 61.4517 140 61.4517C96.7278 61.4517 61.6489 96.5306 61.6489 139.803C61.6489 183.075 96.7278 218.153 140 218.153ZM140 279.605C217.211 279.605 279.802 217.013 279.802 139.803C279.802 62.5917 217.211 0 140 0C62.789 0 0.197266 62.5917 0.197266 139.803C0.197266 217.013 62.789 279.605 140 279.605Z" fill="white" />
                    </svg>
                </div>

                <h2 className="text-[var(--text-4)] text-5xl font-bold mb-8">
                    <svg width="200" height="40" viewBox="0 0 280 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_402_3008)">
                            <path d="M255.649 13.6677V28.6195C255.649 31.6293 253.652 33.6358 250.656 33.6358C247.661 33.6358 245.664 31.6293 245.664 28.6195V13.6677H240.504V28.6195C240.504 34.0241 244.565 38.1666 250.656 38.1666C256.747 38.1666 260.808 34.0241 260.808 28.6195V13.6677H255.649ZM264.819 37.7783H269.978V13.6677H264.819V37.7783Z" fill="white" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M267.874 5.34907H242.03C237.912 5.34907 234.575 8.71798 234.575 12.8737V38.9593C234.575 43.115 237.912 46.4839 242.03 46.4839H267.874C271.992 46.4839 275.329 43.115 275.329 38.9593V12.8737C275.329 8.71798 271.992 5.34907 267.874 5.34907ZM242.03 0.834274C235.442 0.834274 230.102 6.22455 230.102 12.8737V38.9593C230.102 45.6084 235.442 50.9987 242.03 50.9987H267.874C274.462 50.9987 279.803 45.6084 279.803 38.9593V12.8737C279.803 6.22455 274.462 0.834274 267.874 0.834274H242.03Z" fill="white" />
                            <path d="M51.3862 38.006H68.4988V45.5156H51.3862V38.006Z" fill="white" />
                            <path d="M69.0941 39.5842C69.0941 37.1145 68.1299 34.746 66.4136 32.9997C64.6974 31.2533 62.3697 30.2723 59.9425 30.2723C57.5152 30.2723 55.1877 31.2533 53.4714 32.9997C51.7552 34.746 50.791 37.1145 50.791 39.5842H69.0941Z" fill="white" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M59.9798 41.9103C65.219 41.9103 69.4662 37.6235 69.4662 32.3355C69.4662 27.0475 65.219 22.7607 59.9798 22.7607C54.7407 22.7607 50.4935 27.0475 50.4935 32.3355C50.4935 37.6235 54.7407 41.9103 59.9798 41.9103ZM59.9798 49.42C69.3281 49.42 76.9064 41.771 76.9064 32.3355C76.9064 22.9 69.3281 15.2511 59.9798 15.2511C50.6315 15.2511 43.0532 22.9 43.0532 32.3355C43.0532 41.771 50.6315 49.42 59.9798 49.42ZM168.012 41.9103C173.252 41.9103 177.499 37.6235 177.499 32.3355C177.499 27.0475 173.252 22.7607 168.012 22.7607C162.773 22.7607 158.526 27.0475 158.526 32.3355C158.526 37.6235 162.773 41.9103 168.012 41.9103ZM168.012 49.42C177.36 49.42 184.939 41.771 184.939 32.3355C184.939 22.9 177.36 15.2511 168.012 15.2511C158.664 15.0874 151.086 22.9 151.086 32.3355C151.086 41.771 158.664 49.42 168 49.42Z" fill="white" />
                            <path d="M0.197266 49.4162H8.06155V30.5181H28.7832V49.4162H36.7098V2.4859H28.7832V23.5258H8.06155V2.4859H0.197266V49.4162ZM99.4251 15.0847C95.3062 15.0847 92.0607 16.4705 90.313 20.1871V15.4626H83.2604V49.4162H90.7498V30.2032C90.7498 24.9117 93.8702 21.888 98.4891 21.888H102.546V15.0847H99.4251ZM106.964 10.9901H114.454V2.4859H106.964V10.9901ZM106.964 49.4162H114.454V15.4626H106.964V49.4162ZM118.794 49.4162H146.382V42.6129H128.906L146.32 21.636V15.4626H119.606V22.2659H136.458L118.794 43.2429V49.4162ZM206.345 14.7067C202.163 14.7067 198.669 16.4075 196.796 19.5572V15.4626H189.743V49.4162H197.233V29.2582C197.233 24.6597 200.104 21.699 204.41 21.699C208.655 21.699 211.525 24.6597 211.525 29.2582V49.4162H219.015V27.3684C219.015 19.9352 213.835 14.7067 206.345 14.7067Z" fill="white" />
                        </g>
                        <defs>
                            <clipPath id="clip0_402_3008">
                                <rect width="279.605" height="50.1644" fill="white" transform="translate(0.197266 0.835083)" />
                            </clipPath>
                        </defs>
                    </svg>
                </h2>

                <a
                    href="https://horizon-ui.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-4)] text-center border border-[#abe1fa86] py-[20px] px-[60px] rounded-[16px] hover:bg-[var(--bg)] hover:text-[var(--primary-color)] transition duration-400"
                >
                    <h5>Learn more about Horizon UI on</h5>
                    <span className="font-semibold text-[28px]">horizon-ui.com</span>
                </a>

                <div className="absolute bottom-8 w-full flex justify-center text-[var(--text-4)]">
                    <ul className="flex space-x-6">
                        <li><a href="#" className="hover:underline transition duration-400"><p>Marketplace</p></a></li>
                        <li><a href="#" className="hover:underline transition duration-400"><p>License</p></a></li>
                        <li><a href="#" className="hover:underline transition duration-400"><p>Terms of Use</p></a></li>
                        <li><a href="#" className="hover:underline transition duration-400"><p>Blog</p></a></li>
                    </ul>

                    <div className="dark_button_box flex justify-end p-4 absolute right-8 bottom-[-20px]">
                        <button
                            id="theme-toggle"
                            type="button"
                            className="bg-[#6A53FF] rounded-full text-sm p-2.5 cursor-pointer"
                            onClick={toggleDarkMode}
                        >
                            <svg id="theme-toggle-dark-icon" className="hidden w-5 h-5" fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                            </svg>
                            <svg id="theme-toggle-light-icon" className="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;