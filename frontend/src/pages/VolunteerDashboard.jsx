// frontend/src/pages/VolunteerDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, CheckSquare, Target, CalendarDays, Clock, PenLine, Bell, Check, X as XIcon } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { toast } from 'react-hot-toast';

const VolunteerDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                const token = user?.token || '';
                
                const response = await fetch('http://localhost:5000/api/volunteer/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const assignRes = await fetch('http://localhost:5000/api/volunteer/assignments/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error("No volunteer registration found. Please register first.");
                        navigate('/volunteer-register');
                        return;
                    }
                    throw new Error('Failed to fetch volunteer data');
                }

                const volunteerData = await response.json();
                setData(volunteerData);

                if (assignRes.ok) {
                    setAssignments(await assignRes.json());
                }
            } catch (error) {
                toast.error("Error loading dashboard.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (loading) {
        return (
            <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
                <Skeleton height="200px" style={{ borderRadius: '16px', marginBottom: '20px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <Skeleton height="150px" style={{ borderRadius: '16px' }} />
                    <Skeleton height="150px" style={{ borderRadius: '16px' }} />
                </div>
                <Skeleton height="300px" style={{ borderRadius: '16px' }} />
            </div>
        );
    }

    if (!data) return null;

    // Helper functions for deriving insights
    const activeDays = Object.keys(data.availability).filter(day => {
        return Object.values(data.availability[day]).some(slot => slot === true);
    });

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'V';

    const handleAssignmentStatus = async (id, status) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch(`http://localhost:5000/api/volunteer/assignments/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setAssignments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
                toast.success(`Assignment ${status}`);
            }
        } catch(error) {
            toast.error('Error updating assignment');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch(`http://localhost:5000/api/volunteer/assignments/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (res.ok) {
                setAssignments(prev => prev.map(a => ({ ...a, isRead: true })));
                toast.success('All assignments marked as read');
            }
        } catch(error) {
            toast.error('Error marking as read');
        }
    };

    return (
        <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Top Profile Card */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ 
                    background: 'linear-gradient(145deg, rgba(30, 27, 38, 0.9) 0%, rgba(18, 16, 23, 0.95) 100%)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '30px',
                    marginBottom: '30px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                    {/* Avatar Gradient Circle */}
                    <div style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f43f5e, #f59e0b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: 'white',
                        boxShadow: '0 0 40px rgba(244, 63, 94, 0.3)'
                    }}>
                        {getInitial(data.fullName)}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0 }}>
                            {data.fullName}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '1rem' }}>
                            <Mail size={16} /> {data.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '1rem', marginBottom: '8px' }}>
                            <Phone size={16} color="#db2777" /> {data.phone}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '6px 14px', 
                                background: 'rgba(16, 185, 129, 0.1)', 
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '20px',
                                color: '#34d399',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}>
                                <CheckSquare size={14} fill="#10b981" color="white" /> Active Volunteer
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <button 
                        onClick={() => navigate('/volunteer-register')} // Wait, maybe navigate to edit profile endpoint, user requested update my profile
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <PenLine size={16} /> Update my profile
                    </button>
                </div>
            </motion.section>

            {/* Event Assignments Row */}
            {assignments.length > 0 && (
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    style={{ 
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '30px',
                        marginBottom: '30px'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bell size={22} color="#fbbf24" fill="#fbbf24" /> Event Assignments
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Notifications from the Event Admins</p>
                        </div>
                        <button 
                            onClick={handleMarkAllRead}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px', 
                                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                                color: '#34d399', padding: '8px 16px', borderRadius: '20px', 
                                fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                        >
                            <Check size={16} /> Mark all as read
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {assignments.map(ass => {
                            const dateSt = new Date(ass.event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const createdTime = new Date(ass.createdAt).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

                            let badge = null;
                            if (ass.status === 'accepted') {
                                badge = <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}><Check size={12} /> ACCEPTED</div>;
                            } else if (ass.status === 'declined') {
                                badge = <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}><XIcon size={12} /> DECLINED</div>;
                            }

                            return (
                                <div key={ass._id} style={{ 
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', 
                                    borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative',
                                    borderLeft: !ass.isRead ? '3px solid #6366f1' : '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white' }}>{ass.event?.title || 'Unknown Event'}</span>
                                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>({dateSt})</span>
                                            {badge}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{createdTime}</div>
                                    </div>
                                    <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {ass.message}
                                    </div>

                                    {ass.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            <button 
                                                onClick={() => handleAssignmentStatus(ass._id, 'accepted')}
                                                style={{ padding: '8px 20px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                                onMouseOver={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.2)'}
                                                onMouseOut={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.1)'}
                                            >Accept</button>
                                            <button 
                                                onClick={() => handleAssignmentStatus(ass._id, 'declined')}
                                                style={{ padding: '8px 20px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                            >Decline</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.section>
            )}

            {/* Middle Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* My Skills Card */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ 
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '30px'
                     }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Target size={24} color="#ec4899" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', margin: 0 }}>My Skills</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{data.skills.length} skills registered</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {data.skills.map(skill => (
                            <span key={skill} style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                color: '#a5b4fc',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </motion.section>

                {/* Available Days Card */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ 
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '30px'
                     }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarDays size={24} color="#38bdf8" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', margin: 0 }}>Available Days</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{activeDays.length} day{activeDays.length !== 1 ? 's' : ''} selected</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {activeDays.map(day => (
                            <span key={day} style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                color: '#34d399',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}>
                                {day}
                            </span>
                        ))}
                    </div>
                </motion.section>
            </div>

            {/* Bottom Availability Matrix */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                 }}
            >
                <div style={{ padding: '25px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Clock size={20} color="#94a3b8" />
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', margin: 0 }}>Detailed Availability Schedule</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, marginTop: '2px' }}>Time slots you selected when registering</p>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '15px 30px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', width: '25%' }}>Day</th>
                            <th style={{ padding: '15px 30px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Available Time Slots</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeDays.length > 0 ? activeDays.map(day => (
                            <tr key={day} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px 30px', color: 'white', fontWeight: '700' }}>{day}</td>
                                <td style={{ padding: '20px 30px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {Object.entries(data.availability[day]).map(([slot, isActive]) => {
                                            if (isActive) {
                                                return (
                                                    <span key={slot} style={{
                                                        background: 'rgba(20, 184, 166, 0.1)',
                                                        border: '1px solid rgba(20, 184, 166, 0.2)',
                                                        color: '#2dd4bf',
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {slot}
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="2" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No schedule details available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.section>

        </div>
    );
};

export default VolunteerDashboard;
