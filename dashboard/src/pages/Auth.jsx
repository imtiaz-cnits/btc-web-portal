import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode.jsx';
import api from '../api/index.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
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

                    <p className="copyright w-full text-[var(--text-3)]">© 2025 BTC. All Rights Reserved. by CodeNext IT</p>
                </div>
            </div>

            <div
                className="hidden lg:flex w-1/2 bg-[var(--primary-color)] rounded-bl-[100px] items-center justify-center flex-col p-8 relative">
                <div
                    className="w-38 h-38 bg-[var(--primary-color)] rounded-full flex items-center justify-center mb-8">
                    <svg width="340" height="340" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_1191_3488)">
                            <path
                                d="M111.107 95.04V233.068L141.461 204.943V119.271L187.424 162.972V212.731L213.874 238.693V155.616L158.372 104.992V54.3672L111.107 95.04Z"
                                fill="#5AA469"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M72.1583 90.6306C66.2071 96.0752 54.0305 107.209 52.9333 108.187L54.4922 119.109L76.4201 138.541L97.2799 122.809L93.3172 108.285L73.9742 120.202L183.552 24.866L181.973 53.0189L175.912 52.6789L178.891 61.5134L183.653 61.7805L183.314 67.8287C200.101 70.5037 181.815 86.813 180.017 72.4109C177.011 76.6972 180.782 81.988 185.978 82.2794C191.841 82.6082 199.62 71.3434 188.678 65.096L188.848 62.0719L193.61 62.339L198.424 53.9415L191.93 53.5773L194.053 15.7297L205.467 5.79886L203.881 3.10966L191.613 5.02189L87.5016 95.8249L72.1583 90.6306ZM184.57 53.1645L186.291 22.4826L190.493 18.8269L188.555 53.388L184.57 53.1645Z"
                                  fill="#5AA469"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M107.205 123.165L105.471 124.918V237.827L107.205 236.096V123.165Z" fill="#5AA469"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M103.737 125.761L102.003 127.55V241.721L103.737 239.991V125.761Z" fill="#5AA469"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M100.267 128.357L98.5322 130.194V245.183L100.267 243.452V128.357Z" fill="#5AA469"/>
                            <path d="M201.733 84.2227L221.68 102.396V149.991L201.733 132.684V84.2227Z" fill="white"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M185.257 99.2351L201.734 84.2227V92.8764L185.257 107.174V99.2351Z" fill="white"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M201.734 97.2031L185.257 112.216V117.972L186.464 119.107L201.734 105.857V97.2031Z"
                                  fill="white"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M201.734 110.184L189.159 121.641L193.831 125.695L201.734 118.838V110.184Z"
                                  fill="white"/>
                            <path
                                d="M158.808 209.703L77.7197 263.356H96.6979V258.164L158.808 226.145L220.919 258.164V263.356H240.759L158.808 209.703Z"
                                fill="white"/>
                            <path d="M148.832 234.799L157.504 233.068V241.722H148.832V234.799Z" fill="white"/>
                            <path d="M159.239 233.068L167.912 234.799V241.722H159.239V233.068Z" fill="white"/>
                            <rect x="148.832" y="243.452" width="8.67232" height="8.65378" fill="white"/>
                            <rect x="159.239" y="243.452" width="8.67232" height="8.65378" fill="white"/>
                            <path
                                d="M255.725 279.795C255.725 281.739 211.613 269.23 157.199 269.23C102.785 269.23 58.6738 281.739 58.6738 279.795C58.6738 277.85 102.785 262.188 157.199 262.188C211.613 262.188 255.725 277.85 255.725 279.795Z"
                                fill="white"/>
                            <path
                                d="M99.0285 18.75C124.624 5.26825 153.743 0.17198 182.274 4.05195L175.754 9.79612C150.381 7.45203 130.828 12.4888 108.115 24.4522C81.2163 38.6205 60.9202 61.6326 49.0785 89.5895C37.2367 117.546 35.4448 148.729 44.0064 177.853C52.568 206.977 64.0186 232.253 89.1184 249.396L88.8219 249.828L83.5371 253.373C58.1955 235.425 39.6282 209.467 30.8682 179.668C21.887 149.116 23.7668 116.406 36.1888 87.0792C48.6108 57.7524 70.8112 33.6126 99.0285 18.75Z"
                                fill="white"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_1191_3488">
                                <rect width="280" height="280" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
                </div>

                <h2 className="text-[var(--text-4)] text-5xl font-bold mb-8">
                    <svg width="262" height="105" viewBox="0 0 272 115" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5.80445 86.6454V87.6626L11.6566 87.6478C11.9317 87.6478 12.1332 87.5839 12.2609 87.4562C12.3887 87.3186 12.4526 87.0385 12.4526 86.616C12.4526 86.2818 12.4231 86.0411 12.3641 85.8937C12.3052 85.7364 12.2216 85.6382 12.1135 85.5988C12.0054 85.5595 11.8482 85.5399 11.6418 85.5399H3.63754V83.5793H12.541C13.1208 83.5793 13.6073 83.7268 14.0004 84.0216C14.4033 84.3164 14.6047 84.8176 14.6047 85.5251V87.5152C14.6047 87.8198 14.5458 88.0557 14.4279 88.2227C15.0371 88.4979 15.3418 88.9598 15.3418 89.6084V92.2175C15.3123 93.3378 14.6637 93.8979 13.396 93.8979H3.63754V86.6454H5.80445ZM12.3936 91.9374C12.6786 91.9374 12.885 91.8686 13.0127 91.731C13.1405 91.5935 13.2044 91.2986 13.2044 90.8466C13.2044 90.3749 13.1356 90.0555 12.998 89.8884C12.8702 89.7115 12.6639 89.6231 12.3789 89.6231H5.80445V91.9374H12.3936ZM25.4911 86.5275V91.4362C25.4813 91.8981 25.3683 92.3158 25.1521 92.6892C24.9359 93.0626 24.646 93.3575 24.2823 93.5737C23.9187 93.7898 23.506 93.8979 23.0441 93.8979H18.6661C18.2042 93.8979 17.7915 93.7898 17.4278 93.5737C17.0642 93.3575 16.7743 93.0626 16.5581 92.6892C16.3419 92.3158 16.2289 91.8981 16.2191 91.4362V86.5275H18.3713V90.7876C18.3713 91.1218 18.4302 91.3969 18.5482 91.6131C18.6759 91.8293 18.9118 91.9374 19.2557 91.9374H22.4545C22.7984 91.9374 23.0294 91.8293 23.1473 91.6131C23.2751 91.3969 23.3389 91.1218 23.3389 90.7876V86.5275H25.4911ZM28.5344 85.6431H26.3822V83.5793H28.5344V85.6431ZM26.3822 93.8979V86.5275H28.5344V93.8979H26.3822ZM29.4197 93.8979V82.8423H31.5718V93.8979H29.4197ZM41.7291 82.8423V90.9498H39.5769V88.5028H35.4347C35.1104 88.5028 34.8893 88.6158 34.7714 88.8418C34.6535 89.058 34.5994 89.3578 34.6092 89.741V90.7876C34.6092 91.1218 34.6682 91.3969 34.7861 91.6131C34.9139 91.8293 35.1497 91.9374 35.4937 91.9374H41.7291V93.8979H34.9041C34.4422 93.8979 34.0294 93.7898 33.6658 93.5737C33.3022 93.3575 33.0123 93.0626 32.7961 92.6892C32.5799 92.3158 32.4669 91.8981 32.4571 91.4362V88.6207C32.4669 88.208 32.5848 87.8444 32.8109 87.5299C33.0467 87.2056 33.3415 86.9599 33.6953 86.7929C34.0589 86.6258 34.4274 86.5423 34.8009 86.5423H39.5769V82.8423H41.7291ZM44.7724 85.6431H42.6202V83.5793H44.7724V85.6431ZM42.6202 93.8979V86.5275H44.7724V93.8979H42.6202ZM45.6576 93.8979V86.5275H47.8098V93.8979H45.6576ZM52.7775 89.6378C52.7775 89.2939 52.7136 89.0187 52.5858 88.8124C52.4679 88.5962 52.237 88.4881 51.893 88.4881H48.7974V86.5275H52.4827C52.9445 86.5275 53.3573 86.6356 53.7209 86.8518C54.0845 87.068 54.3744 87.3628 54.5906 87.7363C54.8068 88.1097 54.9198 88.5274 54.9296 88.9892V93.8979H52.7775V89.6378ZM65.0928 86.5275V94.3844C65.0928 94.8463 64.9847 95.2639 64.7685 95.6374C64.5621 96.0108 64.2722 96.3056 63.8988 96.5218C63.5253 96.738 63.1077 96.8461 62.6458 96.8461H58.8574V94.8856H62.0562C62.4001 94.8856 62.6311 94.7775 62.749 94.5613C62.8767 94.3549 62.9406 94.0798 62.9406 93.7358V88.4881H58.7984C58.2284 88.4881 57.9533 88.8517 57.9729 89.5789V90.7876C57.9729 91.1218 58.0319 91.3969 58.1498 91.6131C58.2776 91.8293 58.5134 91.9374 58.8574 91.9374H61.953V93.8979H58.2678C57.8059 93.8979 57.3931 93.7898 57.0295 93.5737C56.6659 93.3575 56.376 93.0626 56.1598 92.6892C55.9436 92.3158 55.8306 91.8981 55.8208 91.4362V88.606C55.8306 88.1932 55.9485 87.8296 56.1746 87.5152C56.4104 87.1909 56.7052 86.9452 57.059 86.7781C57.4226 86.611 57.7911 86.5275 58.1646 86.5275H65.0928ZM68.935 83.5793H80.6245V85.7463H68.935V83.5793ZM73.711 86.8518H75.8632V93.8979H73.711V86.8518ZM83.0152 89.6526L86.9068 89.004C86.9068 88.8467 86.838 88.7239 86.7005 88.6355C86.5629 88.547 86.386 88.5028 86.1698 88.5028H82.8531C82.5288 88.5028 82.3077 88.6158 82.1898 88.8418C82.0718 89.058 82.0178 89.3578 82.0276 89.741V90.7876C82.0276 91.1218 82.0866 91.3969 82.2045 91.6131C82.3322 91.8293 82.5681 91.9374 82.9121 91.9374H88.0714V93.8979H82.3224C81.8605 93.8979 81.4478 93.7898 81.0842 93.5737C80.7206 93.3575 80.4307 93.0626 80.2145 92.6892C79.9983 92.3158 79.8853 91.8981 79.8754 91.4362V88.6207C79.8853 88.208 80.0032 87.8444 80.2292 87.5299C80.4651 87.2056 80.7599 86.9599 81.1137 86.7929C81.4773 86.6258 81.8458 86.5423 82.2192 86.5423H86.8036C87.1771 86.5423 87.5407 86.6258 87.8945 86.7929C88.2581 86.9599 88.5529 87.2056 88.7789 87.5299C89.0148 87.8444 89.1376 88.208 89.1474 88.6207L89.1622 89.0187C89.1622 89.9425 88.7347 90.4584 87.8797 90.5665L83.0152 91.3036V89.6526ZM93.0162 88.5028C92.6919 88.5028 92.4708 88.6158 92.3529 88.8418C92.235 89.058 92.1809 89.3578 92.1907 89.741V90.7876C92.1907 91.1218 92.2497 91.3969 92.3676 91.6131C92.4954 91.8293 92.7312 91.9374 93.0752 91.9374H96.274C96.6179 91.9374 96.8489 91.8293 96.9668 91.6131C97.0945 91.3969 97.1584 91.1218 97.1584 90.7876H99.3106V91.4362C99.3008 91.8981 99.1877 92.3158 98.9715 92.6892C98.7553 93.0626 98.4654 93.3575 98.1018 93.5737C97.7382 93.7898 97.3255 93.8979 96.8636 93.8979H92.4856C92.0237 93.8979 91.6109 93.7898 91.2473 93.5737C90.8837 93.3575 90.5938 93.0626 90.3776 92.6892C90.1614 92.3158 90.0484 91.8981 90.0386 91.4362V88.6207C90.0484 88.208 90.1663 87.8444 90.3924 87.5299C90.6282 87.2056 90.923 86.9599 91.2768 86.7929C91.6404 86.6258 92.0089 86.5423 92.3824 86.5423H96.9668C97.3402 86.5423 97.7038 86.6258 98.0576 86.7929C98.4212 86.9599 98.716 87.2056 98.9421 87.5299C99.1779 87.8444 99.3008 88.208 99.3106 88.6207V89.5199H97.1584C97.1388 89.1956 97.0651 88.945 96.9373 88.7681C96.8194 88.5912 96.6179 88.5028 96.3329 88.5028H93.0162ZM100.202 93.8979V82.8423H102.354V93.8979H100.202ZM107.322 89.6378C107.322 89.2939 107.258 89.0187 107.13 88.8124C107.012 88.5962 106.781 88.4881 106.437 88.4881H103.342V86.5275H107.027C107.489 86.5275 107.901 86.6356 108.265 86.8518C108.629 87.068 108.918 87.3628 109.135 87.7363C109.351 88.1097 109.464 88.5274 109.474 88.9892V93.8979H107.322V89.6378ZM110.365 93.8979V86.5275H112.517V93.8979H110.365ZM117.485 89.6378C117.485 89.2939 117.421 89.0187 117.293 88.8124C117.175 88.5962 116.944 88.4881 116.6 88.4881H113.505V86.5275H117.19C117.652 86.5275 118.064 86.6356 118.428 86.8518C118.792 87.068 119.082 87.3628 119.298 87.7363C119.514 88.1097 119.627 88.5274 119.637 88.9892V93.8979H117.485V89.6378ZM127.456 86.5423C127.83 86.5423 128.193 86.6258 128.547 86.7929C128.911 86.9599 129.205 87.2056 129.431 87.5299C129.667 87.8444 129.79 88.208 129.8 88.6207V91.4362C129.79 91.8981 129.677 92.3158 129.461 92.6892C129.245 93.0626 128.955 93.3575 128.591 93.5737C128.228 93.7898 127.815 93.8979 127.353 93.8979H122.975C122.513 93.8979 122.1 93.7898 121.737 93.5737C121.373 93.3575 121.083 93.0626 120.867 92.6892C120.651 92.3158 120.538 91.8981 120.528 91.4362V89.4904H122.68V89.741V90.7876C122.68 91.1218 122.739 91.3969 122.857 91.6131C122.985 91.8293 123.221 91.9374 123.565 91.9374H126.763C127.107 91.9374 127.338 91.8293 127.456 91.6131C127.584 91.3969 127.648 91.1218 127.648 90.7876V89.741C127.658 89.3578 127.604 89.058 127.486 88.8418C127.368 88.6158 127.147 88.5028 126.822 88.5028H120.528C120.557 88.1097 120.69 87.7658 120.926 87.4709C121.162 87.1663 121.457 86.9353 121.81 86.7781C122.164 86.6209 122.518 86.5423 122.872 86.5423H127.456ZM130.691 93.8979V82.8423H132.843V93.8979H130.691ZM140.657 86.5423C141.03 86.5423 141.394 86.6258 141.748 86.7929C142.111 86.9599 142.406 87.2056 142.632 87.5299C142.868 87.8444 142.991 88.208 143.001 88.6207V91.4362C142.991 91.8981 142.878 92.3158 142.661 92.6892C142.445 93.0626 142.155 93.3575 141.792 93.5737C141.428 93.7898 141.015 93.8979 140.554 93.8979H136.176C135.714 93.8979 135.301 93.7898 134.937 93.5737C134.574 93.3575 134.284 93.0626 134.068 92.6892C133.851 92.3158 133.738 91.8981 133.729 91.4362V89.4904H135.881V89.741V90.7876C135.881 91.1218 135.94 91.3969 136.058 91.6131C136.185 91.8293 136.421 91.9374 136.765 91.9374H139.964C140.308 91.9374 140.539 91.8293 140.657 91.6131C140.784 91.3969 140.848 91.1218 140.848 90.7876V89.741C140.858 89.3578 140.804 89.058 140.686 88.8418C140.568 88.6158 140.347 88.5028 140.023 88.5028H133.729C133.758 88.1097 133.891 87.7658 134.127 87.4709C134.362 87.1663 134.657 86.9353 135.011 86.7781C135.365 86.6209 135.719 86.5423 136.072 86.5423H140.657ZM153.164 86.5275V94.3844C153.164 94.8463 153.056 95.2639 152.839 95.6374C152.633 96.0108 152.343 96.3056 151.97 96.5218C151.596 96.738 151.179 96.8461 150.717 96.8461H146.928V94.8856H150.127C150.471 94.8856 150.702 94.7775 150.82 94.5613C150.948 94.3549 151.012 94.0798 151.012 93.7358V88.4881H146.869C146.299 88.4881 146.024 88.8517 146.044 89.5789V90.7876C146.044 91.1218 146.103 91.3969 146.221 91.6131C146.348 91.8293 146.584 91.9374 146.928 91.9374H150.024V93.8979H146.339C145.877 93.8979 145.464 93.7898 145.1 93.5737C144.737 93.3575 144.447 93.0626 144.231 92.6892C144.015 92.3158 143.902 91.8981 143.892 91.4362V88.606C143.902 88.1932 144.019 87.8296 144.245 87.5152C144.481 87.1909 144.776 86.9452 145.13 86.7781C145.494 86.611 145.862 86.5275 146.235 86.5275H153.164ZM161.042 86.5275H163.327L157.313 96.8461H155.028L157.548 92.527L154.055 86.5275H156.399L158.713 90.5076L161.042 86.5275ZM177.149 89.5494H176.603V89.6673V91.4362C176.603 91.8981 176.495 92.3158 176.279 92.6892C176.072 93.0626 175.783 93.3575 175.409 93.5737C175.036 93.7898 174.618 93.8979 174.156 93.8979H169.616C169.154 93.8979 168.736 93.7898 168.363 93.5737C167.99 93.3575 167.695 93.0626 167.479 92.6892C167.272 92.3158 167.169 91.8981 167.169 91.4362V89.6673C167.169 89.2644 167.277 88.9106 167.493 88.606C167.719 88.2915 168.009 88.0458 168.363 87.8689C168.147 87.5741 168.039 87.2449 168.039 86.8813V86.0411C168.039 85.5792 168.142 85.1615 168.348 84.7881C168.564 84.4147 168.859 84.1198 169.233 83.9036C169.606 83.6874 170.024 83.5793 170.486 83.5793H172.933V83.2698H174.893V85.9526H172.933V85.5399H170.884C170.589 85.5399 170.397 85.6185 170.309 85.7757C170.23 85.9231 170.191 86.1393 170.191 86.4243C170.191 86.7585 170.206 87.0041 170.235 87.1614C170.265 87.3088 170.338 87.4169 170.456 87.4857C170.574 87.5545 170.761 87.5889 171.016 87.5889H171.355V89.5494H170.147C169.832 89.5494 169.616 89.6575 169.498 89.8737C169.38 90.0899 169.321 90.3945 169.321 90.7876C169.321 91.1218 169.38 91.3969 169.498 91.6131C169.626 91.8293 169.862 91.9374 170.206 91.9374H173.567C173.91 91.9374 174.141 91.8293 174.259 91.6131C174.387 91.3969 174.451 91.1218 174.451 90.7876C174.451 90.3945 174.392 90.0899 174.274 89.8737C174.156 89.6575 173.94 89.5494 173.626 89.5494H172.815V87.5889H177.149V89.5494ZM183.332 93.8979C182.959 93.8979 182.595 93.8144 182.242 93.6474C181.888 93.4803 181.593 93.2395 181.357 92.9251C181.121 92.6008 180.998 92.2322 180.989 91.8195V90.7729V85.6578C180.998 85.2451 181.121 84.8815 181.357 84.567C181.593 84.2427 181.888 83.997 182.242 83.8299C182.595 83.6629 182.959 83.5793 183.332 83.5793H190.614C191.184 83.5793 191.671 83.7268 192.074 84.0216C192.477 84.3164 192.678 84.8176 192.678 85.5251V87.1319H190.614V86.4243C190.605 86.1492 190.57 85.9526 190.511 85.8347C190.452 85.7069 190.374 85.6283 190.275 85.5988C190.187 85.5595 190.044 85.5399 189.848 85.5399H183.834C183.617 85.5595 183.455 85.6234 183.347 85.7315C183.239 85.8396 183.175 86.046 183.155 86.3506C183.155 88.3456 183.151 89.8442 183.141 90.8466C183.141 91.2986 183.205 91.5935 183.332 91.731C183.46 91.8686 183.662 91.9374 183.937 91.9374H189.848C190.044 91.9374 190.187 91.9227 190.275 91.8932C190.374 91.8539 190.452 91.7753 190.511 91.6573C190.57 91.5296 190.605 91.3281 190.614 91.053V90.1538H192.678V91.9522C192.678 92.6597 192.477 93.1609 192.074 93.4557C191.671 93.7505 191.184 93.8979 190.614 93.8979H183.332ZM200.484 86.5423C200.857 86.5423 201.221 86.6258 201.575 86.7929C201.938 86.9599 202.233 87.2056 202.459 87.5299C202.695 87.8444 202.818 88.208 202.828 88.6207V91.4362C202.818 91.8981 202.705 92.3158 202.489 92.6892C202.272 93.0626 201.983 93.3575 201.619 93.5737C201.255 93.7898 200.843 93.8979 200.381 93.8979H196.003C195.541 93.8979 195.128 93.7898 194.764 93.5737C194.401 93.3575 194.111 93.0626 193.895 92.6892C193.679 92.3158 193.566 91.8981 193.556 91.4362V89.4904H195.708V89.741V90.7876C195.708 91.1218 195.767 91.3969 195.885 91.6131C196.013 91.8293 196.248 91.9374 196.592 91.9374H199.791C200.135 91.9374 200.366 91.8293 200.484 91.6131C200.612 91.3969 200.676 91.1218 200.676 90.7876V89.741C200.685 89.3578 200.631 89.058 200.513 88.8418C200.395 88.6158 200.174 88.5028 199.85 88.5028H193.556C193.585 88.1097 193.718 87.7658 193.954 87.4709C194.19 87.1663 194.484 86.9353 194.838 86.7781C195.192 86.6209 195.546 86.5423 195.9 86.5423H200.484ZM203.719 93.8979V86.5275H205.871V93.8979H203.719ZM210.839 89.6378C210.839 89.2939 210.775 89.0187 210.647 88.8124C210.529 88.5962 210.298 88.4881 209.954 88.4881H206.859V86.5275H210.544C211.006 86.5275 211.418 86.6356 211.782 86.8518C212.146 87.068 212.436 87.3628 212.652 87.7363C212.868 88.1097 212.981 88.5274 212.991 88.9892V93.8979H210.839V89.6378ZM220.678 89.3135C221.208 89.3135 221.66 89.4216 222.034 89.6378C222.417 89.854 222.702 90.139 222.889 90.4928C223.085 90.8466 223.183 91.22 223.183 91.6131C223.183 92.0062 223.09 92.3796 222.903 92.7334C222.717 93.0774 222.437 93.3575 222.063 93.5737C221.69 93.7898 221.238 93.8979 220.707 93.8979H213.911V91.9374H220.117C220.393 91.9374 220.604 91.8981 220.751 91.8195C220.899 91.731 220.972 91.6279 220.972 91.5099C220.972 91.392 220.894 91.2888 220.736 91.2004C220.579 91.1119 220.363 91.0677 220.088 91.0677H216.358C215.828 91.0677 215.376 90.9596 215.002 90.7434C214.629 90.5272 214.349 90.2471 214.162 89.9032C213.975 89.5592 213.882 89.1907 213.882 88.7976C213.882 88.4045 213.975 88.0311 214.162 87.6773C214.359 87.3235 214.644 87.0385 215.017 86.8223C215.4 86.6061 215.857 86.498 216.388 86.498H222.638V88.4586H216.978C216.702 88.4586 216.486 88.5028 216.329 88.5912C216.172 88.6797 216.093 88.7829 216.093 88.9008C216.093 89.0089 216.167 89.1072 216.314 89.1956C216.462 89.2742 216.673 89.3135 216.948 89.3135H220.678ZM233.346 86.5275V91.4362C233.336 91.8981 233.223 92.3158 233.007 92.6892C232.791 93.0626 232.501 93.3575 232.137 93.5737C231.774 93.7898 231.361 93.8979 230.899 93.8979H226.521C226.059 93.8979 225.646 93.7898 225.283 93.5737C224.919 93.3575 224.629 93.0626 224.413 92.6892C224.197 92.3158 224.084 91.8981 224.074 91.4362V86.5275H226.226V90.7876C226.226 91.1218 226.285 91.3969 226.403 91.6131C226.531 91.8293 226.767 91.9374 227.111 91.9374H230.309C230.653 91.9374 230.884 91.8293 231.002 91.6131C231.13 91.3969 231.194 91.1218 231.194 90.7876V86.5275H233.346ZM234.237 93.8979V82.8423H236.389V93.8979H234.237ZM240.812 91.9374V93.8979H239.721C239.26 93.8979 238.842 93.7898 238.468 93.5737C238.095 93.3575 237.8 93.0626 237.584 92.6892C237.378 92.3158 237.274 91.8981 237.274 91.4362V82.8423H239.427V85.7315H240.444V87.8837H239.427V90.7876C239.427 91.1218 239.486 91.3969 239.603 91.6131C239.731 91.8293 239.967 91.9374 240.311 91.9374H240.812ZM250.966 86.5275V93.8979H248.814V88.4881H244.671C244.102 88.4881 243.826 88.8517 243.846 89.5789V90.7876C243.846 91.1218 243.905 91.3969 244.023 91.6131C244.151 91.8293 244.386 91.9374 244.73 91.9374H247.826V93.8979H244.141C243.679 93.8979 243.266 93.7898 242.903 93.5737C242.539 93.3575 242.249 93.0626 242.033 92.6892C241.817 92.3158 241.704 91.8981 241.694 91.4362V88.606C241.704 88.1932 241.822 87.8296 242.048 87.5152C242.283 87.1909 242.578 86.9452 242.932 86.7781C243.296 86.611 243.664 86.5275 244.038 86.5275H250.966ZM251.857 93.8979V86.5275H254.009V93.8979H251.857ZM258.977 89.6378C258.977 89.2939 258.913 89.0187 258.785 88.8124C258.667 88.5962 258.436 88.4881 258.092 88.4881H254.997V86.5275H258.682C259.144 86.5275 259.557 86.6356 259.92 86.8518C260.284 87.068 260.574 87.3628 260.79 87.7363C261.006 88.1097 261.119 88.5274 261.129 88.9892V93.8979H258.977V89.6378ZM265.558 91.9374V93.8979H264.467C264.005 93.8979 263.588 93.7898 263.214 93.5737C262.841 93.3575 262.546 93.0626 262.33 92.6892C262.123 92.3158 262.02 91.8981 262.02 91.4362V82.8423H264.172V85.7315H265.189V87.8837H264.172V90.7876C264.172 91.1218 264.231 91.3969 264.349 91.6131C264.477 91.8293 264.713 91.9374 265.057 91.9374H265.558Z"
                            fill="white"/>
                        <path
                            d="M18.7493 22.8834V30.1924L60.8027 30.0865C62.78 30.0865 64.2277 29.6275 65.1458 28.7094C66.0638 27.7208 66.5228 25.7081 66.5228 22.6715C66.5228 20.2705 66.311 18.5403 65.8873 17.481C65.4636 16.3511 64.8633 15.645 64.0865 15.3625C63.3097 15.08 62.1798 14.9388 60.6968 14.9388H3.17784V0.850335H67.1584C71.3249 0.850335 74.8205 1.90962 77.6453 4.02818C80.5407 6.14674 81.9883 9.7483 81.9883 14.8328V29.1331C81.9883 31.3223 81.5646 33.0172 80.7172 34.2177C85.0956 36.195 87.2847 39.5141 87.2847 44.1749V62.9242C87.0729 70.9747 82.4121 75 73.3022 75H3.17784V22.8834H18.7493ZM66.0991 60.9116C68.1471 60.9116 69.6301 60.4172 70.5481 59.4286C71.4661 58.4399 71.9252 56.3213 71.9252 53.0729C71.9252 49.6832 71.4308 47.3881 70.4422 46.1876C69.5241 44.9164 68.0411 44.2809 65.9932 44.2809H18.7493V60.9116H66.0991ZM93.5891 0.850335H177.59V16.4218H93.5891V0.850335ZM127.91 24.3664H143.375V75H127.91V24.3664ZM200.74 75C198.056 75 195.443 74.3997 192.901 73.1992C190.359 71.9987 188.24 70.2685 186.545 68.0087C184.85 65.6783 183.968 63.0301 183.897 60.0641V52.5432V15.7862C183.968 12.8202 184.85 10.2073 186.545 7.94752C188.24 5.6171 190.359 3.85163 192.901 2.65111C195.443 1.4506 198.056 0.850335 200.74 0.850335H253.068C257.164 0.850335 260.66 1.90962 263.555 4.02818C266.45 6.14674 267.898 9.7483 267.898 14.8328V26.379H253.068V21.2945C252.997 19.3171 252.75 17.9048 252.327 17.0573C251.903 16.1393 251.338 15.5743 250.632 15.3625C249.996 15.08 248.972 14.9388 247.56 14.9388H204.341C202.787 15.08 201.622 15.539 200.845 16.3158C200.069 17.0926 199.61 18.5756 199.468 20.7648C199.468 35.1004 199.433 45.8698 199.362 53.0729C199.362 56.3213 199.821 58.4399 200.74 59.4286C201.658 60.4172 203.105 60.9116 205.083 60.9116H247.56C248.972 60.9116 249.996 60.8056 250.632 60.5938C251.338 60.3113 251.903 59.7464 252.327 58.8989C252.75 57.9809 252.997 56.5332 253.068 54.5559V48.0943H267.898V61.0175C267.898 66.102 266.45 69.7036 263.555 71.8222C260.66 73.9407 257.164 75 253.068 75H200.74Z"
                            fill="#F4FFF2"/>
                        <path
                            d="M49.1852 108.251L51.6296 103.647H53.6391L50.115 109.976V114.415H48.1954V109.976L44.6562 103.647H46.7408L49.1852 108.251ZM61.9413 110.485C61.9413 112.93 60.3667 114.58 58.1472 114.58C55.9277 114.58 54.3531 112.93 54.3531 110.485C54.3531 108.041 55.9277 106.391 58.1472 106.391C60.3667 106.391 61.9413 108.041 61.9413 110.485ZM56.1677 110.485C56.1677 112.09 56.9325 113.065 58.1472 113.065C59.3619 113.065 60.1267 112.09 60.1267 110.485C60.1267 108.881 59.3619 107.906 58.1472 107.906C56.9325 107.906 56.1677 108.881 56.1677 110.485ZM70.4084 106.541V114.415H68.6088V113.575C68.1589 114.1 67.4841 114.58 66.4643 114.58C64.8147 114.58 63.795 113.455 63.795 111.76V106.541H65.5946V111.37C65.5946 112.33 66.0145 112.945 66.9892 112.945C67.799 112.945 68.6088 112.345 68.6088 111.22V106.541H70.4084ZM72.4571 114.415V112.885H74.5416V108.071H72.4571V106.541H76.3112V107.816C76.806 106.916 77.8708 106.391 78.9655 106.391C79.5204 106.391 79.9103 106.481 80.1952 106.601V108.371C79.7903 108.236 79.4154 108.146 78.7856 108.146C77.5709 108.146 76.3112 108.926 76.3112 110.261V112.885H79.1305V114.415H72.4571ZM89.6313 112.345L91.1159 111.1C91.8657 112.27 92.9905 112.96 94.2202 112.96C95.4349 112.96 96.3497 112.39 96.3497 111.355C96.3497 110.261 95.2249 110.096 93.6203 109.706C92.0007 109.316 90.2611 108.851 90.2611 106.751C90.2611 104.757 91.9707 103.482 94.1452 103.482C95.9898 103.482 97.4294 104.322 98.1492 105.447L96.7546 106.646C96.1547 105.717 95.3449 105.087 94.0852 105.087C92.9305 105.087 92.1207 105.672 92.1207 106.556C92.1207 107.501 92.9605 107.711 94.4151 108.041C96.1547 108.431 98.2392 108.821 98.2392 111.16C98.2392 113.275 96.3797 114.58 94.1602 114.58C92.3156 114.58 90.4711 113.725 89.6313 112.345ZM102.042 114.55C100.483 114.55 99.2981 113.635 99.2981 112.225C99.2981 110.725 100.453 110.051 102.027 109.751L104.352 109.301V109.166C104.352 108.416 103.902 107.936 102.897 107.936C102.012 107.936 101.458 108.356 101.233 109.121L99.553 108.716C99.958 107.411 101.158 106.391 102.972 106.391C104.922 106.391 106.106 107.291 106.106 109.106V112.495C106.106 112.945 106.316 113.08 106.826 113.02V114.415C105.477 114.565 104.772 114.31 104.487 113.665C103.962 114.235 103.107 114.55 102.042 114.55ZM104.352 111.64V110.665L102.492 111.025C101.713 111.175 101.098 111.445 101.098 112.15C101.098 112.765 101.578 113.11 102.297 113.11C103.302 113.11 104.352 112.6 104.352 111.64ZM115.293 114.415H108.365V112.885H110.645V108.071H108.365V106.541H110.645C110.645 104.382 112.144 103.482 114.049 103.482C114.754 103.482 115.413 103.572 115.893 103.677V105.237C115.353 105.162 114.859 105.072 114.109 105.072C112.984 105.072 112.444 105.522 112.444 106.541H115.893V108.071H112.444V112.885H115.293V114.415ZM121.286 114.58C118.947 114.58 117.297 112.915 117.297 110.485C117.297 108.176 118.932 106.391 121.211 106.391C123.596 106.391 124.855 108.116 124.855 110.276V110.875H119.052C119.202 112.225 120.071 113.05 121.301 113.05C122.276 113.05 123.026 112.6 123.296 111.79L124.81 112.375C124.24 113.755 122.936 114.58 121.286 114.58ZM121.211 107.906C120.191 107.906 119.427 108.461 119.157 109.526H123.041C123.026 108.656 122.441 107.906 121.211 107.906ZM142.899 112.735V114.415H135.251V112.735H138.115V105.327H135.251V103.647H142.899V105.327H140.035V112.735H142.899ZM144.798 114.415V106.541H146.598V107.381C147.047 106.856 147.752 106.391 148.772 106.391C150.422 106.391 151.411 107.531 151.411 109.226V114.415H149.612V109.751C149.612 108.776 149.222 108.071 148.232 108.071C147.422 108.071 146.598 108.671 146.598 109.796V114.415H144.798ZM153.79 114.415V106.541H155.59V107.381C156.039 106.856 156.744 106.391 157.764 106.391C159.414 106.391 160.403 107.531 160.403 109.226V114.415H158.604V109.751C158.604 108.776 158.214 108.071 157.224 108.071C156.414 108.071 155.59 108.671 155.59 109.796V114.415H153.79ZM169.845 110.485C169.845 112.93 168.271 114.58 166.051 114.58C163.832 114.58 162.257 112.93 162.257 110.485C162.257 108.041 163.832 106.391 166.051 106.391C168.271 106.391 169.845 108.041 169.845 110.485ZM164.072 110.485C164.072 112.09 164.837 113.065 166.051 113.065C167.266 113.065 168.031 112.09 168.031 110.485C168.031 108.881 167.266 107.906 166.051 107.906C164.837 107.906 164.072 108.881 164.072 110.485ZM175.943 114.415H174.128L170.949 106.541H172.839L175.058 112.3L177.263 106.541H179.122L175.943 114.415ZM182.971 114.55C181.411 114.55 180.226 113.635 180.226 112.225C180.226 110.725 181.381 110.051 182.956 109.751L185.28 109.301V109.166C185.28 108.416 184.83 107.936 183.825 107.936C182.941 107.936 182.386 108.356 182.161 109.121L180.481 108.716C180.886 107.411 182.086 106.391 183.9 106.391C185.85 106.391 187.035 107.291 187.035 109.106V112.495C187.035 112.945 187.245 113.08 187.754 113.02V114.415C186.405 114.565 185.7 114.31 185.415 113.665C184.89 114.235 184.035 114.55 182.971 114.55ZM185.28 111.64V110.665L183.42 111.025C182.641 111.175 182.026 111.445 182.026 112.15C182.026 112.765 182.506 113.11 183.225 113.11C184.23 113.11 185.28 112.6 185.28 111.64ZM191.153 111.715V108.071H189.023V106.541H191.153V104.232H192.922V106.541H196.536V108.071H192.922V111.55C192.922 112.57 193.477 112.9 194.677 112.9C195.337 112.9 195.952 112.795 196.506 112.645V114.25C195.982 114.4 195.142 114.52 194.347 114.52C192.667 114.52 191.153 113.83 191.153 111.715ZM201.344 105.492V103.647H203.204V105.492H201.344ZM198.705 114.415V112.885H201.374V108.071H198.705V106.541H203.174V112.885H205.843V114.415H198.705ZM214.805 110.485C214.805 112.93 213.231 114.58 211.011 114.58C208.792 114.58 207.217 112.93 207.217 110.485C207.217 108.041 208.792 106.391 211.011 106.391C213.231 106.391 214.805 108.041 214.805 110.485ZM209.032 110.485C209.032 112.09 209.797 113.065 211.011 113.065C212.226 113.065 212.991 112.09 212.991 110.485C212.991 108.881 212.226 107.906 211.011 107.906C209.797 107.906 209.032 108.881 209.032 110.485ZM216.734 114.415V106.541H218.534V107.381C218.983 106.856 219.688 106.391 220.708 106.391C222.358 106.391 223.347 107.531 223.347 109.226V114.415H221.548V109.751C221.548 108.776 221.158 108.071 220.168 108.071C219.358 108.071 218.534 108.671 218.534 109.796V114.415H216.734Z"
                            fill="#F4FFF2"/>
                        <path d="M3.19531 109.148L41.1275 109.148" stroke="#F4FFF2" strokeWidth="1.76429"
                              strokeLinecap="round"/>
                        <path d="M228.143 109.148L266.075 109.148" stroke="#F4FFF2" strokeWidth="1.76429"
                              strokeLinecap="round"/>
                    </svg>
                </h2>

                <a
                    href="https://egpbtc.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-4)] text-center border border-[#abe1fa86] py-[20px] px-[60px] rounded-[16px] hover:bg-[var(--bg)] hover:text-[var(--primary-color)] transition duration-400"
                >
                    <h5>Visit BTC Website</h5>
                    <span className="font-semibold text-[28px]">www.egpbtc.com</span>
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
                            <svg id="theme-toggle-dark-icon" className="hidden w-5 h-5" fill="white" viewBox="0 0 20 20"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                            </svg>
                            <svg id="theme-toggle-light-icon" className="hidden w-5 h-5" fill="currentColor"
                                 viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
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