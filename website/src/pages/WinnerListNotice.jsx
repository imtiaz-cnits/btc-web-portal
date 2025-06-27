import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet';
import api from '../../api/index.js';
import {
    useGsapAnimation,
    gsapAnimations,
} from '../assets/js/style.js';
import NoticeHeroImage from '../assets/img/contact/contact-theame-image.png';

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
        console.error('Error in EGPNotice component:', error, errorInfo);
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

const WinnerListNotice = () => {
    // Use custom hook for GSAP animations
    useGsapAnimation(gsapAnimations);

    // State for notices
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const noticesPerPage = 10;

    // Fetch notices from backend
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await api.get('/winner-list');
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

    // Handle viewing PDF, image, or content
    const handleViewFile = (filePath, fileType, id, content) => {
        console.log('handleViewFile called with:', { filePath, fileType, id, content });
        if (filePath && typeof filePath === 'string') {
            const fileUrl = `https://egpbtc.com${filePath}`;
            const isImage = ['.jpg', '.jpeg', '.png', '.gif'].some(ext => filePath.toLowerCase().endsWith(ext));
            const inferredType = fileType || (filePath.toLowerCase().endsWith('.pdf') ? 'pdf' : isImage ? 'image' : 'unknown');
            if (inferredType === 'pdf' || inferredType === 'image') {
                window.open(fileUrl, '_blank');
            } else {
                alert('Unsupported file type');
            }
        } else if (content && typeof content === 'string' && content.trim() && id) {
            window.open(`/view-notice/${id}`, '_blank');
        } else {
            alert('No file or valid content available to view.');
            console.warn('No content to display:', { filePath, id });
        }
    };

    // Pagination logic
    const totalNotices = notices.length;
    const totalPages = Math.ceil(totalNotices / noticesPerPage) || 1;
    const indexOfLastNotice = currentPage * noticesPerPage;
    const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
    const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const MAX_PAGES_TO_SHOW = 5; // Renamed to satisfy ESLint rule
        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <NoticeErrorBoundary>
            <>
                {/* Helmet for dynamic title and meta tags */}
                <Helmet>
                    <title>Winner List | Building Technology & Consultant</title>
                    <meta name="description" content="View the latest notices and announcements from Your Site Name." />
                    <meta name="keywords" content="notices, announcements, Your Site Name, updates" />
                </Helmet>

                {/* Hero Start */}
                <div className="contact_us bg-[var(--secondary-color)] text-center pt-5 overflow-hidden">
                    <div className="custom-container">
                        <div className="flex gap-4 flex-col lg:flex-row">
                            {/* Left Column */}
                            <div className="w-full lg:w-1/2 flex items-stretch">
                                <div
                                    className="breadcrumb flex flex-col justify-center w-full rounded-[24px_0px_24px_24px] p-6 m-0 bg-[url('../assets/img/contact/contact-bg.png')] bg-no-repeat bg-center bg-cover"
                                >
                                    <div className="wrapper inline-block">
                                        <h2
                                            className="title text-[48px] lg:text-[32px] font-medium font-[var(--primary-font)] text-[var(--secondary-color)] uppercase mb-2.5"
                                        >
                                            Winner Lists
                                        </h2>
                                        <div
                                            className="wrap inline-block bg-[var(--text-1)] px-6 py-1.5 lg:px-4 lg:py-1 rounded-[30px]"
                                        >
                                            <ul
                                                className="breadcrumb_item flex items-center justify-center gap-2.5"
                                            >
                                                <li>
                                                    <Link
                                                        to="/"
                                                        className="item flex justify-center items-center font-[var(--primary-font)] text-sm uppercase text-[var(--secondary-color)] cursor-pointer transition-all duration-300"
                                                    >
                                                        HOME
                                                    </Link>
                                                </li>
                                                <li>
                                                    <i
                                                        className="fa-solid fa-angle-right text-[var(--primary-color)] text-sm"
                                                    ></i>
                                                </li>
                                                <li>
                                                    <Link
                                                        to=""
                                                        className="item flex justify-center items-center font-[var(--primary-font)] text-sm uppercase text-[var(--secondary-color)] cursor-pointer transition-all duration-300"
                                                    >
                                                        NOTICES
                                                    </Link>
                                                </li>
                                                <li>
                                                    <i
                                                        className="fa-solid fa-angle-right text-[var(--primary-color)] text-sm"
                                                    ></i>
                                                </li>
                                                <li>
                                                    <Link
                                                        to="/notices"
                                                        className="active_item item flex justify-center items-center font-[var(--primary-font)] text-sm uppercase text-[var(--secondary-color)] cursor-pointer"
                                                    >
                                                        WINNER LIST
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="w-full lg:w-1/2 flex items-stretch mt-5 lg:mt-0">
                                <div
                                    className="contact_theame w-full rounded-[24px_25px_24px_0px] overflow-hidden"
                                >
                                    <img
                                        src={NoticeHeroImage}
                                        alt=""
                                        className="w-full h-full object-cover bg-center bg-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Hero End */}

                {/* Single notice Start */}
                <div className="single_notice mt-[60px]">
                    <div className="custom-container">
                        <div className="all-notice">
                            <div className="overflow-x-auto mt-6 w-full" id="noticeTableContent">
                                <table className="min-w-full border border-[var(--ac-1)] w-full">
                                    <thead className="bg-[var(--primary-color)]">
                                    <tr>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)]"
                                        >
                                            SL No.
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)] w-[500px]"
                                        >
                                            Title
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)]"
                                        >
                                            Issue Date
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)]"
                                        >
                                            Publish Date
                                        </th>
                                        <th
                                            className="px-6 py-3 text-xs text-center font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)]"
                                        >
                                            Action
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-[var(--secondary-color)] divide-y">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-[var(--text-1)]">
                                                Loading notices...
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-[var(--text-1)]">
                                                Failed to load notices: {error}
                                            </td>
                                        </tr>
                                    ) : currentNotices.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-[var(--text-1)]">
                                                No notices available
                                            </td>
                                        </tr>
                                    ) : (
                                        currentNotices.map((notice, index) => {
                                            const isImage = typeof notice.filePath === 'string' && ['.jpg', '.jpeg', '.png', '.gif'].some(ext => notice.filePath.toLowerCase().endsWith(ext));
                                            const fileType = notice.fileType || (typeof notice.filePath === 'string' && notice.filePath.toLowerCase().endsWith('.pdf') ? 'pdf' : isImage ? 'image' : notice.content && typeof notice.content === 'string' && notice.content.trim() ? 'content' : 'none');
                                            const buttonText = fileType === 'pdf' ? 'View PDF' : fileType === 'image' ? 'View Image' : fileType === 'content' ? 'View Notice' : 'No File';
                                            const isButtonDisabled = fileType === 'none';

                                            return (
                                                <tr key={notice._id || index} className="hover:bg-[var(--shade-1)] border border-[var(--ac-1)]">
                                                    <td className="px-6 py-3 whitespace-nowrap border border-[var(--ac-1)]">
                                                        {indexOfFirstNotice + index + 1}
                                                    </td>
                                                    <td className="px-6 py-3 w-[500px] border border-[var(--ac-1)]">
                                                        <a
                                                            href="#"
                                                            className="text-[var(--primary-color)] hover:text-blue-800 hover:underline"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleViewFile(notice.filePath, fileType, notice._id, notice.content);
                                                            }}
                                                        >
                                                            {notice.title || 'Untitled Notice'}
                                                        </a>
                                                        <span className="block text-sm text-[var(--text-1)] mt-1">
                                                                {notice.createdAt ? new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                            </span>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap border border-[var(--ac-1)]">
                                                        {notice.issueDate ? new Date(notice.issueDate).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap border border-[var(--ac-1)]">
                                                        {notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap border border-[var(--ac-1)]">
                                                        <button
                                                            className="bg-[var(--primary-color)] cursor-pointer hover:bg-green-600 text-[var(--secondary-color)] px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                                                            onClick={() => handleViewFile(notice.filePath, fileType, notice._id, notice.content)}
                                                            disabled={isButtonDisabled}
                                                        >
                                                            {buttonText}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!loading && !error && totalNotices > 0 && (
                                <div className="pagination-container mt-10">
                                    <div className="pagination-info text-[var(--text-1)] mb-4">
                                        Showing {indexOfFirstNotice + 1} to {Math.min(indexOfLastNotice, totalNotices)} of {totalNotices} notices
                                    </div>
                                    <nav className="flex justify-center">
                                        <ul className="inline-flex items-center -space-x-px rounded-lg overflow-hidden border border-[var(--ac-1)]">
                                            <li>
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    className="px-3 py-2 leading-tight text-[var(--text-1)] bg-[var(--secondary-color)] hover:bg-[var(--primary-color)] hover:text-[var(--secondary-color)] disabled:opacity-50 cursor-pointer"
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            {getPageNumbers().map((page, index) => (
                                                <li key={index}>
                                                    {page === '...' ? (
                                                        <span className="px-3 py-2 leading-tight text-[var(--text-1)] bg-[var(--secondary-color)]">
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePageChange(page)}
                                                            className={`px-3 py-2 leading-tight ${
                                                                currentPage === page
                                                                    ? 'text-[var(--secondary-color)] bg-[var(--primary-color)] border-[var(--primary-color)] cursor-pointer'
                                                                    : 'text-[var(--text-1)] bg-[var(--secondary-color)] cursor-pointer border-[var(--ac-1)] hover:bg-[var(--primary-color)] hover:text-[var(--secondary-color)]'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                            <li>
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    className="px-3 py-2 leading-tight text-[var(--text-1)] bg-[var(--secondary-color)] cursor-pointer hover:bg-[var(--primary-color)] hover:text-[var(--secondary-color)] disabled:opacity-50"
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Single notice End */}
            </>
        </NoticeErrorBoundary>
    );
};

export default WinnerListNotice;