import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';
import './EventDetail.css';
import { 
    Calendar, 
    MapPin, 
    Users, 
    ArrowLeft, 
    CheckCircle, 
    Info, 
    Clock, 
    Trophy,
    Sparkles,
    ShieldAlert,
    ExternalLink,
    Map,
    Share2,
    CalendarPlus,
    History
} from 'lucide-react';

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
    const eventDate = event ? new Date(event.date) : null;
    const isPassed = eventDate ? eventDate < new Date().setHours(0,0,0,0) : false;
    const isFull = event?.registeredUsers?.length >= event?.capacity;
    const capacityPercentage = event ? Math.min((event.registeredUsers?.length / event.capacity) * 100, 100) : 0;
    const posterUrl = event?.image ? `http://localhost:5000${event.image}` : null;

    const handleRegister = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (isPassed) return;

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
        <div className="event-page-container">
            <Skeleton width="150px" height="24px" style={{ marginBottom: '2rem' }} />
            <div className="event-hero" style={{ height: '450px' }}>
                <Skeleton width="300px" height="100%" style={{ borderRadius: '20px' }} />
                <div style={{ flex: 1 }}>
                    <Skeleton width="200px" height="30px" style={{ borderRadius: '30px', marginBottom: '1.5rem' }} />
                    <Skeleton variant="title" width="80%" height="5rem" />
                </div>
            </div>
        </div>
    );

    if (!event) return (
        <div className="event-page-container" style={{ textAlign: 'center', paddingTop: '10rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Event Not Found</h2>
            <button onClick={() => navigate('/events')} className="btn-primary">Return to Events</button>
        </div>
    );

    return (
        <div className="event-page-container">
            <button onClick={() => navigate(-1)} className="back-button">
                <ArrowLeft size={20} /> Back to Events
            </button>

            <header className="event-hero">
                {posterUrl && (
                    <div 
                        className="hero-immersive-bg" 
                        style={{ backgroundImage: `url(${posterUrl})` }}
                    ></div>
                )}
                
                {posterUrl && (
                    <div className="poster-card">
                        <img src={posterUrl} alt={event.title} />
                    </div>
                )}

                <div className="event-hero-content">
                    <div className="date-badge">
                        <Calendar size={18} style={{ marginRight: '8px' }} />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                    <h1 className="event-title">{event.title}</h1>
                    
                    <div className="organizer-pill">
                        <div className="organizer-avatar">
                            {event.organizer?.name?.charAt(0)}
                        </div>
                        <div className="organizer-info">
                            <span className="organizer-name">Organized by <strong style={{ color: 'white' }}>{event.organizer?.name}</strong></span>
                        </div>
                    </div>

                    <div className="engagement-bar">
                        <button className="engagement-btn">
                            <Share2 size={18} /> Share Event
                        </button>
                        <button className="engagement-btn">
                            <CalendarPlus size={18} /> Add to Calendar
                        </button>
                    </div>

                    <div className="event-details-bar" style={{ marginTop: '2.5rem' }}>
                        <div className="detail-item">
                            <MapPin size={18} className="detail-icon" />
                            <span>{event.location}</span>
                        </div>
                        <div className="detail-item">
                            <Users size={18} className="detail-icon" />
                            <span>{event.capacity} Capacity</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="event-main-grid">
                <main className="event-content-section">
                    <div className="section-header">
                        <div className="section-icon">
                            <Info size={24} />
                        </div>
                        <h2 className="section-title">Event Overview</h2>
                    </div>
                    <div className="event-description">
                        {event.description}
                    </div>

                    <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <div style={{ color: '#6366f1', marginBottom: '0.8rem' }}><Map size={24} /></div>
                            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Venue</h4>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Professional staff and modern facilities at {event.location}.</p>
                        </div>
                        <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                            <div style={{ color: '#10b981', marginBottom: '0.8rem' }}><Trophy size={24} /></div>
                            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Certification</h4>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>E-certificates provided for all verified attendees.</p>
                        </div>
                    </div>
                </main>

                <aside className="info-card">
                    <div className="info-item">
                        <div className="info-label">
                            <MapPin size={16} style={{ color: '#6366f1' }} /> Location
                        </div>
                        <div className="info-value">
                            <span>{event.location}</span>
                            <a href="#" className="view-map-link">
                                Map <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">
                            <Users size={16} style={{ color: '#10b981' }} /> Availability
                        </div>
                        <div className="info-value">
                            <span>{event.registeredUsers?.length || 0} / {event.capacity}</span>
                        </div>
                        <div className="progress-container">
                            <div 
                                className="progress-bar" 
                                style={{ width: `${capacityPercentage}%` }}
                            ></div>
                        </div>
                        <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Reserved Slots
                        </p>
                    </div>

                    <div className="info-item" style={{ background: isPassed ? 'rgba(100, 116, 139, 0.05)' : 'rgba(99, 102, 241, 0.05)', border: isPassed ? '1px solid rgba(100, 116, 139, 0.1)' : '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <button
                            onClick={handleRegister}
                            disabled={registering || (isFull && !isRegistered) || isPassed}
                            className={`cta-button ${
                                isPassed ? "cta-disabled" :
                                isRegistered ? "cta-secondary" : 
                                (isFull && !isRegistered) ? "cta-disabled" : "cta-primary"
                            }`}
                        >
                            {registering ? (
                                <Clock size={20} className="spin" />
                            ) : isPassed ? (
                                <History size={20} />
                            ) : isRegistered ? (
                                <ArrowLeft size={20} />
                            ) : isFull ? (
                                <ShieldAlert size={20} />
                            ) : (
                                <CheckCircle size={20} />
                            )}
                            {registering ? 'Processing...' : isPassed ? 'Registration Closed' : isRegistered ? 'Cancel Registration' : isFull ? 'Event Full' : 'Secure Your Spot'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1.2rem', fontWeight: '500' }}>
                            {isPassed ? "This event has already taken place." :
                             isRegistered ? "You're all set! See you there." : 
                             isFull ? "Join the waitlist for updates." : 
                             "Only a few spots remaining!"}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default EventDetail;
