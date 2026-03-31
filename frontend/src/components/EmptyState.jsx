/**
 * Empty State Component
 * Displayed when there's no data to show
 */
const EmptyState = ({ icon, title, description, actionLabel, onAction }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                textAlign: 'center',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.3)'
            }}
        >
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.6 }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {title}
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '400px' }}>
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
