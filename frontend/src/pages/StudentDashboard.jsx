// frontend/src/pages/StudentDashboard.jsx
// UPDATED: Replaces registered events section with booking engine data.
// Adds: booking count stats, My Bookings link, certificate download.

import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import bookingService from '../services/bookingService';

const StudentDashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await bookingService.getMyBookings();
                setBookings(res.data || []);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchData();
    }, [currentUser]);

    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const attended = bookings.filter(b => b.status === 'attended');
    const certs = attended.filter(b => b.certificateGenerated);
    const upcoming = confirmed.filter(b => new Date(b.event?.date) > new Date());

    const handleDownloadCert = async (b) => {
        try {
            const res = await bookingService.generateCertificate(b.bookingId, false);
            const blob = await bookingService.downloadCertificate(res.data.certificateId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate_${res.data.certificateId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.response?.data?.message || 'Download failed');
        }
    };

    if (loading) return (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            Loading dashboard...
        </div>
    );

    return (
        <div style={{ padding: '40px 5%' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' }}>
                    Student <span style={{ color: '#6366f1' }}>Dashboard</span>
                </h1>
                <p style={{ color: '#94a3b8' }}>
                    Welcome back, {currentUser?.name}. Track your events and certificates.
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                gap: '1.25rem', marginBottom: '2.5rem'
            }}>
                {[
                    { label: 'Total Bookings', value: bookings.length, icon: '📋', color: '#6366f1' },
                    { label: 'Upcoming', value: upcoming.length, icon: '🚀', color: '#818cf8' },
                    { label: 'Events Attended', value: attended.length, icon: '✅', color: '#34d399' },
                    { label: 'Certificates', value: certs.length, icon: '🎓', color: '#fbbf24' },
                ].map(stat => (
                    <div key={stat.label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.9rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.75rem' }}>

                {/* Upcoming Bookings */}
                <section className="glass-card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#6366f1' }}>📅</span> Upcoming Events
                        </h2>
                        <Link to="/my-bookings" style={{ fontSize: '0.82rem', color: '#6366f1', fontWeight: '600' }}>
                            View All →
                        </Link>
                    </div>

                    {upcoming.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcoming.slice(0, 4).map(b => (
                                <Link key={b._id} to={`/bookings/${b.bookingId}`} style={{
                                    padding: '12px 14px', background: 'rgba(255,255,255,0.04)',
                                    borderRadius: '9px', borderLeft: '3px solid #6366f1',
                                    textDecoration: 'none', color: 'white', display: 'block',
                                    transition: 'transform 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '3px' }}>
                                        {b.event?.title}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                        📍 {b.event?.location} &nbsp;·&nbsp; 📅 {new Date(b.event?.date).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                                        {b.bookingId}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                No upcoming bookings yet.
                            </p>
                            <Link to="/events" className="btn-primary" style={{
                                padding: '9px 20px', textDecoration: 'none', fontSize: '0.85rem'
                            }}>
                                Browse Events
                            </Link>
                        </div>
                    )}
                </section>

                {/* Certificates */}
                <section className="glass-card" style={{ padding: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#fbbf24' }}>🎓</span> My Certificates
                    </h2>

                    {attended.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {attended.slice(0, 4).map(b => (
                                <div key={b._id} style={{
                                    padding: '12px 14px', background: 'rgba(255,255,255,0.04)',
                                    borderRadius: '9px', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#f1f5f9' }}>
                                            {b.event?.title}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                            {new Date(b.event?.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownloadCert(b)}
                                        style={{
                                            padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600',
                                            background: 'rgba(16,185,129,0.1)', color: '#34d399',
                                            border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        📄 Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Attend events to earn certificates. They'll appear here.
                        </p>
                    )}
                </section>

                {/* Quick Actions */}
                <section className="glass-card" style={{ padding: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#a855f7' }}>⚡</span> Quick Actions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { label: '🔍 Browse Events', to: '/events', color: '#6366f1' },
                            { label: '📋 All My Bookings', to: '/my-bookings', color: '#818cf8' },
                            { label: '👤 Edit Profile', to: '/edit-profile', color: '#a855f7' },
                        ].map(item => (
                            <Link key={item.to} to={item.to} style={{
                                padding: '11px 16px', borderRadius: '9px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                color: item.color, fontWeight: '600', fontSize: '0.9rem',
                                textDecoration: 'none', display: 'block',
                                transition: 'background 0.2s, transform 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StudentDashboard;
