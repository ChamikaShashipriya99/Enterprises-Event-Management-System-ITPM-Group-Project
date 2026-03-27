import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';
import { 
    Calendar, 
    MapPin, 
    Users, 
    User, 
    ArrowLeft, 
    CheckCircle, 
    Info, 
    Clock, 
    ChevronRight,
    Trophy,
    Sparkles
} from 'lucide-react';

const EventDetail = () => {
    // ... existing state and functions ...
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await eventService.getEventById(id);
                setEvent(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching event details:', error);
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const isRegistered = event?.registeredUsers?.includes(currentUser?._id);
    const isFull = event?.registeredUsers?.length >= event?.capacity;

    const handleRegister = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setRegistering(true);
        try {
            if (isRegistered) {
                await eventService.unregisterFromEvent(id);
                alert('Successfully unregistered from event');
            } else {
                await eventService.registerForEvent(id);
                alert('Successfully registered for event!');
            }
            // Refresh event data
            const response = await eventService.getEventById(id);
            setEvent(response.data);
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
            <Skeleton width="150px" height="24px" style={{ marginBottom: '2rem' }} />

            <div className="glass-card" style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <Skeleton width="200px" height="30px" style={{ borderRadius: '30px', marginBottom: '1rem' }} />
                        <Skeleton variant="title" width="80%" height="3.5rem" />
                    </div>
                    <Skeleton width="180px" height="50px" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i}>
                            <Skeleton width="100px" height="16px" style={{ marginBottom: '0.5rem' }} />
                            <Skeleton width="150px" height="24px" />
                        </div>
                    ))}
                </div>

                <div>
                    <Skeleton variant="title" width="200px" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="60%" />
                </div>
            </div>
        </div>
    );
    if (!event) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Event not found</div>;

    return (
        <div style={{ padding: '2rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'transform 0.2s'
                }}
                className="hover-shrink"
            >
                <ArrowLeft size={18} /> Back to Events
            </button>

            <div className="glass-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ flex: '1 1 500px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            padding: '6px 16px',
                            borderRadius: '30px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            marginBottom: '1.2rem',
                            width: 'fit-content'
                        }}>
                            <Calendar size={14} />
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-0.02em', color: '#f8fafc' }}>{event.title}</h1>
                    </div>

                    <button
                        onClick={handleRegister}
                        disabled={registering || (isFull && !isRegistered)}
                        className={isRegistered ? "btn-secondary" : "btn-primary"}
                        style={{
                            padding: '14px 34px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: isRegistered ? 'rgba(239, 68, 68, 0.1)' : undefined,
                            color: isRegistered ? '#ef4444' : undefined,
                            border: isRegistered ? '2px solid rgba(239, 68, 68, 0.2)' : undefined,
                            opacity: (isFull && !isRegistered) ? 0.5 : 1,
                            boxShadow: !isRegistered && !isFull ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none'
                        }}
                    >
                        {registering ? (
                            <Clock size={20} className="spin" />
                        ) : isRegistered ? (
                            <ArrowLeft size={20} />
                        ) : isFull ? (
                            <ShieldAlert size={20} />
                        ) : (
                            <CheckCircle size={20} />
                        )}
                        {registering ? 'Processing...' : isRegistered ? 'Cancel Registration' : isFull ? 'Event Full' : 'Secure Your Spot'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', padding: '2.5rem 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} style={{ color: '#6366f1' }} /> Location
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#f1f5f9' }}>{event.location}</div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={14} style={{ color: '#10b981' }} /> Availability
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#f1f5f9' }}>{event.registeredUsers?.length || 0} / {event.capacity} <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'normal' }}>Slots Taken</span></div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Trophy size={14} style={{ color: '#f59e0b' }} /> Organized by
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {event.organizer?.name?.charAt(0)}
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>{event.organizer?.name}</span>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <Info size={20} />
                        </div>
                        <h3 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>Event Overview</h3>
                    </div>
                    <div style={{ lineHeight: '1.8', color: '#94a3b8', fontSize: '1.15rem', whiteSpace: 'pre-wrap' }}>
                        {event.description}
                    </div>
                    
                    <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>This event is listed as part of the Enterprise Premier Series.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
