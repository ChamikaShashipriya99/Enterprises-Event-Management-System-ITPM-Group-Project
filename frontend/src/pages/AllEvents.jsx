import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';
import EventCountdown from '../components/EventCountdown';
import './AllEvents.css';
import { 
    Search, 
    Calendar, 
    Users, 
    ArrowRight, 
    MapPin,
    Sparkles,
    ShieldCheck,
    History,
} from 'lucide-react';

const AllEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date-only comparison

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
        <div className="events-container">
            <div className="events-header">
                <Skeleton variant="title" width="300px" />
                <Skeleton width="300px" height="45px" style={{ borderRadius: '30px' }} />
            </div>

            <div className="events-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="event-card" style={{ padding: '0' }}>
                        <Skeleton width="100%" height="220px" />
                        <div style={{ padding: '2rem' }}>
                            <Skeleton width="80px" height="24px" style={{ borderRadius: '20px', marginBottom: '1rem' }} />
                            <Skeleton variant="title" width="80%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="90%" />
                            <Skeleton variant="text" width="60%" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="events-container">
            <header className="events-header">
                <div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                        Join the <span style={{ color: '#6366f1' }}>Elite</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: '500' }}>Discover and participate in premium university events.</p>
                </div>
                
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '16px 24px 16px 56px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            color: 'white',
                            width: '400px',
                            outline: 'none',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                        }}
                    />
                    <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
            </header>

            <div className="events-grid">
                {filteredEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const isPassed = eventDate < today;
                    const isFull = event.registeredUsers?.length >= event.capacity;
                    
                    const storedUser = localStorage.getItem('user');
                    const currentUser = storedUser ? JSON.parse(storedUser) : null;
                    const userId = currentUser?._id || currentUser?.id;
                    const isUserRegistered = event.registeredUsers?.some(u => 
                        (typeof u === 'string' ? u === userId : u._id === userId)
                    );

                    const showOverlay = isPassed || (isFull && !isUserRegistered);

                    return (
                        <div key={event._id} className={`event-card ${showOverlay ? 'is-passed' : ''}`}>
                            {showOverlay && (
                                <div className="passed-overlay">
                                    <div className="passed-content">
                                        {isPassed ? (
                                            <>
                                                <History size={40} className="passed-icon" />
                                                <h3 className="passed-title">Event Passed</h3>
                                                <p className="passed-quote">"The curtain has closed on this performance."</p>
                                            </>
                                        ) : (
                                            <>
                                                <Users size={40} className="passed-icon" style={{ color: '#10b981' }} />
                                                <h3 className="passed-title">House Full</h3>
                                                <p className="passed-quote">"The house is packed! All spots have been secured."</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="card-image-wrapper">
                                <div className="badge-container">
                                    <div className="floating-badge badge-date">
                                        <Calendar size={14} />
                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="floating-badge badge-capacity">
                                        <Users size={14} />
                                        {event.registeredUsers?.length || 0} / {event.capacity}
                                    </div>
                                </div>
                                
                                {!isPassed && (
                                    <div className="countdown-wrapper" style={{ 
                                        position: 'absolute', 
                                        bottom: '15px', 
                                        right: '15px', 
                                        zIndex: 50,
                                        pointerEvents: 'none'
                                    }}>
                                        <EventCountdown targetDate={event.date} compact={false} />
                                    </div>
                                )}
                                
                                {event.image ? (
                                    <img 
                                        src={`http://localhost:5000${event.image}`} 
                                        className="card-image"
                                        alt={event.title}
                                    />
                                ) : (
                                    <div className="card-image" style={{ 
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'rgba(99, 102, 241, 0.3)'
                                    }}>
                                        <Sparkles size={64} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="card-overlay-gradient"></div>
                            </div>

                            <div className="card-body">
                                <h3 className="card-title">{event.title}</h3>
                                <div className="card-meta">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} style={{ color: '#6366f1' }} />
                                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '1rem' }}>
                                        <MapPin size={14} style={{ color: '#10b981' }} />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                                <p className="card-description">
                                    {event.description}
                                </p>
                            </div>

                            <footer className="card-footer">
                                <div className="organizer-info">
                                    <div className="organizer-avatar">
                                        {event.organizer?.profilePicture ? (
                                            <img 
                                                src={event.organizer.profilePicture.startsWith('http') ? event.organizer.profilePicture : `http://localhost:5000${event.organizer.profilePicture}`} 
                                                alt={event.organizer.name}
                                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            event.organizer?.name?.charAt(0)
                                        )}
                                    </div>
                                    <div className="organizer-details">
                                        <div className="name">{event.organizer?.name}</div>
                                        <div className="role">Host <ShieldCheck size={10} style={{ display: 'inline', marginLeft: '2px' }} /></div>
                                    </div>
                                </div>
                                <Link to={`/events/${event._id}`} className={`details-btn ${(isPassed || isFull) ? 'btn-ghost' : ''}`}>
                                    {isPassed ? 'View Archive' : (isFull ? 'View Details' : 'View')} <ArrowRight size={16} />
                                </Link>
                            </footer>
                        </div>
                    );
                })}
            </div>

            {filteredEvents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Search size={48} style={{ color: '#64748b' }} />
                    </div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', marginBottom: '1rem' }}>No results found</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>We couldn't find any events matching "{searchTerm}". Try adjusting your keywords.</p>
                </div>
            )}
        </div>
    );
};

export default AllEvents;
