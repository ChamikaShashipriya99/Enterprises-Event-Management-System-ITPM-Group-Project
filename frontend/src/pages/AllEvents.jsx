import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';
import { 
    Search, 
    Calendar, 
    Users, 
    User, 
    ArrowRight, 
    Filter, 
    Sparkles,
    Trophy,
    Gamepad2,
    Music,
    Terminal,
    MapPin
} from 'lucide-react';

const AllEvents = () => {
    // ... existing state and functions ...
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        Join the <span style={{ color: '#6366f1' }}>Elite</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Discover and participate in premium university events.</p>
                </div>
                
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '14px 20px 14px 50px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            color: 'white',
                            width: '350px',
                            outline: 'none',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#6366f1';
                            e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.target.style.background = 'rgba(255,255,255,0.03)';
                        }}
                    />
                    <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '2.5rem'
            }}>
                {filteredEvents.map((event) => (
                    <div key={event._id} className="glass-card hover-lift" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {event.image ? (
                            <img 
                                src={`http://localhost:5000${event.image}`} 
                                alt={event.title}
                                style={{
                                    width: 'calc(100% + 3rem)',
                                    margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
                                    height: '200px',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 'calc(100% + 3rem)',
                                margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
                                height: '200px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'rgba(99, 102, 241, 0.3)'
                            }}>
                                <Calendar size={64} strokeWidth={1} />
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#6366f1',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}>
                                <Calendar size={12} />
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>
                                <Users size={12} />
                                {event.registeredUsers?.length || 0} / {event.capacity}
                            </div>
                        </div>
                        
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.8rem', fontWeight: '800', color: '#f8fafc', lineHeight: '1.2' }}>{event.title}</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            <MapPin size={14} />
                            {event.location}
                        </div>

                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            marginBottom: '2rem',
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {event.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {event.organizer?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>{event.organizer?.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Organizer</div>
                                </div>
                            </div>
                            <Link to={`/events/${event._id}`} className="btn-primary" style={{ 
                                padding: '10px 18px', 
                                fontSize: '0.85rem', 
                                textDecoration: 'none', 
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                Details <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Search size={40} style={{ color: '#64748b' }} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>No results found</h2>
                    <p style={{ color: '#94a3b8' }}>We couldn't find any events matching "{searchTerm}". Try adjusting your keywords.</p>
                </div>
            )}
        </div>
    );
};

export default AllEvents;
