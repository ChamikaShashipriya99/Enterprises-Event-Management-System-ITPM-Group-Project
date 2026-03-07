import { useState, useEffect } from 'react';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        upcomingEvents: 0,
        pastEvents: 0,
        totalRegistrations: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await eventService.getAdminEvents();
                const fetchedEvents = response.data;
                setEvents(fetchedEvents);

                // Calculate stats
                const now = new Date();
                const upcoming = fetchedEvents.filter(e => new Date(e.date) > now).length;
                const past = fetchedEvents.filter(e => new Date(e.date) <= now).length;
                const registrations = fetchedEvents.reduce((sum, e) => sum + (e.registeredUsers?.length || 0), 0);

                setStats({
                    totalEvents: fetchedEvents.length,
                    upcomingEvents: upcoming,
                    pastEvents: past,
                    totalRegistrations: registrations
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin events:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await eventService.deleteEvent(id);
                setEvents(events.filter(e => e._id !== id));
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Failed to delete event');
            }
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem 5%' }}>
            <Skeleton variant="title" width="350px" style={{ marginBottom: '2rem' }} />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <Skeleton variant="circle" width="40px" height="40px" style={{ margin: '0 auto 0.5rem' }} />
                        <Skeleton variant="text" width="60%" style={{ margin: '0 auto' }} />
                        <Skeleton variant="text" width="40%" height="1.8rem" style={{ margin: '0 auto' }} />
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <Skeleton width="20%" />
                        <Skeleton width="15%" />
                        <Skeleton width="10%" />
                        <Skeleton width="15%" />
                        <Skeleton width="10%" />
                    </div>
                ))}
            </div>
        </div>
    );

    const statCards = [
        { title: 'Total Events', value: stats.totalEvents, icon: '📅', color: '#6366f1' },
        { title: 'Upcoming', value: stats.upcomingEvents, icon: '🚀', color: '#10b981' },
        { title: 'Past Events', value: stats.pastEvents, icon: '📜', color: '#64748b' },
        { title: 'Total Signups', value: stats.totalRegistrations, icon: '👥', color: '#a855f7' }
    ];

    return (
        <div style={{ padding: '2rem 5%' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: '800' }}>Event <span style={{ color: '#6366f1' }}>Oversight</span></h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {statCards.map((card, index) => (
                    <div key={index} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>{card.title}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: card.color }}>{card.value}</div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1.2rem' }}>Event Title</th>
                            <th style={{ padding: '1.2rem' }}>Organizer</th>
                            <th style={{ padding: '1.2rem' }}>Date</th>
                            <th style={{ padding: '1.2rem' }}>Location</th>
                            <th style={{ padding: '1.2rem' }}>Capacity</th>
                            <th style={{ padding: '1.2rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '1.2rem', fontWeight: '500' }}>{event.title}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{event.organizer?.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{event.organizer?.email}</div>
                                </td>
                                <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>{new Date(event.date).toLocaleDateString()}</td>
                                <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>{event.location}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{event.registeredUsers?.length || 0} / {event.capacity}</div>
                                    <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px' }}>
                                        <div style={{
                                            width: `${Math.min(((event.registeredUsers?.length || 0) / event.capacity) * 100, 100)}%`,
                                            height: '100%',
                                            background: 'var(--primary)',
                                            borderRadius: '2px'
                                        }}></div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleDelete(event._id)}
                                            style={{
                                                padding: '6px 12px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminEvents;
