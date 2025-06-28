import React, { useEffect, useState, useCallback } from 'react';
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet';
import api from '../../api/index.js';
import { useGsapAnimation, gsapAnimations } from '../assets/js/style.js';
import NoticeHeroImage from '../assets/img/contact/contact-theame-image.png';
import NoticeTable from './NoticeTable.jsx';

// Modern Error Boundary Component
class NoticeErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error in EgpNotices component:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="text-center text-[var(--text-1)] p-6">
                    <h2>Something went wrong while displaying notices.</h2>
                    <p>{this.state.error?.message || 'Please try again later.'}</p>
                    <button
                        className="mt-4 bg-[var(--primary-color)] text-[var(--secondary-color)] px-4 py-2 rounded-md hover:bg-green-600"
                        onClick={() => {
                            this.setState({ hasError: false, error: null, errorInfo: null });
                            window.location.reload();
                        }}
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const EgpNotices = () => {
    useGsapAnimation(gsapAnimations);

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const noticesPerPage = 10;

    const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://egpbtc.com';

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await api.get('/notices');
                if (response.data.success) {
                    console.log('Fetched notices:', response.data.notices.map(n => ({ id: n._id, title: n.title })));
                    setNotices(response.data.notices || []);
                    setLoading(false);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch notices');
                }
            } catch (err) {
                setError(err.message || 'Failed to load notices');
                setLoading(false);
                console.error('Error fetching notices:', err);
            }
        };

        fetchNotices();
    }, []);

    const handleViewFile = useCallback((filePath, fileType, id, content) => {
        console.log('handleViewFile called with:', { filePath, fileType, id, content });
        if (filePath && typeof filePath === 'string') {
            const fileUrl = `${BASE_URL}${filePath}`;
            const isImage = ['.jpg', '.jpeg', '.png', '.gif'].some(ext => filePath.toLowerCase().endsWith(ext));
            const inferredType = fileType || (filePath.toLowerCase().endsWith('.pdf') ? 'pdf' : isImage ? 'image' : 'unknown');
            if (inferredType === 'pdf' || inferredType === 'image') {
                window.open(fileUrl, '_blank');
            } else {
                alert('Unsupported file type');
            }
        } else if (content && typeof content === 'string' && content.trim() && id) {
            window.open(`/view-egp-notice/${id}`, '_blank');
        } else {
            alert('No file or valid content available to view.');
            console.warn('No content to display:', { filePath, id });
        }
    }, [BASE_URL]);

    return (
        <NoticeErrorBoundary>
            <>
                <Helmet>
                    <title>EGP Notices | Building Technology & Consultant</title>
                    <meta name="description" content="View the latest EGP notices from Your Site Name." />
                    <meta name="keywords" content="EGP notices, announcements, Your Site Name, updates" />
                </Helmet>

                <div className="contact_us bg-[var(--secondary-color)] text-center pt-5 overflow-hidden">
                    <div className="custom-container">
                        <div className="flex gap-4 flex-col lg:flex-row">
                            <div className="w-full lg:w-1/2 flex items-stretch">
                                <div className="breadcrumb flex flex-col justify-center w-full rounded-[24px_0px_24px_24px] p-6 m-0 bg-[url('../assets/img/contact/contact-bg.png')] bg-no-repeat bg-center bg-cover">
                                    <div className="wrapper inline-block">
                                        <h2 className="title text-[48px] lg:text-[32px] font-medium font-[var(--primary-font)] text-[var(--secondary-color)] uppercase mb-2.5">
                                            EGP Notices
                                        </h2>
                                        <div className="wrap inline-block bg-[var(--text-1)] px-6 py-1.5 lg:px-4 lg:py-1 rounded-[30px]">
                                            <ul className="breadcrumb_item flex items-center justify-center gap-2.5">
                                                <li>
                                                    <Link to="/" className="item flex justify-center items-center font-[var(--primary-font)] text-sm uppercase text-[var(--secondary-color)] cursor-pointer transition-all duration-300">
                                                        HOME
                                                    </Link>
                                                </li>
                                                <li>
                                                    <i className="fa-solid fa-angle-right text-[var(--primary-color)] text-sm"></i>
                                                </li>
                                                <li>
                                                    <Link to="" className="item flex justify-center items-center font-[var(--primary-font)] text-sm uppercase text-[var(--secondary-color)] cursor-pointer transition-all duration-300">
                                                        NOTICES
                                                    </Link>
                                                </li>
                                                <li>
                                                    <i className="fa-solid fa-angle-right text-[var(--primary-color)] text-sm"></i>
                                                </li>
                                                <li>
                                                    <Link to="/egp-notices" className="active_item item flex justify-center items-center font-[var(--primary-font)] text-sm uppercase text-[var(--secondary-color)] cursor-pointer">
                                                        EGP NOTICES
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2 flex items-stretch mt-5 lg:mt-0">
                                <div className="contact_theame w-full rounded-[24px_25px_24px_0px] overflow-hidden">
                                    <img src={NoticeHeroImage} alt="" className="w-full h-full object-cover bg-center bg-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="single_notice mt-[60px]">
                    <div className="custom-container">
                        <NoticeTable
                            notices={notices}
                            loading={loading}
                            error={error}
                            currentPage={currentPage}
                            noticesPerPage={noticesPerPage}
                            handlePageChange={setCurrentPage}
                            handleViewFile={handleViewFile}
                            baseUrl={BASE_URL}
                        />
                    </div>
                </div>
            </>
        </NoticeErrorBoundary>
    );
};

export default EgpNotices;