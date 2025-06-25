import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../../api/index.js';

const ViewNotice = () => {
    const { id } = useParams();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);

    // Fetch notice by ID
    useEffect(() => {
        isMountedRef.current = true;

        const fetchNotice = async () => {
            try {
                console.log('Fetching notice with ID:', id);
                const response = await api.get(`/notices/${id}`);
                console.log('API response:', JSON.stringify(response.data, null, 2));
                if (isMountedRef.current) {
                    if (response.data?.success) {
                        const noticeData = response.data.notice || {};
                        console.log('Setting notice:', JSON.stringify(noticeData, null, 2));
                        setNotice(noticeData);
                        setLoading(false);
                    } else {
                        throw new Error(response.data?.message || 'Failed to fetch notice');
                    }
                }
            } catch (err) {
                if (isMountedRef.current) {
                    const errorMessage = err.response
                        ? `Server responded with: ${err.response.status} - ${err.response.data?.message || 'Not Found'}`
                        : err.message || 'Failed to load notice';
                    console.error('Error fetching notice:', err);
                    setError(errorMessage);
                    setLoading(false);
                }
            }
        };

        fetchNotice();

        return () => {
            isMountedRef.current = false;
        };
    }, [id]);

    // Log state changes and render path
    useEffect(() => {
        const title = getPageTitle();
        console.log('Current state:', {
            loading,
            error,
            notice: notice ? JSON.stringify(notice, null, 2) : null,
        });
        console.log('Render path:', loading ? 'loading' : error ? 'error' : !notice || notice.content == null ? 'no-content' : 'content');
        console.log('Computed page title:', title);
        // Fallback title update
        document.title = `${title} | Building Technology & Consultant`;
    }, [loading, error, notice]);

    // Dynamic meta description and title
    const getMetaDescription = () => {
        if (loading) return 'Loading notice details...';
        if (error) return 'An error occurred while fetching the notice.';
        if (!notice || notice.content == null) return 'No content available for this notice.';
        return notice.content.length > 160
            ? `${notice.content.substring(0, 157)}...`
            : notice.content;
    };

    const getPageTitle = () => {
        if (loading) return 'Loading Notice...';
        if (error) return 'Error';
        if (!notice || notice.content == null) return 'No Content Available';
        return `${notice.title || 'Untitled Notice'}`;
    };

    return (
        <div className="container">
            <Helmet key={`${id}-${loading}-${error ? 'error' : 'no-error'}`}>
                <title>{`${getPageTitle()} | Building Technology & Consultant`}</title>
                <meta name="description" content={getMetaDescription()} />
                <meta name="keywords" content={`notice, ${notice?.title || 'untitled'}, Building Technology & Consultant`} />
            </Helmet>
            {loading ? (
                <p>Loading notice...</p>
            ) : error ? (
                <>
                    <h1>Error</h1>
                    <p>{error}</p>
                    <p>Notice ID: {id}</p>
                </>
            ) : !notice || notice.content == null ? (
                <>
                    <h1>No Content Available</h1>
                    <p>This notice has no content to display.</p>
                    <p>Notice ID: {id}</p>
                </>
            ) : (
                <>
                    <h1 className="title">{notice.title || 'Untitled Notice'}</h1>
                    <div className="content">{notice.content}</div>
                </>
            )}
            <style>{`
                .container {
                    max-width: 1220px;
                    margin: 40px auto;
                    padding: 30px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    font-family: Arial, sans-serif;
                }
                .title {
                    font-size: 28px;
                    font-weight: 600;
                    color: #1a0dab;
                    margin-bottom: 1.5rem;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #555;
                    white-space: pre-wrap;
                }
                @media (max-width: 1024px) {
                    .container {
                        max-width: 90%;
                        margin: 20px auto;
                        padding: 20px;
                    }
                    .title {
                        font-size: 24px;
                    }
                    .content {
                        font-size: 14px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ViewNotice;