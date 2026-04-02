// frontend/src/pages/EventDetail.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
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
    
    // States
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState(null);
    const [bookingAction, setBookingAction] = useState(false); // Controls the active booking process
    const [booked, setBooked] = useState(false);
    const [bookingRef, setBookingRef] = useState(null);

    // Derived values
    const posterUrl = event?.image ? `http://localhost:5000${event.image}` : null;
    const eventDate = event ? new Date(event.date) : null;
    const isPast = eventDate ? eventDate < new Date().setHours(0,0,0,0) : false;
    const isToday = eventDate ? new Date().toDateString() === eventDate.toDateString() : false;
    const isFull = availability && availability.availableSeats <= 0;
    const capacityPercentage = availability 
        ? Math.min((availability.confirmedBookings / availability.totalCapacity) * 100, 100)
        : event ? Math.min((event.registeredUsers?.length / event.capacity) * 100, 100) : 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, availRes] = await Promise.all([
                    eventService.getEventById(id),
                    bookingService.checkAvailability(id)
                ]);
                setEvent(eventRes.data);
                setAvailability(availRes.data);
                
                // If user is logged in, check if they already have a booking (optional optimization)
                // For now, we rely on the backend error or initial state.
            } catch (error) {
                console.error('Error fetching event details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleBook = async () => {
        if (!currentUser) { 
            navigate('/login'); 
            return; 
        }
        
        if (currentUser.role !== 'student') {
            alert('Only students can book seats for events.');
            return;
        }

        if (isPast || isToday) {
            alert('Bookings are closed for this event.');
            return;
        }

        setBookingAction(true);
        try {
            const res = await bookingService.createBooking(id);
            setBooked(true);
            setBookingRef(res.data.bookingId);
            
            // Refresh availability live
            const availRes = await bookingService.checkAvailability(id);
            setAvailability(availRes.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed. You might already have a booking or it is full.');
        } finally {
            setBookingAction(false);
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
                        {eventDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                    <h1 className="event-title">{event.title}</h1>
                    
                    <div className="organizer-pill">
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
                            <span>{availability?.totalCapacity || event.capacity} Max Capacity</span>
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
                            <span>{availability?.confirmedBookings || event.registeredUsers?.length || 0} / {availability?.totalCapacity || event.capacity}</span>
                        </div>
                        <div className="progress-container">
                            <div 
                                className="progress-bar" 
                                style={{ width: `${capacityPercentage}%` }}
                            ></div>
                        </div>
                        <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            {availability ? `${availability.availableSeats} slots left` : 'Loading availability...'}
                        </p>
                    </div>

                    <div className="info-item" style={{ 
                        background: isPast ? 'rgba(100, 116, 139, 0.05)' : 'rgba(99, 102, 241, 0.05)', 
                        border: isPast ? '1px solid rgba(100, 116, 139, 0.1)' : '1px solid rgba(99, 102, 241, 0.1)' 
                    }}>
                        {booked ? (
                             <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '10px' }}>✅ Seat Booked!</div>
                                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '15px' }}>REF: {bookingRef}</div>
                                <button 
                                    onClick={() => navigate('/my-bookings')} 
                                    className="cta-button cta-primary" 
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    View My Bookings
                                </button>
                             </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleBook}
                                    disabled={bookingAction || isFull || isPast || isToday}
                                    className={`cta-button ${
                                        (isPast || isToday) ? "cta-disabled" :
                                        isFull ? "cta-disabled" : "cta-primary"
                                    }`}
                                >
                                    {bookingAction ? (
                                        <Clock size={20} className="spin" />
                                    ) : isPast ? (
                                        <History size={20} />
                                    ) : isToday ? (
                                        <ShieldAlert size={20} />
                                    ) : isFull ? (
                                        <ShieldAlert size={20} />
                                    ) : (
                                        <CalendarPlus size={20} />
                                    )}
                                    {bookingAction ? 'Processing...' : isPast ? 'Event Ended' : isToday ? 'Booking Closed' : isFull ? 'House Full' : 'Book a Seat'}
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1.2rem', fontWeight: '500' }}>
                                    {isPast ? "This event has already taken place." :
                                     isToday ? "Bookings close on the event day." :
                                     isFull ? "All seats have been reserved." : 
                                     "Secure your spot before it's gone!"}
                                </p>
                            </>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default EventDetail;
