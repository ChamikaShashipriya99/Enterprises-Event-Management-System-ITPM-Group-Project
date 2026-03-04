import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Student Dashboard</h1>
                <p style={{ color: '#94a3b8' }}>Welcome back, {currentUser?.name}. Track your learning and participation.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#6366f1' }}>📅</span> Registered Events
                    </h2>
                    {currentUser?.registeredEvents?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {currentUser.registeredEvents.map((event, index) => (
                                <div key={index} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                                    {event}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b' }}>No events registered yet. Start exploring!</p>
                    )}
                </section>

                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#10b981' }}>🎓</span> My Certificates
                    </h2>
                    {currentUser?.certificates?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {currentUser.certificates.map((cert, index) => (
                                <div key={index} style={{
                                    padding: '15px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{cert}</span>
                                    <button style={{
                                        padding: '5px 12px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10b981',
                                        border: '1px solid #10b981',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}>Download</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b' }}>Complete events to earn certificates.</p>
                    )}
                </section>

                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#f59e0b' }}>🕒</span> Event History
                    </h2>
                    <p style={{ color: '#64748b' }}>Your past event participations will appear here for easy access.</p>
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
                        Coming Soon
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StudentDashboard;
