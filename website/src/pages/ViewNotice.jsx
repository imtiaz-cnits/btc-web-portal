import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/index.js';

const ViewNotice = () => {
    const { id } = useParams();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch notice by ID
    useEffect(() => {
        const fetchNotice = async () => {
            try {
                console.log('Fetching notice with ID:', id);
                const response = await api.get(`/notices/${id}`);
                console.log('API response:', response.data);
                if (response.data.success) {
                    setNotice(response.data.notice || {});
                    setLoading(false);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch notice');
                }
            } catch (err) {
                const errorMessage = err.response
                    ? `Server responded with: ${err.response.status} - ${err.response.data.message || 'Not Found'}`
                    : err.message || 'Failed to load notice';
                setError(errorMessage);
                setLoading(false);
                console.error('Error fetching notice:', err);
            }
        };

        fetchNotice();
    }, [id]);

    if (loading) {
        return (
            <div className="container">
                <p>Loading notice...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <h1>Error</h1>
                <p>{error}</p>
                <p>Notice ID: {id}</p>
            </div>
        );
    }

    if (!notice || !notice.content) {
        return (
            <div className="container">
                <h1>No Content Available</h1>
                <p>This notice has no content to display.</p>
                <p>Notice ID: {id}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="title">{notice.title || 'Untitled Notice'}</h1>
            <div className="content">{notice.content}</div>
            <style>{`
                .container {
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 30px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    font-family: 'Arial', sans-serif;
                }
                .title {
                    font-size: 28px;
                    font-weight: 600;
                    color: #1a0dab;
                    margin-bottom: 1.5rem;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.8;
                    color: #555;
                    white-space: pre-wrap;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 20px;
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