/**
 * Reusable Card Component
 * Used for consistent card styling across the app
 */
const UICard = ({ children, className = '', style = {}, onClick = null, hover = true }) => {
    return (
        <div
            className={`glass-card ${className}`}
            style={{
                padding: '1.5rem',
                transition: hover ? 'transform 0.2s, box-shadow 0.2s' : 'none',
                cursor: onClick ? 'pointer' : 'default',
                ...style
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (hover) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.2)';
                }
            }}
            onMouseLeave={(e) => {
                if (hover) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
                }
            }}
        >
            {children}
        </div>
    );
};

export default UICard;
