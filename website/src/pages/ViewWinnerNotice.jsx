import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../../api/index.js';

const ViewWinnerNotice = () => {
    const { id } = useParams();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const fetchContent = async () => {
            try {
                console.log('Fetching winner with ID:', id);
                const response = await api.get(`/winner-list/${id}`);
                console.log('Winner API response:', JSON.stringify(response.data, null, 2));
                if (isMountedRef.current && response.data?.success) {
                    const winnerData = response.data.notice || {};
                    console.log('Setting winner:', JSON.stringify(winnerData, null, 2));
                    setNotice(winnerData);
                    setLoading(false);
                } else {
                    throw new Error(response.data?.message || 'Winner not found');
                }
            } catch (err) {
                if (isMountedRef.current) {
                    const errorMessage = err.response
                        ? `Server responded with: ${err.response.status} - ${err.response.data?.message || 'Not Found'}`
                        : err.message || 'Failed to load winner';
                    console.error('Error fetching winner:', err);
                    setError(errorMessage);
                    setLoading(false);
                }
            }
        };

        fetchContent();

        return () => {
            isMountedRef.current = false;
        };
    }, [id]);

    useEffect(() => {
        const title = getPageTitle();
        console.log('Current state:', {
            loading,
            error,
            notice: notice ? JSON.stringify(notice, null, 2) : null,
        });
        console.log('Render path:', loading ? 'loading' : error ? 'error' : !notice || notice.content == null ? 'no-content' : 'content');
        console.log('Computed page title:', title);
        document.title = `${title} | Building Technology & Consultant`;
    }, [loading, error, notice]);

    const getMetaDescription = () => {
        if (loading) return 'Loading winner details...';
        if (error) return 'An error occurred while fetching the winner.';
        if (!notice || notice.content == null) return 'No content available for this winner.';
        return notice.content.length > 160
            ? `${notice.content.substring(0, 157)}...`
            : notice.content;
    };

    const getPageTitle = () => {
        if (loading) return 'Loading Winner...';
        if (error) return 'Error';
        if (!notice || notice.content == null) return 'No Content Available';
        return `${notice.title || 'Untitled Winner'} - Winner Details`;
    };

    return (
        <div className="container">
            <Helmet key={`${id}-${loading}-${error ? 'error' : 'no-error'}`}>
                <title>{`${getPageTitle()} | Building Technology & Consultant`}</title>
                <meta name="description" content={getMetaDescription()} />
                <meta name="keywords" content={`winner list, ${notice?.title || 'untitled'}, Building Technology & Consultant`} />
            </Helmet>
            {loading ? (
                <p>Loading winner...</p>
            ) : error ? (
                <>
                    <h1 className="title error-title">Error</h1>
                    <p>{error}</p>
                    <p>Content ID: {id}</p>
                </>
            ) : !notice || notice.content == null ? (
                <>
                    <h1 className="title no-content-title">No Content Available</h1>
                    <p>This winner has no content to display.</p>
                    <p>Content ID: {id}</p>
                </>
            ) : (
                <>
                    <h1 className="title winner-title">{notice.title || 'Untitled Winner'}</h1>
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
                    margin-bottom: 1.5rem;
                }
                .winner-title {
                    color: #2e7d32; /* Green for winners */
                }
                .error-title {
                    color: #d32f2f; /* Red for errors */
                }
                .no-content-title {
                    color: #555; /* Gray for no content */
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

export default ViewWinnerNotice;