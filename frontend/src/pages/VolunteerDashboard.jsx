// frontend/src/pages/VolunteerDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, CheckSquare, Target, CalendarDays, Clock, PenLine } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { toast } from 'react-hot-toast';

const VolunteerDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                const token = user?.token || '';
                
                const response = await fetch('http://localhost:5000/api/volunteer/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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
