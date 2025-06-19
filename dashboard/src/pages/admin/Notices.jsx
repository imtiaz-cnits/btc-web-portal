import React, { useState, useEffect, useRef } from 'react';
import useDarkMode from '../../hooks/useDarkMode';
import api from '../../api/index.js';
import Swal from 'sweetalert2';

const Notices = () => {
    const [dark] = useDarkMode();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        issueDate: '',
        publishDate: '',
        status: 'active',
        content: '',
        file: null,
    });
    const [search, setSearch] = useState('');
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

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

        const updateSwalTheme = () => {
            const popup = Swal.getPopup();
            if (popup) {
                if (dark) {
                    popup.style.backgroundColor = 'var(--dark-bg)';
                    popup.style.color = 'var(--text-1)';
                } else {
                    popup.style.backgroundColor = '#fff';
                    popup.style.color = '#000';
                }
            }
        };

        updateSwalTheme();
        const observer = new MutationObserver(updateSwalTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, [dark]);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                setLoading(true);
                const response = await api.get('/notices');
                if (response.data.success) {
                    setNotices(response.data.notices);
                }
            } catch (error) {
                console.error('Error fetching notices:', error);
                setError('Failed to load notices');
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value,
        }));
    };

    const openModal = () => {
        setFormData({
            id: null,
            title: '',
            issueDate: '',
            publishDate: '',
            status: 'active',
            content: '',
            file: null,
        });
        setIsModalOpen(true);
        setError(null);
    };

    const openEditModal = (notice) => {
        setFormData({
            id: notice._id || notice.id,
            title: notice.title || '',
            issueDate: notice.issueDate ? new Date(notice.issueDate).toISOString().split('T')[0] : '',
            publishDate: notice.publishDate ? new Date(notice.publishDate).toISOString().split('T')[0] : '',
            status: notice.status || 'active',
            content: notice.content || '',
            file: null,
        });
        setIsModalOpen(true);
        setError(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('content', formData.content);
        formDataToSend.append('status', formData.status);
        if (formData.issueDate) formDataToSend.append('issueDate', formData.issueDate);
        if (formData.publishDate) formDataToSend.append('publishDate', formData.publishDate);
        if (formData.file) formDataToSend.append('file', formData.file);

        try {
            const url = formData.id ? `/notices/${formData.id}` : '/add-notice';
            const method = formData.id ? 'put' : 'post';
            const response = await api[method](url, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                const newNotice = response.data.notice;
                if (newNotice) {
                    setNotices((prevNotices) =>
                        formData.id
                            ? prevNotices.map((notice) => (notice._id === newNotice._id ? newNotice : notice))
                            : [newNotice, ...prevNotices]
                    );
                } else {
                    const fetchResponse = await api.get('/notices');
                    if (fetchResponse.data.success) {
                        setNotices(fetchResponse.data.notices);
                    }
                }
                closeModal();
            } else {
                setError(response.data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting notice:', error);
            setError('An error occurred while saving the notice');
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone! This will permanently delete the notice.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel',
            customClass: {
                popup: dark ? 'bg-[var(--dark-bg)] text-[var(--text-1)]' : 'bg-white text-gray-900',
                confirmButton: 'focus:outline-none focus:ring-2 focus:ring-red-500',
                cancelButton: 'focus:outline-none focus:ring-2 focus:ring-blue-500',
            },
            didOpen: () => {
                const popup = Swal.getPopup();
                if (popup) {
                    if (dark) {
                        popup.style.backgroundColor = 'var(--dark-bg)';
                        popup.style.color = 'var(--text-1)';
                    } else {
                        popup.style.backgroundColor = '#fff';
                        popup.style.color = '#000';
                    }
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete(`/notices/${id}`)
                    .then((response) => {
                        if (response.data.success) {
                            setNotices((prevNotices) => prevNotices.filter((notice) => notice._id !== id));
                            Swal.fire('Deleted!', 'The notice has been deleted.', 'success');
                            setError(null);
                        } else {
                            setError(response.data.message || 'Failed to delete notice');
                            Swal.fire('Error!', 'Failed to delete the notice.', 'error');
                        }
                    })
                    .catch((error) => {
                        console.error('Error deleting notice:', error);
                        setError('An error occurred while deleting the notice');
                        Swal.fire('Error!', 'An error occurred while deleting the notice.', 'error');
                    });
            }
        });
    };

    const EditModal = ({ isOpen, onClose, onSubmit }) => {
        const modalRef = useRef(null);

        useEffect(() => {
            const modalEdit = modalRef.current;
            if (!modalEdit) return;

            const modalOverlay = modalEdit.querySelector('.modal-overlay');
            const modalContainer = modalEdit.querySelector('.modal-container');

            if (!modalOverlay || !modalContainer) return;

            if (isOpen) {
                modalOverlay.classList.add('active');
                modalContainer.classList.add('active');
                void modalEdit.offsetHeight;
            } else {
                modalOverlay.classList.remove('active');
                modalContainer.classList.remove('active');
            }

            return () => {
                if (!isOpen) {
                    setTimeout(() => {
                        modalOverlay.classList.remove('active');
                        modalContainer.classList.remove('active');
                    }, 300);
                }
            };
        }, [isOpen]);

        if (!isOpen) return null;

        const handleOverlayClick = (e) => {
            if (e.target.classList.contains('modal-overlay')) onClose();
        };

        return (
            <div ref={modalRef} id="editModal" className="fixed inset-0 flex items-center justify-center p-4" onClick={handleOverlayClick} style={{ zIndex: 100 }}>
                <div className="modal-overlay absolute inset-0 bg-[#111111a9] bg-opacity-50"></div>
                <div className="modal-container relative bg-[var(--bg)] dark:bg-[var(--dark-bg)] border border-transparent dark:border-[var(--dark-border)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                    <div className="px-6 py-4 border-b border-[var(--border-color2)] dark:border-[var(--dark-border)] flex justify-between items-center">
                        <h2 className="text-lg font-semibold !text-[var(--text-1)]">{formData.id ? 'Edit Notice' : 'Add New Notice'}</h2>
                        <button onClick={onClose} className="text-[var(--text-1)] dark:text-[var(--text-4)] hover:text-[var(--text-2)] focus:outline-none transition-colors duration-200 cursor-pointer">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="overflow-y-auto px-6 py-4 flex-1">
                        <form id="editModalForm" className="modalform" onSubmit={onSubmit} encType="multipart/form-data">
                            <div className="mb-3">
                                <label htmlFor="title" className="block text-sm font-medium text-[var(--text-1)] mb-1">Notice Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
                                    placeholder="Notice title"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
                                <div>
                                    <label htmlFor="issueDate" className="block text-sm font-medium text-[var(--text-1)] mb-1">Issue Date</label>
                                    <input
                                        type="date"
                                        id="issueDate"
                                        name="issueDate"
                                        value={formData.issueDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="publishDate" className="block text-sm font-medium text-[var(--text-1)] mb-1">Publishing Date</label>
                                    <input
                                        type="date"
                                        id="publishDate"
                                        name="publishDate"
                                        value={formData.publishDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-[var(--text-1)] mb-1">Status</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            id="radioOption1"
                                            name="status"
                                            value="active"
                                            checked={formData.status === 'active'}
                                            onChange={handleChange}
                                            className="form-radio text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                                            required
                                        />
                                        <span className="ml-2 text-[var(--text-1)] dark:text-[var(--text-4)]">Active</span>
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            id="radioOption2"
                                            name="status"
                                            value="inactive"
                                            checked={formData.status === 'inactive'}
                                            onChange={handleChange}
                                            className="form-radio text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                                        />
                                        <span className="ml-2 text-[var(--text-1)] dark:text-[var(--text-4)]">Inactive</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="content" className="block text-sm font-medium text-[var(--text-1)] mb-1">Notice Content</label>
                                <textarea
                                    id="content"
                                    rows="4"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
                                    placeholder="Enter notice content here..."
                                    required
                                ></textarea>
                            </div>
                            <div className="file-upload mb-3">
                                <label htmlFor="file_input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-[var(--text-4)]">Upload file</label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="file_input" className="flex flex-col items-center justify-center w-full h-[80px] border-2 border-[var(--border-color)] border-dashed rounded-lg cursor-pointer bg-[var(--secondary-color)] hover:bg-gray-100 dark:border-[var(--dark-border)] dark:bg-[var(--dark-bg2)] dark:hover:bg-[var(--dark-border)]">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-[40px] h-[40px] text-[var(--text-1)] dark:text-[var(--text-4)]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG, GIF, or PDF (MAX. 10MB)</p>
                                            </div>
                                        </div>
                                        <input id="file_input" type="file" name="file" onChange={handleChange} accept="image/jpeg,image/png,image/gif,application/pdf" className="hidden" />
                                    </label>
                                </div>
                            </div>
                            {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
                        </form>
                    </div>
                    <div className="sticky bottom-0 bg-[var(--bg)] dark:bg-[var(--dark-bg)] border-t border-[var(--border-color2)] dark:border-[var(--dark-border)] px-6 py-4 flex justify-end space-x-3 z-10">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-[var(--border-color2)] dark:border-[var(--dark-border)] rounded-md text-sm font-medium text-[var(--text-1)] dark:text-[var(--text-4)] hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200 cursor-pointer">Cancel</button>
                        <button type="submit" form="editModalForm" className="px-4 py-2 bg-[var(--primary-color)] border-none rounded-md text-sm font-medium text-[var(--text-4)] hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200 cursor-pointer">Save Changes</button>
                    </div>
                </div>
            </div>
        );
    };

    const filteredNotices = notices.filter((notice) => {
        const searchLower = search.toLowerCase();
        return (
            notice.title.toLowerCase().includes(searchLower) ||
            (notice.issueDate && new Date(notice.issueDate).toLocaleDateString().toLowerCase().includes(searchLower)) ||
            (notice.publishDate && new Date(notice.publishDate).toLocaleDateString().toLowerCase().includes(searchLower)) ||
            notice.status.toLowerCase().includes(searchLower) ||
            (notice.content && notice.content.toLowerCase().includes(searchLower))
        );
    });

    const indexOfLastNotice = currentPage * rowsPerPage;
    const indexOfFirstNotice = indexOfLastNotice - rowsPerPage;
    const currentNotices = filteredNotices.slice(indexOfFirstNotice, indexOfLastNotice);
    const totalPages = Math.ceil(filteredNotices.length / rowsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div>
            <style>
                {`
                    .table_main {
                        margin-bottom: 50px;
                    }
                    .table th, .table td {
                        padding: 8px;
                        text-align: left;
                        vertical-align: middle;
                        min-width: 80px;
                    }
                    .table th.title-column, .table td.title-column {
                        width: 300px;
                        max-width: 300px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap; /* Changed to nowrap for single-line truncation */
                    }
                    .table th.sl-column, .table td.sl-column {
                        width: 60px;
                    }
                    .table th.action-column, .table td.action-column {
                        width: 60px;
                    }
                    .table th.date-column, .table td.date-column {
                        width: 60px;
                    }
                    .table th.status-column, .table td.status-column {
                        width: 60px;
                    }
                    .table th.file-column, .table td.file-column {
                        width: 60px;
                    }
                    .table_wrapper {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    .table {
                        width: 100%;
                        min-width: 800px;
                        table-layout: auto;
                    }
                    @media (max-width: 640px) {
                        .table th, .table td {
                            font-size: 0.75rem;
                        }
                        .table th.title-column, .table td.title-column {
                            width: 150px;
                            max-width: 150px;
                        }
                    }
                `}
            </style>
            <div className="table_main relative bg-[var(--bg)] dark:bg-[var(--dark-bg2)] sm:rounded-lg p-[10px]">
                <div className="header_box">
                    <div className="flex flex-col md:flex-row flex-wrap space-y-4 md:space-y-0 items-start justify-center sm:justify-between mb-[20px] md:mb-0">
                        <div className="short_box flex gap-2">
                            <div className="wrapper">
                                <form className="max-w-sm">
                                    <select id="day_short" className="block w-full p-2 text-sm text-[var(--text-3)] border border-[var(--border-color)] rounded-lg bg-[var(--secondary-color)] focus:border-[var(--primary-color)] focus:outline-hidden dark:bg-[var(--dark-bg2)] dark:border-[var(--border-color)] dark:placeholder-[var(--text-2)] dark:text-[var(--text-4)] dark:focus:border-[var(--primary-color)] cursor-pointer">
                                        <option defaultValue>Last 30 Day</option>
                                        <option value="Last Day">Last Day</option>
                                        <option value="Last 7 Day">Last 7 Day</option>
                                        <option value="Last 30 Day">Last 30 Day</option>
                                        <option value="Last Month">Last Month</option>
                                        <option value="Last Year">Last Year</option>
                                    </select>
                                </form>
                            </div>
                            <div className="wrapper">
                                <form className="max-w-sm">
                                    <select id="entries_box" className="block w-full p-2 text-sm text-[var(--text-3)] border border-[var(--border-color)] rounded-lg bg-[var(--secondary-color)] focus:border-[var(--primary-color)] focus:outline-hidden dark:bg-[var(--dark-bg2)] dark:border-[var(--border-color)] dark:placeholder-[var(--text-2)] dark:text-[var(--text-4)] dark:focus:border-[var(--primary-color)] cursor-pointer" disabled>
                                        <option value="10" selected>10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </form>
                            </div>
                        </div>
                        <div className="block md:flex items-start gap-2">
                            <div className="table_src relative mb-[20px]">
                                <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-[var(--text-1)]" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <input type="text" id="table-search" value={search} onChange={(e) => setSearch(e.target.value)} className="block ps-10 p-2 text-sm text-[var(--text-3)] border border-[var(--border-color)] rounded-lg bg-[var(--secondary-color)] focus:border-[var(--primary-color)] focus:outline-hidden dark:bg-[var(--dark-bg2)] dark:border-[var(--border-color)] dark:placeholder-[var(--text-2)] dark:text-[var(--text-4)] dark:focus:border-[var(--primary-color)]" placeholder="Search for items" />
                            </div>
                            <button className="sign_in_btn w-full bg-[var(--primary-color)] text-[var(--text-4)] py-2 px-4 rounded-[12px] hover:bg-[var(--text-1)] transition duration-400 mb-[20px] shadow-md cursor-pointer" onClick={openModal}>Create New Notice</button>
                        </div>
                    </div>
                </div>
                <div className="table_wrapper overflow-x-auto">
                    <table className="table w-full text-sm text-left rtl:text-right text-[var(--text-1)] dark:text-[var(--text-4)]">
                        <thead className="text-xs text-[var(--text-1)] dark:text-[var(--text-4)] uppercase bg-[var(--secondary-color)] dark:bg-[var(--dark-bg3)]">
                        <tr>
                            <th className="sl-column">Sl</th>
                            <th className="action-column hide_content">Action</th>
                            <th className="title-column">Title</th>
                            <th className="date-column">Issue Date</th>
                            <th className="date-column">Publish Date</th>
                            <th className="status-column">Status</th>
                            <th className="date-column">Date</th>
                            <th className="file-column">File</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
                        ) : currentNotices.length === 0 ? (
                            <tr><td colSpan="8" className="text-center py-4">No notices found</td></tr>
                        ) : (
                            currentNotices.map((notice, index) => (
                                <tr key={notice._id || notice.id} className="dark:border-[var(--dark-border)] border-[var(--border-color2)] border-b">
                                    <td className="sl-column">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center checkbox_wrap hide_content">
                                                <input id={`checkbox-table-search-${notice._id || notice.id}`} type="checkbox" className="w-4 h-4 text-[var(--primary-color)] bg-[var(--secondary-color)] border-[var(--border-color2)] rounded-sm focus:ring-[var(--primary-color)] dark:focus:ring-[var(--primary-color)] dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-1 dark:bg-[var(--text-1)] dark:border-[var(--dark-border)]" />
                                                <label htmlFor={`checkbox-table-search-${notice._id || notice.id}`} className="sr-only">checkbox</label>
                                            </div>
                                            <span>{index + 1 + indexOfFirstNotice}</span>
                                        </div>
                                    </td>
                                    <td className="action-column hide_content font-medium text-[var(--text-1)] whitespace-nowrap dark:text-[var(--text-4)]">
                                        <div className="flex items-center gap-1">
                                            <button className="quick-btn text-[var(--primary-color)] hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 cursor-pointer" aria-label="View notice">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button className="edit-btn text-yellow-500 hover:text-yellow-700 p-1 rounded-full hover:bg-yellow-50 cursor-pointer" onClick={() => openEditModal(notice)} aria-label="Edit notice">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <button className="delete-btn text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 cursor-pointer" onClick={() => handleDelete(notice._id || notice.id)} aria-label="Delete notice">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="title-column font-medium text-[var(--text-1)] dark:text-[var(--text-4)]">{notice.title}</td>
                                    <td className="date-column">{notice.issueDate ? new Date(notice.issueDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="date-column">{notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="status-column">
                                        <button className={`${(notice.status || 'active').toLowerCase()}-status flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${notice.status === 'active' ? 'text-green-500' : 'text-red-500'} mr-1`} viewBox="0 0 20 20" fill="currentColor">
                                                {notice.status === 'active' && (
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                )}
                                                {notice.status === 'inactive' && (
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                )}
                                            </svg>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${notice.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {notice.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                        </button>
                                    </td>
                                    <td className="date-column">{new Date(notice.createdAt).toLocaleDateString()}</td>
                                    <td className="file-column">
                                        {notice.filePath && (
                                            <a href={`http://localhost:3001${notice.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                View File
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    <p className="entries pt-2">
                        Showing {currentNotices.length} of {filteredNotices.length} entries
                    </p>
                    <div className="pagination">
                        <ul className="flex justify-center items-center gap-2 py-2">
                            <li
                                onClick={() => {
                                    if (currentPage !== 1) handlePrevious();
                                }}
                                className={`mx-1 px-3 py-2 bg-gray-200 rounded-lg font-bold ${
                                    currentPage === 1
                                        ? 'text-gray-500 opacity-50 cursor-not-allowed'
                                        : 'text-[var(--text-1)] hover:bg-gray-700 hover:text-gray-200 cursor-pointer'
                                }`}
                            >
                                <span className="flex items-center">Previous</span>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <li
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`mx-1 px-3 py-2 bg-gray-200 rounded-lg font-bold ${
                                        page === currentPage
                                            ? 'bg-gray-700 text-gray-200'
                                            : 'text-[var(--text-1)] hover:bg-gray-700 hover:text-gray-200 cursor-pointer'
                                    }`}
                                >
                                    {page}
                                </li>
                            ))}
                            <li
                                onClick={() => {
                                    if (currentPage !== totalPages && totalPages !== 0) handleNext();
                                }}
                                className={`mx-1 px-3 py-2 bg-gray-200 rounded-lg font-bold ${
                                    currentPage === totalPages || totalPages === 0
                                        ? 'text-gray-500 opacity-50 cursor-not-allowed'
                                        : 'text-[var(--text-1)] hover:bg-gray-700 hover:text-gray-200 cursor-pointer'
                                }`}
                            >
                                <span className="flex items-center">Next</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <EditModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit} />
        </div>
    );
};

export default Notices;