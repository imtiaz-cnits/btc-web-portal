import React from 'react';
import { format, parseISO } from 'date-fns';

const NoticeTable = ({ notices, loading, error, currentPage, noticesPerPage, handlePageChange, handleViewFile, noticeType }) => {
    const totalNotices = notices.length;
    const totalPages = Math.ceil(totalNotices / noticesPerPage) || 1;
    const indexOfLastNotice = currentPage * noticesPerPage;
    const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
    const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy');
        } catch {
            return 'Invalid Date';
        }
    };

    const getPageNumbers = () => {
        const MAX_PAGES_TO_SHOW = 5; // Renamed to follow ESLint convention (uppercase for constants)
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

    // Determine the header text based on noticeType
    const lastDateHeader = noticeType === 'Winner List' ? 'Lottery Date' : 'Last Date';

    return (
        <div className="all-notice">
            <div className="mt-6 w-full md:overflow-x-auto overflow-x-auto" style={{ overflowX: 'auto' }}>
                <table className="w-full border border-[var(--ac-1)]">
                    <thead className="bg-[var(--primary-color)]">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)]">
                            SL No.
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)] min-w-[300px]">
                            Title
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)]">
                            Publish Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)]">
                            {lastDateHeader}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-[var(--secondary-color)] uppercase tracking-wider border border-[var(--ac-1)]">
                            Action
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-[var(--secondary-color)] divide-y">
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="px-4 py-4 text-center text-[var(--text-1)] text-base">
                                Loading notices...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="5" className="px-4 py-4 text-center text-[var(--text-1)] text-base">
                                Failed to load notices: {error}
                            </td>
                        </tr>
                    ) : currentNotices.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-4 py-4 text-center text-[var(--text-1)] text-base">
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
                                    <td className="px-4 py-3 whitespace-nowrap border border-[var(--ac-1)] text-sm">
                                        {indexOfFirstNotice + index + 1}
                                    </td>
                                    <td className="px-4 py-3 border border-[var(--ac-1)] min-w-[300px] text-sm">
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
                                                {notice.createdAt ? format(parseISO(notice.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap border border-[var(--ac-1)] text-sm">
                                        {formatDate(notice.publishDate)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap border border-[var(--ac-1)] text-sm">
                                        {formatDate(notice.lastDate)}
                                    </td>
                                    <td className="px-4 py-3 text-center whitespace-nowrap border border-[var(--ac-1)]">
                                        <button
                                            className="bg-[var(--primary-color)] hover:bg-green-600 text-[var(--secondary-color)] px-4 py-2 rounded-md transition-colors disabled:opacity-50 min-w-[100px] min-h-[44px] text-sm"
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

            {!loading && !error && totalNotices > 0 && (
                <div className="pagination-container mt-6" style={{ marginTop: '2.5rem' }}>
                    <nav className="flex justify-center">
                        <ul className="inline-flex items-center flex-wrap rounded-lg overflow-hidden border border-[var(--ac-1)]">
                            <li>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="px-4 py-2 cursor-pointer text-[var(--text-1)] bg-[var(--secondary-color)] hover:bg-[var(--primary-color)] hover:text-[var(--secondary-color)] disabled:opacity-50 min-w-[44px] min-h-[44px]"
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            {getPageNumbers().map((page, index) => (
                                <li key={index}>
                                    {page === '...' ? (
                                        <span className="px-4 py-2 cursor-pointer text-[var(--text-1)] bg-[var(--secondary-color)] min-w-[44px] min-h-[44px] flex items-center justify-center">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={`px-4 py-2 cursor-pointer ${
                                                currentPage === page
                                                    ? 'text-[var(--secondary-color)] bg-[var(--primary-color)] border-[var(--primary-color)]'
                                                    : 'text-[var(--text-1)] bg-[var(--secondary-color)] border-[var(--ac-1)] hover:bg-[var(--primary-color)] hover:text-[var(--secondary-color)]'
                                            } min-w-[44px] min-h-[44px]`}
                                        >
                                            {page}
                                        </button>
                                    )}
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="px-4 py-2 cursor-pointer text-[var(--text-1)] bg-[var(--secondary-color)] hover:bg-[var(--primary-color)] hover:text-[var(--secondary-color)] disabled:opacity-50 min-w-[44px] min-h-[44px]"
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
    );
};

export default NoticeTable;