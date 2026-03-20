import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';

const AllEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await eventService.getAllEvents();
                setEvents(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <Skeleton variant="title" width="300px" />
                <Skeleton width="300px" height="45px" style={{ borderRadius: '30px' }} />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2rem'
            }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <Skeleton width="80px" height="24px" style={{ borderRadius: '20px' }} />
                            <Skeleton width="100px" height="16px" />
                        </div>
                        <Skeleton variant="title" width="80%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="90%" />
                        <Skeleton variant="text" width="60%" style={{ marginBottom: '1.5rem' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Skeleton variant="circle" width="32px" height="32px" />
                                <Skeleton width="80px" height="16px" />
                            </div>
                            <Skeleton width="100px" height="36px" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Explore <span style={{ color: '#6366f1' }}>Events</span></h1>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '12px 20px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '30px',
                        color: 'white',
                        width: '300px',
                        outline: 'none',
                        transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2rem'
            }}>
                {filteredEvents.map((event) => (
                    <div key={event._id} className="glass-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s ease',
                        height: '100%',
                        position: 'relative'
                    }}>
                        {event.image ? (
                            <img 
                                src={`http://localhost:5000${event.image}`} 
                                alt={event.title}
                                style={{
                                    width: 'calc(100% + 3rem)',
                                    margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderTopLeftRadius: 'inherit',
                                    borderTopRightRadius: 'inherit'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 'calc(100% + 3rem)',
                                margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
                                height: '180px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                                borderTopLeftRadius: 'inherit',
                                borderTopRightRadius: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem'
                            }}>
                                📅
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#6366f1',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                {event.registeredUsers?.length || 0} / {event.capacity} Joined
                            </span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '700' }}>{event.title}</h3>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            marginBottom: '1.5rem',
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {event.description}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {event.organizer?.name?.charAt(0)}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{event.organizer?.name}</span>
                            </div>
                            <Link to={`/events/${event._id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <p>No events found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default AllEvents;
