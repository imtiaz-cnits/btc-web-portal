"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';

interface Notice {
    _id?: string;
    title: string;
    createdAt?: string;
    publishDate?: string;
    lastDate?: string;
    filePath?: string;
    fileType?: string;
    content?: string;
    category?: string;
}

interface NoticeTableProps {
    notices: Notice[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    noticesPerPage: number;
    handlePageChange: (page: number) => void;
    handleViewFile: (filePath?: string, fileType?: string, id?: string, content?: string) => void;
    noticeType?: string;
    baseUrl?: string;
}

const NoticeTable: React.FC<NoticeTableProps> = ({ 
    notices, 
    loading, 
    error, 
    currentPage, 
    noticesPerPage, 
    handlePageChange, 
    handleViewFile, 
    noticeType 
}) => {
    const totalNotices = notices.length;
    const totalPages = Math.ceil(totalNotices / noticesPerPage) || 1;
    const indexOfLastNotice = currentPage * noticesPerPage;
    const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
    const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy');
        } catch {
            return 'Invalid Date';
        }
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
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

    const lastDateHeader = noticeType === 'Winner List' ? 'Lottery Date' : 'Last Date';

    return (
        <div className="all-notice">
            <div className="mt-6 w-full overflow-x-auto" style={{ overflowX: 'auto' }}>
                <table className="w-full border border-ac-1 border-collapse">
                    <thead className="bg-primary">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-secondary uppercase tracking-wider border border-ac-1">
                                SL No.
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-secondary uppercase tracking-wider border border-ac-1 min-w-[300px]">
                                Title
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-secondary uppercase tracking-wider border border-ac-1">
                                Publish Date
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-secondary uppercase tracking-wider border border-ac-1">
                                {lastDateHeader}
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-secondary uppercase tracking-wider border border-ac-1">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-secondary divide-y divide-ac-1">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-text-1 text-base font-medium italic">
                                    Loading notices...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-red-500 text-base font-medium">
                                    Failed to load notices: {error}
                                </td>
                            </tr>
                        ) : currentNotices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-text-1 text-base font-medium italic">
                                    No notices available
                                </td>
                            </tr>
                        ) : (
                            currentNotices.map((notice, index) => {
                                const isImage = notice.filePath?.match(/\.(jpg|jpeg|png|gif)$/i);
                                const fileType = notice.fileType || (notice.filePath?.endsWith('.pdf') ? 'pdf' : isImage ? 'image' : notice.content ? 'content' : 'none');
                                const buttonText = fileType === 'pdf' ? 'View PDF' : fileType === 'image' ? 'View Image' : fileType === 'content' ? 'View Notice' : 'No File';
                                const isButtonDisabled = fileType === 'none';

                                return (
                                    <tr key={notice._id || index} className="hover:bg-shade-1 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap border border-ac-1 text-sm">
                                            {indexOfFirstNotice + index + 1}
                                        </td>
                                        <td className="px-4 py-3 border border-ac-1 min-w-[300px] text-sm">
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleViewFile(notice.filePath, fileType, notice._id, notice.content);
                                                }}
                                                className="text-primary hover:text-primary/80 hover:underline text-left font-medium block transition-colors"
                                            >
                                                {notice.title || 'Untitled Notice'}
                                            </button>
                                            <span className="block text-xs text-text-1 mt-1 opacity-70">
                                                {notice.createdAt ? format(parseISO(notice.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap border border-ac-1 text-sm">
                                            {formatDate(notice.publishDate)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap border border-ac-1 text-sm">
                                            {formatDate(notice.lastDate)}
                                        </td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap border border-ac-1">
                                            <button
                                                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-all disabled:opacity-50 min-w-[100px] text-sm font-medium shadow-sm active:scale-95"
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
            {!loading && !error && totalNotices > noticesPerPage && (
                <div className="pagination-container mt-10">
                    <nav className="flex justify-center">
                        <ul className="inline-flex items-center flex-wrap rounded-lg overflow-hidden border border-ac-1">
                            <li>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="px-4 py-2 cursor-pointer text-text-1 bg-secondary hover:bg-primary hover:text-white disabled:opacity-50 min-w-[44px] min-h-[44px] border-r border-ac-1 transition-all"
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            {getPageNumbers().map((page, index) => (
                                <li key={index}>
                                    {page === '...' ? (
                                        <span className="px-4 py-2 text-text-1 bg-secondary min-w-[44px] min-h-[44px] flex items-center justify-center border-r border-ac-1">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handlePageChange(page as number)}
                                            className={`px-4 py-2 cursor-pointer transition-all border-r border-ac-1 ${
                                                currentPage === page
                                                    ? 'text-white bg-primary'
                                                    : 'text-text-1 bg-secondary hover:bg-primary hover:text-white'
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
                                    className="px-4 py-2 cursor-pointer text-text-1 bg-secondary hover:bg-primary hover:text-white disabled:opacity-50 min-w-[44px] min-h-[44px] transition-all"
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
