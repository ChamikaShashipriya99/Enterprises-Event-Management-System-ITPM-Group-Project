import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';

const OrganizerEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, eventId: null });

    const fetchEvents = async () => {
        try {
            const response = await eventService.getMyEvents();
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id) => {
        setModal({ isOpen: true, eventId: id });
    };

    const confirmDelete = async () => {
        try {
            await eventService.deleteEvent(modal.eventId);
            setEvents(events.filter(e => e._id !== modal.eventId));
            setModal({ isOpen: false, eventId: null });
        } catch (error) {
            alert('Action failed: Could not delete event');
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Skeleton variant="title" width="300px" />
                <Skeleton width="120px" height="40px" />
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <Skeleton width="30%" />
                        <Skeleton width="15%" />
                        <Skeleton width="15%" />
                        <Skeleton width="10%" />
                        <Skeleton width="10%" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Manage <span style={{ color: '#a855f7' }}>My Events</span></h1>
                <Link to="/create-event" className="btn-primary" style={{ textDecoration: 'none' }}>+ New Event</Link>
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <th style={{ padding: '20px', color: '#94a3b8' }}>EVENT NAME</th>
                            <th style={{ padding: '20px', color: '#94a3b8' }}>DATE</th>
                            <th style={{ padding: '20px', color: '#94a3b8' }}>LOCATION</th>
                            <th style={{ padding: '20px', color: '#94a3b8' }}>ATTENDEES</th>
                            <th style={{ padding: '20px', color: '#94a3b8' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No events organized yet.</td>
                            </tr>
                        ) : (
                            events.map(event => (
                                <tr key={event._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '20px', fontWeight: 'bold' }}>{event.title}</td>
                                    <td style={{ padding: '20px' }}>{new Date(event.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '20px', color: '#94a3b8' }}>{event.location}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                            {event.registeredUsers?.length || 0} / {event.capacity}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <Link
                                                to={`/edit-event/${event._id}`}
                                                style={{ textDecoration: 'none', color: '#6366f1', fontSize: '0.9rem', fontWeight: 'bold' }}
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={modal.isOpen}
                title="Delete Event"
                message="Are you sure you want to securely delete this event? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setModal({ isOpen: false, eventId: null })}
            />
        </div>
    );
};

export default OrganizerEvents;
