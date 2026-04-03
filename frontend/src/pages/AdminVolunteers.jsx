// frontend/src/pages/AdminVolunteers.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Search, Target, Users, CalendarDays, CheckSquare } from 'lucide-react';
import Skeleton from '../components/Skeleton';

const AdminVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const fetchVolunteers = async () => {
        try {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const token = user?.token || '';
            
            const response = await fetch('http://localhost:5000/api/volunteer/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch volunteers');
            }

            const data = await response.json();
            setVolunteers(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Insights
    const totalVolunteers = volunteers.length;
    
    // Day of week calculation
    const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = daysArr[new Date().getDay()];
    
    const availableTodayCount = volunteers.filter(vol => {
        const slotsForToday = vol.availability?.[todayName];
        return slotsForToday && Object.values(slotsForToday).some(isActive => isActive === true);
    }).length;

    // Unique Skills
    const uniqueSkills = new Set();
    volunteers.forEach(v => {
        v.skills?.forEach(skill => uniqueSkills.add(skill));
    });

    const filteredVolunteers = volunteers.filter(v => {
        const search = searchTerm.toLowerCase();
        const inSkills = (v.skills || []).some(skill => skill.toLowerCase().includes(search));
        const inName = (v.fullName || '').toLowerCase().includes(search);
        return inSkills || inName;
    });

    if (loading) {
        return (
            <div style={{ padding: '40px' }}>
                <Skeleton height="150px" style={{ borderRadius: '16px', marginBottom: '20px' }} />
                <Skeleton height="600px" style={{ borderRadius: '16px' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>
            
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Dashboard <span style={{ color: '#f43f5e' }}>Overview</span>
                </h1>
                <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Real-time volunteer statistics</p>
            </div>

            {/* Dashboard Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}
                >
                    <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '15px', borderRadius: '12px' }}>
                        <Users size={28} color="#ec4899" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{totalVolunteers}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Volunteers</div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}
                >
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '15px', borderRadius: '12px' }}>
                        <CalendarDays size={28} color="#f59e0b" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{availableTodayCount}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Volunteers Available Today</div>
                        <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px' }}>Today is {todayName}</div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}
                >
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '12px' }}>
                        <Target size={28} color="#2dd4bf" />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{uniqueSkills.size}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Skills Covered</div>
                    </div>
                </motion.div>
            </div>

            {/* Management Section */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Volunteer <span style={{ color: '#f43f5e' }}>Management</span>
                </h2>
                <p style={{ color: '#64748b', margin: '5px 0 20px 0', fontSize: '0.95rem' }}>View all volunteers — filter by skill using the search bar</p>
                
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '8px', maxWidth: '400px' }}>
                    <Search size={18} color="#94a3b8" style={{ marginRight: '10px' }} />
                    <input 
                        type="text" 
                        placeholder="Filter volunteers by skill..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Main Table */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>#</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>NAME</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>EMAIL</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>PHONE</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>SKILLS</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>AVAILABLE DAYS</th>
                            <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVolunteers.length > 0 ? filteredVolunteers.map((vol, index) => {
                            // Extract available days for user
                            const availableDays = Object.keys(vol.availability || {}).filter(day => {
                                return Object.values(vol.availability[day]).some(slot => slot === true);
                            });

                            return (
                                <tr key={vol._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '20px', color: '#94a3b8' }}>{index + 1}</td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ 
                                                width: '32px', 
                                                height: '32px', 
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #f43f5e, #f59e0b)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}>
                                                {vol.fullName ? vol.fullName.charAt(0).toUpperCase() : 'V'}
                                            </div>
                                            <span style={{ color: 'white', fontWeight: '600' }}>{vol.fullName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>{vol.email}</td>
                                    <td style={{ padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>{vol.phone}</td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {(vol.skills || []).map(skill => (
                                                <span key={skill} style={{
                                                    background: 'rgba(236, 72, 153, 0.1)',
                                                    border: '1px solid rgba(236, 72, 153, 0.2)',
                                                    color: '#f472b6',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        {availableDays.length > 0 ? availableDays.join(', ') : 'None'}
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <button style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                                color: '#34d399',
                                                padding: '6px 14px',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                                            >
                                                <div style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%' }}></div> Assign
                                            </button>
                                            <div style={{ display: 'flex', gap: '4px', opacity: 0.5 }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No volunteers found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
};

export default AdminVolunteers;
