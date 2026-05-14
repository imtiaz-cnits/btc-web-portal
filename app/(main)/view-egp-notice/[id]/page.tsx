"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Notice {
    title: string;
    content: string;
}

const ViewEgpNoticePage: React.FC = () => {
    const { id } = useParams();
    const [notice, setNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Mock fetching (Will be replaced by real API/TinaCMS later)
        const fetchNotice = async () => {
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                setNotice({
                    title: "Sample EGP Notice Title",
                    content: "This is a sample content for the EGP notice. In a real application, this would be fetched from the database using the ID provided in the URL."
                });
                setLoading(false);
            } catch (err) {
                setError("Failed to load notice");
                setLoading(false);
            }
        };

        fetchNotice();
    }, [id]);

    return (
        <div className="view_notice_container">
            {loading ? (
                <p>Loading notice...</p>
            ) : error ? (
                <>
                    <h1 className="title error-title">Error</h1>
                    <p>{error}</p>
                    <p>Content ID: {id}</p>
                </>
            ) : !notice || notice.content == null ? (
                <>
                    <h1 className="title no-content-title">No Content Available</h1>
                    <p>This notice has no content to display.</p>
                    <p>Content ID: {id}</p>
                </>
            ) : (
                <>
                    <h1 className="title egp-title">{notice.title || 'Untitled Notice'}</h1>
                    <div className="content">{notice.content}</div>
                </>
            )}

            <style jsx>{`
                .view_notice_container {
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
                .egp-title {
                    color: #5AA469; /* Green for EGP notices */
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
                    .view_notice_container {
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

export default ViewEgpNoticePage;
