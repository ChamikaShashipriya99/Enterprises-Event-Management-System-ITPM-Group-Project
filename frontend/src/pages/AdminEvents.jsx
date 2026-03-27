import { useState, useEffect } from 'react';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { 
    Calendar, 
    Rocket, 
    History, 
    Users, 
    Trash2, 
    ShieldCheck, 
    MapPin, 
    Building2,
    Mail,
    User
} from 'lucide-react';

const AdminEvents = () => {
    // ... existing state and functions ...
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, eventId: null });
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
        setModal({ isOpen: true, eventId: id });
    };

    const confirmDelete = async () => {
        try {
            await eventService.deleteEvent(modal.eventId);
            setEvents(events.filter(e => e._id !== modal.eventId));
            setModal({ isOpen: false, eventId: null });
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
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
        { title: 'Total Events', value: stats.totalEvents, icon: <Calendar size={24} />, color: '#6366f1' },
        { title: 'Upcoming', value: stats.upcomingEvents, icon: <Rocket size={24} />, color: '#10b981' },
        { title: 'Past Events', value: stats.pastEvents, icon: <History size={24} />, color: '#64748b' },
        { title: 'Total Signups', value: stats.totalRegistrations, icon: <Users size={24} />, color: '#a855f7' }
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
                    <div key={index} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s' }}>
                        <div style={{ 
                            padding: '12px', 
                            borderRadius: '12px', 
                            background: `${card.color}20`, 
                            color: card.color,
                            marginBottom: '1rem' 
                        }}>
                            {card.icon}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{card.value}</div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Event Details</th>
                            <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Organizer</th>
                            <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Engagement</th>
                            <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => {
                            const isPast = new Date(event.date) < new Date();
                            return (
                                <tr key={event._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>{event.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                                <Calendar size={12} /> {new Date(event.date).toLocaleDateString()}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                                <MapPin size={12} /> {event.location}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{event.organizer?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{event.organizer?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            background: isPast ? 'rgba(100, 116, 139, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: isPast ? '#94a3b8' : '#10b981',
                                            border: `1px solid ${isPast ? 'rgba(100, 116, 139, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                        }}>
                                            {isPast ? 'PAST' : 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                            <span style={{ color: '#94a3b8' }}>Registrations</span>
                                            <span>{event.registeredUsers?.length || 0} / {event.capacity}</span>
                                        </div>
                                        <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${Math.min(((event.registeredUsers?.length || 0) / event.capacity) * 100, 100)}%`,
                                                height: '100%',
                                                background: isPast ? '#64748b' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                                                borderRadius: '3px'
                                            }}></div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(event._id)}
                                            style={{
                                                padding: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Delete Event"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={modal.isOpen}
                title="Delete Event"
                message="Are you sure you want to cancel and delete this event? This will permanently remove all registration data."
                onConfirm={confirmDelete}
                onCancel={() => setModal({ isOpen: false, eventId: null })}
            />
        </div>
    );
};

export default AdminEvents;
