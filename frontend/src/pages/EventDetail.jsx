import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import { AuthContext } from '../context/AuthContext';

const EventDetail = () => {
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

    if (loading) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading event details...</div>;
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
                    fontWeight: '600'
                }}
            >
                ← Back to Events
            </button>

            <div className="glass-card" style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <span style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            padding: '6px 16px',
                            borderRadius: '30px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            display: 'inline-block'
                        }}>
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.1' }}>{event.title}</h1>
                    </div>

                    <button
                        onClick={handleRegister}
                        disabled={registering || (isFull && !isRegistered)}
                        className={isRegistered ? "btn-secondary" : "btn-primary"}
                        style={{
                            padding: '12px 30px',
                            fontSize: '1.1rem',
                            background: isRegistered ? 'rgba(239, 68, 68, 0.1)' : undefined,
                            color: isRegistered ? '#ef4444' : undefined,
                            border: isRegistered ? '1px solid #ef4444' : undefined,
                            opacity: (isFull && !isRegistered) ? 0.5 : 1
                        }}
                    >
                        {registering ? 'Processing...' : isRegistered ? 'Cancel Registration' : isFull ? 'Event Full' : 'Register Now'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>LOCATION</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>📍 {event.location}</div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>CAPACITY</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>👥 {event.registeredUsers?.length || 0} / {event.capacity} Attendees</div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>ORGANIZER</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {event.organizer?.name?.charAt(0)}
                            </div>
                            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{event.organizer?.name}</span>
                        </div>
                    </div>
                </div>

                <div style={{ lineHeight: '1.8', color: '#cbd5e1', fontSize: '1.1rem' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>About this event</h3>
                    {event.description}
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
