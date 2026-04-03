import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Search, Target, Users, CalendarDays, X, Check } from 'lucide-react';
import Skeleton from '../components/Skeleton';

const AdminVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [assignMessage, setAssignMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const token = user?.token || '';
            
            const [volRes, evtRes] = await Promise.all([
                fetch('http://localhost:5000/api/volunteer/all', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/events', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!volRes.ok) throw new Error('Failed to fetch volunteers');
            setVolunteers(await volRes.json());

            if (evtRes.ok) {
                const eventPayload = await evtRes.json();
                setEvents(eventPayload.data || []);
            }

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

    const openAssignModal = (volunteer) => {
        setSelectedVolunteer(volunteer);
        setSelectedEventId('');
        setAssignMessage('');
        setAssignModalOpen(true);
    };

    const handleEventChange = (e) => {
        const eventId = e.target.value;
        setSelectedEventId(eventId);
        const eventObj = events.find(ev => ev._id === eventId);
        if (eventObj) {
            setAssignMessage(`We would like to assign you to support ${eventObj.title} based on your registered skills and availability.`);
        } else {
            setAssignMessage('');
        }
    };

    const submitAssignment = async () => {
        if (!selectedEventId || !assignMessage) {
            toast.error('Please select an event and provide a message.');
            return;
        }
        
        try {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const token = user?.token || '';
            const res = await fetch('http://localhost:5000/api/volunteer/assign', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    volunteerId: selectedVolunteer.user._id || selectedVolunteer.user,
                    eventId: selectedEventId,
                    message: assignMessage
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send assignment');
            
            toast.success(`Assignment accurately mapped and sent to ${selectedVolunteer.fullName}!`);
            setAssignModalOpen(false);
        } catch (error) {
            toast.error(error.message);
        }
    };

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
                            <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>ASSIGNMENTS</th>
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
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {vol.assignments && vol.assignments.length > 0 ? (
                                                vol.assignments.map(ass => (
                                                    <div key={ass._id} style={{ 
                                                        display: 'flex', 
                                                        flexDirection: 'column', 
                                                        gap: '6px',
                                                        background: 'rgba(255,255,255,0.02)',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        borderLeft: ass.status === 'accepted' ? '3px solid #10b981' : ass.status === 'declined' ? '3px solid #ef4444' : '3px solid #3b82f6',
                                                        padding: '10px 12px',
                                                        borderRadius: '8px',
                                                        minWidth: '150px'
                                                    }}>
                                                        <span style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: '700', lineHeight: '1.3' }}>{ass.event?.title || 'Unknown Event'}</span>
                                                        {ass.status === 'accepted' ? (
                                                            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800' }}><Check size={10} strokeWidth={3} /> ACCEPTED</div>
                                                        ) : ass.status === 'declined' ? (
                                                            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '3px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800' }}><X size={10} strokeWidth={3} /> DECLINED</div>
                                                        ) : (
                                                            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '3px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800' }}> PENDING</div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>No assignments</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <button 
                                                onClick={() => openAssignModal(vol)}
                                                style={{
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
            
            {/* Overlay Modal Logic */}
            <AnimatePresence>
                {assignModalOpen && selectedVolunteer && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(5, 5, 10, 0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                background: '#12141f',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                width: '100%',
                                maxWidth: '500px',
                                padding: '30px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: 'bold' }}>Assign Volunteer</h3>
                                <button 
                                    onClick={() => setAssignModalOpen(false)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: '#64748b' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '25px' }}>
                                Sending assignment to: <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedVolunteer.fullName}</span>
                            </p>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Select Event *</label>
                                <select 
                                    value={selectedEventId}
                                    onChange={handleEventChange}
                                    style={{
                                        width: '100%', padding: '12px 15px', borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: selectedEventId ? 'white' : '#64748b', fontSize: '0.95rem',
                                        outline: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <option value="" disabled style={{ background: '#12141f', color: '#64748b' }}>Choose Event</option>
                                    {events.map(ev => {
                                        const evDate = new Date(ev.date);
                                        const dayName = daysArr[evDate.getDay()];
                                        const dateSt = evDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                        
                                        const now = new Date();
                                        now.setHours(0,0,0,0);
                                        const isPastEvent = evDate < now;
                                        
                                        // Is Volunteer Available precisely on this event day?
                                        const hasAvail = selectedVolunteer.availability && selectedVolunteer.availability[dayName] && Object.values(selectedVolunteer.availability[dayName]).some(slot => slot === true);
                                        
                                        return (
                                            <option key={ev._id} value={ev._id} disabled={isPastEvent} style={{ background: '#12141f', color: isPastEvent ? '#475569' : 'white' }}>
                                                {ev.title} ({dateSt} - {dayName}) {isPastEvent ? '- [Expired]' : (!hasAvail ? '- [Unavailable Day]' : '')}
                                            </option>
                                        );
                                    })}
                                </select>
                                <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '6px', fontStyle: 'italic' }}>
                                    Admins can override availability. Watch for [Unavailable Day] markers.
                                </p>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Personalized Message *</label>
                                <textarea 
                                    value={assignMessage}
                                    onChange={(e) => setAssignMessage(e.target.value)}
                                    rows="4"
                                    style={{
                                        width: '100%', padding: '15px', borderRadius: '8px', 
                                        lineHeight: '1.5',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white', fontSize: '0.95rem',
                                        outline: 'none', resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button 
                                    onClick={() => setAssignModalOpen(false)}
                                    style={{ padding: '10px 20px', borderRadius: '25px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                                    onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitAssignment}
                                    style={{ padding: '10px 20px', borderRadius: '25px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', opacity: (selectedEventId && assignMessage) ? 1 : 0.5 }}
                                    disabled={!selectedEventId || !assignMessage}
                                    onMouseOver={(e) => { if(selectedEventId) e.target.style.background = '#059669' }}
                                    onMouseOut={(e) => { if(selectedEventId) e.target.style.background = '#10b981' }}
                                >
                                    Send Assignment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AdminVolunteers;
