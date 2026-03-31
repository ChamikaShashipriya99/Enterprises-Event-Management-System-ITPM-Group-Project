/**
 * Summary Card Component
 * Displays dashboard statistics with icons and values
 */
const SummaryCard = ({ icon, label, value, trend, color = '#6366f1' }) => {
    return (
        <div
            className="glass-card"
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(99, 102, 241, 0.2)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem' }}>{icon}</div>
                {trend && (
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        background: trend.positive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: trend.positive ? '#10b981' : '#ef4444',
                        borderRadius: '4px',
                        fontWeight: '600'
                    }}>
                        {trend.positive ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
            <div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>
                    {label}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color }}>
                    {value}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;
