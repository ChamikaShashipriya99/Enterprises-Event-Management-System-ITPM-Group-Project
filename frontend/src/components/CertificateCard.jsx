/**
 * Certificate Card Component
 * Displays certificate with preview and actions
 */
const CertificateCard = ({ certificate, onDownload, onEmail, downloading, emailing }) => {
    const issueDate = certificate?.createdAt
        ? new Date(certificate.createdAt).toLocaleDateString()
        : 'N/A';

    return (
        <div
            className="glass-card"
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
            }}
        >
            {/* Certificate Preview */}
            <div
                style={{
                    width: '100%',
                    height: '150px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    padding: '1rem'
                }}
            >
                🏆 Certificate
            </div>

            {/* Details */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID:</span>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: '600' }}>
                        {certificate._id?.substring(0, 12)}...
                    </span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>
                    📅 Issued: {issueDate}
                </div>
                {certificate?.eventTitle && (
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px' }}>
                        Event: {certificate.eventTitle}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload?.(certificate._id);
                    }}
                    disabled={downloading}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: downloading ? 'not-allowed' : 'pointer',
                        opacity: downloading ? 0.7 : 1,
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!downloading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {downloading ? '⏳ Downloading...' : '📥 Download'}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEmail?.(certificate._id);
                    }}
                    disabled={emailing}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: emailing ? 'not-allowed' : 'pointer',
                        opacity: emailing ? 0.7 : 1,
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!emailing) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {emailing ? '⏳ Sending...' : '📧 Email'}
                </button>
            </div>
        </div>
    );
};

export default CertificateCard;
