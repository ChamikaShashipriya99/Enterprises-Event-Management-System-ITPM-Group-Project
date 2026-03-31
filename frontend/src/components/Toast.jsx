/**
 * Toast Notification Component
 * Shows success, error, info messages
 */
const Toast = ({ type = 'success', message, onClose }) => {
    const config = {
        success: {
            bg: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            icon: '✓',
            border: '1px solid rgba(16, 185, 129, 0.3)'
        },
        error: {
            bg: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            icon: '✕',
            border: '1px solid rgba(239, 68, 68, 0.3)'
        },
        info: {
            bg: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            icon: 'i',
            border: '1px solid rgba(59, 130, 246, 0.3)'
        }
    };

    const { bg, color, icon, border } = config[type];

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                padding: '1rem 1.5rem',
                background: bg,
                color,
                border,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 1000,
                animation: 'slideIn 0.3s ease-out',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
        >
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{icon}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color,
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    marginLeft: '0.5rem',
                    padding: 0
                }}
            >
                ×
            </button>
        </div>
    );
};

export default Toast;
