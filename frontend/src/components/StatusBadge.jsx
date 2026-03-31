/**
 * Status Badge Component
 * Displays status with color coding
 * Types: booked, cancelled, checked-in, absent, excused, generated, pending
 */
const StatusBadge = ({ status, size = 'sm' }) => {
    const statusConfig = {
        booked: {
            bg: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            icon: '✓',
            label: 'Booked'
        },
        cancelled: {
            bg: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            icon: '✕',
            label: 'Cancelled'
        },
        'checked-in': {
            bg: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            icon: '✓',
            label: 'Checked In'
        },
        absent: {
            bg: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            icon: '−',
            label: 'Absent'
        },
        excused: {
            bg: 'rgba(251, 146, 60, 0.15)',
            color: '#fb923c',
            icon: '!',
            label: 'Excused'
        },
        generated: {
            bg: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            icon: '✓',
            label: 'Generated'
        },
        pending: {
            bg: 'rgba(251, 146, 60, 0.15)',
            color: '#fb923c',
            icon: '⏳',
            label: 'Pending'
        },
        'not-generated': {
            bg: 'rgba(156, 163, 175, 0.15)',
            color: '#9ca3af',
            icon: '−',
            label: 'Not Generated'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const padding = size === 'sm' ? '4px 12px' : '8px 16px';
    const fontSize = size === 'sm' ? '0.75rem' : '0.8rem';

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding,
                background: config.bg,
                color: config.color,
                borderRadius: '6px',
                fontSize,
                fontWeight: '600',
                border: `1px solid ${config.color}33`,
                whiteSpace: 'nowrap'
            }}
        >
            <span>{config.icon}</span>
            {config.label}
        </span>
    );
};

export default StatusBadge;
