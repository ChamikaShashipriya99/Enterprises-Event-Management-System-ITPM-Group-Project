import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Event Completion & Certificate Generation Page
 * Allows organizers/admins to mark events as completed and generate certificates for attendees
 */
const EventCompletion = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [filter, setFilter] = useState('completed');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventStats, setEventStats] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [certResults, setCertResults] = useState(null);

    useEffect(() => {
        fetchOrganizedEvents();
    }, []);

    const fetchOrganizedEvents = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            // Get organized events from admin endpoint
            const response = await axios.get('/api/admin/my-organized-events', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setEvents(response.data.data || []);
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.message ||
                'Failed to load events';
            setError(errorMsg);
            console.error('Fetch events error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = async (event) => {
        setSelectedEvent(event);
        // Fetch attendance stats for this event
        fetchEventAttendance(event._id);
    };

    const fetchEventAttendance = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/attendance/event/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setEventStats(response.data.summary);
            }
        } catch (err) {
            console.error('Fetch attendance error:', err);
        }
    };

    const handleGenerateCertificates = async () => {
        if (!selectedEvent) return;

        setGenerating(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/certificates/generate-for-event/${selectedEvent._id}`,
                {
                    attendanceHours: 1, // Can be customized based on event duration
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setCertResults(response.data.data);
                setSuccessMessage(
                    `✅ Certificates generated successfully! Generated: ${response.data.data.generated.length}, Failed: ${response.data.data.failed.length}`
                );

                // Refresh events after 2 seconds
                setTimeout(() => {
                    fetchOrganizedEvents();
                }, 2000);
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.message ||
                'Failed to generate certificates';
            setError(errorMsg);
            console.error('Generate certificates error:', err);
        } finally {
            setGenerating(false);
        }
    };

    const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.date);
        const now = new Date();

        if (filter === 'completed') {
            return eventDate < now;
        } else if (filter === 'upcoming') {
            return eventDate >= now;
        }
        return true;
    });

    // Loading state
    if (loading) {
        return (
            <div
                style={{
                    padding: '2rem 5%',
                    textAlign: 'center',
                    color: '#94a3b8',
                }}
            >
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    ⏳
                </div>
                <p>Loading your organized events...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1
                    style={{
                        fontSize: '2.2rem',
                        fontWeight: '800',
                        marginBottom: '0.4rem',
                    }}
                >
                    Event <span style={{ color: '#6366f1' }}>Completion</span>
                </h1>
                <p style={{ color: '#94a3b8' }}>
                    Generate certificates for event attendees.
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div
                    style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#f87171',
                    }}
                >
                    ❌ {error}
                </div>
            )}

            {/* Success message */}
            {successMessage && (
                <div
                    style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#34d399',
                    }}
                >
                    {successMessage}
                </div>
            )}

            {/* Main container - two column */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: selectedEvent
                        ? 'minmax(350px, 1fr) 1fr'
                        : '1fr',
                    gap: '2rem',
                }}
            >
                {/* Left: Event List */}
                <div>
                    {/* Filter */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label
                            style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#cbd5e1',
                                marginRight: '0.5rem',
                            }}
                        >
                            Show:
                        </label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#cbd5e1',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="all">All Events</option>
                            <option value="completed">Completed</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </div>

                    {/* Event List */}
                    <div>
                        {filteredEvents.length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '2rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    border: '1px dashed rgba(255,255,255,0.08)',
                                    color: '#64748b',
                                }}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                    📭
                                </div>
                                <p>No events found</p>
                            </div>
                        ) : (
                            filteredEvents.map((event) => {
                                const eventDate = new Date(event.date);
                                const isCompleted = eventDate < new Date();

                                return (
                                    <div
                                        key={event._id}
                                        onClick={() => handleSelectEvent(event)}
                                        style={{
                                            background:
                                                selectedEvent?._id === event._id
                                                    ? 'rgba(99, 102, 241, 0.2)'
                                                    : 'rgba(30,41,59,0.7)',
                                            border:
                                                selectedEvent?._id === event._id
                                                    ? '2px solid rgba(99, 102, 241, 0.5)'
                                                    : '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '12px',
                                            padding: '1.25rem',
                                            marginBottom: '0.75rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedEvent?._id !== event._id) {
                                                e.currentTarget.style.background =
                                                    'rgba(30,41,59,0.9)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedEvent?._id !== event._id) {
                                                e.currentTarget.style.background =
                                                    'rgba(30,41,59,0.7)';
                                            }
                                        }}
                                    >
                                        <h4
                                            style={{
                                                fontSize: '0.95rem',
                                                fontWeight: '700',
                                                marginBottom: '0.3rem',
                                                color: '#f1f5f9',
                                            }}
                                        >
                                            {event.title}
                                        </h4>
                                        <p
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#94a3b8',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            📅{' '}
                                            {eventDate.toLocaleDateString(
                                                'en-US',
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </p>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: '600',
                                                background: isCompleted
                                                    ? 'rgba(34, 197, 94, 0.15)'
                                                    : 'rgba(251, 146, 60, 0.15)',
                                                color: isCompleted
                                                    ? '#22c55e'
                                                    : '#fb923c',
                                            }}
                                        >
                                            {isCompleted ? '✅ Completed' : '⏱️ Upcoming'}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Event Details & Certificate Generation */}
                {selectedEvent && (
                    <div>
                        {/* Event Info Card */}
                        <div
                            style={{
                                background: 'rgba(30,41,59,0.7)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '14px',
                                padding: '2rem',
                                marginBottom: '2rem',
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    marginBottom: '1rem',
                                    color: '#f1f5f9',
                                }}
                            >
                                {selectedEvent.title}
                            </h2>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(120px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#64748b',
                                            textTransform: 'uppercase',
                                            marginBottom: '0.3rem',
                                        }}
                                    >
                                        Date
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.95rem',
                                            color: '#cbd5e1',
                                        }}
                                    >
                                        {new Date(
                                            selectedEvent.date
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div
                                        style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#64748b',
                                            textTransform: 'uppercase',
                                            marginBottom: '0.3rem',
                                        }}
                                    >
                                        Capacity
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.95rem',
                                            color: '#cbd5e1',
                                        }}
                                    >
                                        {selectedEvent.capacity} seats
                                    </div>
                                </div>
                            </div>

                            <p
                                style={{
                                    fontSize: '0.9rem',
                                    color: '#cbd5e1',
                                    lineHeight: '1.5',
                                }}
                            >
                                {selectedEvent.description}
                            </p>
                        </div>

                        {/* Attendance Stats */}
                        {eventStats && (
                            <div
                                style={{
                                    background:
                                        'rgba(99, 102, 241, 0.12)',
                                    border: '1px solid rgba(99, 102, 241, 0.25)',
                                    borderRadius: '14px',
                                    padding: '1.5rem',
                                    marginBottom: '2rem',
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        marginBottom: '1rem',
                                        color: '#818cf8',
                                    }}
                                >
                                    Attendance Summary
                                </h3>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(3, 1fr)',
                                        gap: '1rem',
                                    }}
                                >
                                    <div style={{ textAlign: 'center' }}>
                                        <div
                                            style={{
                                                fontSize: '1.8rem',
                                                fontWeight: '800',
                                                color: '#34d399',
                                                marginBottom: '0.25rem',
                                            }}
                                        >
                                            {eventStats.present}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#64748b',
                                            }}
                                        >
                                            Present
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center' }}>
                                        <div
                                            style={{
                                                fontSize: '1.8rem',
                                                fontWeight: '800',
                                                color: '#f87171',
                                                marginBottom: '0.25rem',
                                            }}
                                        >
                                            {eventStats.absent}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#64748b',
                                            }}
                                        >
                                            Absent
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center' }}>
                                        <div
                                            style={{
                                                fontSize: '1.8rem',
                                                fontWeight: '800',
                                                color: '#fbbf24',
                                                marginBottom: '0.25rem',
                                            }}
                                        >
                                            {eventStats.excused}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#64748b',
                                            }}
                                        >
                                            Excused
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop:
                                            '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: '0.85rem',
                                            color: '#cbd5e1',
                                        }}
                                    >
                                        <strong>Total Attendees:</strong>{' '}
                                        {eventStats.totalAttendees}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Generate Certificates */}
                        <div>
                            <button
                                onClick={handleGenerateCertificates}
                                disabled={
                                    generating ||
                                    new Date(selectedEvent.date) >= new Date()
                                }
                                style={{
                                    width: '100%',
                                    padding: '14px 20px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    background:
                                        new Date(selectedEvent.date) >=
                                        new Date()
                                            ? 'rgba(100, 116, 139, 0.3)'
                                            : generating
                                            ? 'rgba(99, 102, 241, 0.3)'
                                            : 'linear-gradient(135deg, #6366f1, #818cf8)',
                                    color:
                                        new Date(selectedEvent.date) >=
                                        new Date()
                                            ? '#94a3b8'
                                            : 'white',
                                    border:
                                        new Date(selectedEvent.date) >=
                                        new Date()
                                            ? '1px solid rgba(100, 116, 139, 0.3)'
                                            : 'none',
                                    cursor:
                                        new Date(selectedEvent.date) >=
                                        new Date()
                                            ? 'not-allowed'
                                            : 'pointer',
                                }}
                            >
                                {generating
                                    ? '⏳ Generating Certificates...'
                                    : new Date(selectedEvent.date) >= new Date()
                                    ? '⏱️ Waiting for event to complete'
                                    : '🎓 Generate Certificates'}
                            </button>

                            {new Date(selectedEvent.date) >= new Date() && (
                                <p
                                    style={{
                                        marginTop: '0.75rem',
                                        fontSize: '0.8rem',
                                        color: '#64748b',
                                        textAlign: 'center',
                                    }}
                                >
                                    Certificates can only be generated after the
                                    event has completed.
                                </p>
                            )}
                        </div>

                        {/* Certificate Generation Results */}
                        {certResults && (
                            <div
                                style={{
                                    marginTop: '2rem',
                                    background: 'rgba(99, 102, 241, 0.08)',
                                    border:
                                        '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                }}
                            >
                                <h4
                                    style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '700',
                                        marginBottom: '1rem',
                                        color: '#818cf8',
                                    }}
                                >
                                    Generation Results
                                </h4>

                                {certResults.generated.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '1.2rem',
                                                    marginRight: '0.5rem',
                                                }}
                                            >
                                                ✅
                                            </span>
                                            <span
                                                style={{
                                                    color: '#34d399',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                Generated (
                                                {certResults.generated.length})
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#cbd5e1',
                                                marginLeft: '1.8rem',
                                            }}
                                        >
                                            {certResults.generated
                                                .slice(0, 3)
                                                .map((cert) => (
                                                    <div key={cert.certificateId}>
                                                        {cert.studentName}
                                                    </div>
                                                ))}
                                            {certResults.generated.length > 3 && (
                                                <div>
                                                    ...and{' '}
                                                    {certResults.generated
                                                        .length - 3}{' '}
                                                    more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {certResults.alreadyGenerated.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '1.2rem',
                                                    marginRight: '0.5rem',
                                                }}
                                            >
                                                ℹ️
                                            </span>
                                            <span
                                                style={{
                                                    color: '#818cf8',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                Already Generated (
                                                {
                                                    certResults
                                                        .alreadyGenerated
                                                        .length
                                                })
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {certResults.failed.length > 0 && (
                                    <div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '1.2rem',
                                                    marginRight: '0.5rem',
                                                }}
                                            >
                                                ❌
                                            </span>
                                            <span
                                                style={{
                                                    color: '#f87171',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                Failed (
                                                {certResults.failed.length})
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#f87171',
                                                marginLeft: '1.8rem',
                                            }}
                                        >
                                            {certResults.failed.map((fail) => (
                                                <div key={fail.studentName}>
                                                    {fail.studentName}: {fail.error}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCompletion;
