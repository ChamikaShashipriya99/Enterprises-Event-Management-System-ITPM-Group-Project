import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const OrganizerDashboard = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Organizer Suite</h1>
                <p style={{ color: '#94a3b8' }}>Welcome, {currentUser?.name}. Plan and manage your enterprise events.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                <div className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>✨</div>
                    <h2 style={{ marginBottom: '15px' }}>Create New Event</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '25px', lineHeight: '1.6' }}>
                        Host a new event. You can set the date, capacity, and registration requirements for your community.
                    </p>
                    <button className="btn-primary" style={{ width: '100%' }}>Launch Event Wizard</button>
                </div>

                <div className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📊</div>
                    <h2 style={{ marginBottom: '15px' }}>Active Registrations</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '25px', lineHeight: '1.6' }}>
                        Track real-time registrations, manage waitlists, and communicate with your attendees effortlessly.
                    </p>
                    <button className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        View Registrations
                    </button>
                </div>

                <div className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⚙️</div>
                    <h2 style={{ marginBottom: '15px' }}>My Events</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '25px', lineHeight: '1.6' }}>
                        Modify existing event details, update sponsors, or cancel scheduled sessions from your management panel.
                    </p>
                    <button style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>Manage Portfolio</button>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
