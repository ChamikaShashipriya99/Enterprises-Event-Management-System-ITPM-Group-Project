import { useState, useEffect } from 'react';
import axios from 'axios';
import CertificateCard from '../components/CertificateCard';
import EmptyState from '../components/EmptyState';
import SearchFilter from '../components/SearchFilter';
import SummaryCard from '../components/SummaryCard';
const StudentCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState({});
    const [emailing, setEmailing] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);
    const [filterMonth, setFilterMonth] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/certificates/student', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setCertificates(response.data.data || []);
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.message ||
                'Failed to load certificates';
            setError(errorMsg);
            console.error('Fetch certificates error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async (certificateId) => {
        setDownloading((prev) => ({ ...prev, [certificateId]: true }));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `/api/certificates/${certificateId}/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob',
                }
            );

            // Create blob link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `certificate_${certificateId}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.parentChild.removeChild(link);

            setSuccessMessage('Certificate downloaded successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                'Failed to download certificate';
            alert(errorMsg);
            console.error('Download certificate error:', err);
        } finally {
            setDownloading((prev) => ({
                ...prev,
                [certificateId]: false,
            }));
        }
    };

    const handleSendEmail = async (certificateId) => {
        setEmailing((prev) => ({ ...prev, [certificateId]: true }));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/certificates/${certificateId}/send-email`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSuccessMessage('Certificate sent to your email!');
                setTimeout(() => setSuccessMessage(null), 3000);

                // Update certificate record
                setCertificates((prev) =>
                    prev.map((cert) =>
                        cert._id === certificateId
                            ? { ...cert, emailSent: true }
                            : cert
                    )
                );
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                'Failed to send certificate email';
            alert(errorMsg);
            console.error('Send email error:', err);
        } finally {
            setEmailing((prev) => ({ ...prev, [certificateId]: false }));
        }
    };

    const filterCertificates = () => {
        if (filterMonth === 'all') return certificates;

        const now = new Date();
        const currentYear = now.getFullYear();

        if (filterMonth === 'recent') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return certificates.filter(
                (cert) => new Date(cert.issuedAt) >= threeMonthsAgo
            );
        }

        const monthNum = parseInt(filterMonth);
        return certificates.filter((cert) => {
            const certDate = new Date(cert.issuedAt);
            return (
                certDate.getFullYear() === currentYear &&
                certDate.getMonth() === monthNum
            );
        });
    };

    // Loading state
    if (loading) {
        return (
            <div style={{ padding: '2rem 5%', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading your certificates...</p>
            </div>
        );
    }

    const filtered = filterCertificates();
    const searched = filtered.filter(cert =>
        !searchTerm || cert.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem 5%' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    My <span style={{ color: '#6366f1' }}>Certificates</span>
                </h1>
                <p style={{ color: '#94a3b8' }}>Certificates from events you've attended.</p>
            </div>

            {/* Error & Success Messages */}
            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#f87171' }}>
                    ❌ {error}
                </div>
            )}
            {successMessage && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#34d399' }}>
                    ✅ {successMessage}
                </div>
            )}

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <SummaryCard icon="🎓" label="Total Certificates" value={certificates.length} color="#6366f1" />
                <SummaryCard icon="📧" label="Emails Sent" value={certificates.filter((c) => c.emailSent).length} color="#818cf8" />
                <SummaryCard icon="📥" label="Ready to Download" value={certificates.length} color="#34d399" />
            </div>

            {/* Search & Filter */}
            <SearchFilter
                onSearch={setSearchTerm}
                placeholder="Search certificates by event name..."
                onFilterChange={(status) => setFilterMonth(status)}
                filterOptions={{
                    label: 'periods',
                    options: [
                        { value: 'recent', label: 'Last 3 Months' },
                        { value: '0', label: 'January' },
                        { value: '1', label: 'February' },
                        { value: '2', label: 'March' },
                    ]
                }}
            />

            {/* Certificates Grid */}
            {searched.length === 0 ? (
                <EmptyState
                    icon="📜"
                    title={certificates.length === 0 ? "No Certificates Yet" : "No Results"}
                    description={certificates.length === 0 ? "Attend an event and check in to earn your first certificate." : "Try adjusting your search or filter."}
                    actionLabel={certificates.length === 0 ? "Browse Events" : undefined}
                    onAction={certificates.length === 0 ? () => window.location.href = '/events' : undefined}
                />
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {searched.map((certificate) => (
                        <CertificateCard
                            key={certificate._id}
                            certificate={certificate}
                            onDownload={handleDownloadCertificate}
                            onEmail={handleSendEmail}
                            downloading={downloading[certificate._id]}
                            emailing={emailing[certificate._id]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentCertificates;
