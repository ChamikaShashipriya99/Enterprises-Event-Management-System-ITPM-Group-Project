import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import chatService from '../services/chatService';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { 
    ShieldCheck, 
    FileText, 
    Download, 
    Filter, 
    History, 
    User, 
    ShieldAlert, 
    MessageSquare, 
    Trash2, 
    UserMinus, 
    Pin, 
    PinOff, 
    Eraser,
    Search
} from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const data = await chatService.getAuditLogs(currentUser.token);
                setLogs(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching audit logs:", error);
                toast.error("Failed to load audit logs");
                setLoading(false);
            }
        };

        fetchLogs();
    }, [currentUser.token]);

    const { socket } = useContext(AuthContext);

    useEffect(() => {
        if (!socket) return;

        const logListener = (newLog) => {
            setLogs(prev => [newLog, ...prev]);
        };

        socket.on('audit-log-created', logListener);

        return () => {
            socket.off('audit-log-created', logListener);
        };
    }, [socket]);

    const filteredLogs = filter === 'ALL' 
        ? logs 
        : logs.filter(log => log.action === filter);

    const getActionColor = (action) => {
        switch (action) {
            case 'DELETE': return '#ef4444';
            case 'USER_DELETE': return '#f87171';
            case 'ANNOUNCEMENT': return '#22c55e';
            case 'PIN': return '#6366f1';
            case 'UNPIN': return '#94a3b8';
            case 'CLEAR_CHAT': return '#f59e0b';
            default: return 'white';
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'DELETE': return <Trash2 size={12} />;
            case 'USER_DELETE': return <UserMinus size={12} />;
            case 'ANNOUNCEMENT': return <MessageSquare size={12} />;
            case 'PIN': return <Pin size={12} />;
            case 'UNPIN': return <PinOff size={12} />;
            case 'CLEAR_CHAT': return <Eraser size={12} />;
            default: return <FileText size={12} />;
        }
    };

    const handleDownloadExcel = () => {
        try {
            if (filteredLogs.length === 0) {
                toast.error("No logs to export");
                return;
            }

            const dataToExport = filteredLogs.map(log => ({
                'Timestamp': new Date(log.createdAt).toLocaleString(),
                'User': log.admin?.name || 'Deleted User',
                'Email': log.admin?.email || 'N/A',
                'Role': log.admin?.role || 'Unknown',
                'Action': log.action,
                'Chat/Room': log.chat?.chatName || 'Global Chat',
                'Details': log.details || 'No additional details'
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

            // Customize column widths
            const wscols = [
                { wch: 20 }, // Timestamp
                { wch: 20 }, // User
                { wch: 25 }, // Email
                { wch: 10 }, // Role
                { wch: 15 }, // Action
                { wch: 20 }, // Chat
                { wch: 50 }, // Details
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `Audit_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Excel file downloaded successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <div style={{ padding: '2rem 5%', minHeight: '100vh', background: '#0f172a', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShieldCheck size={40} style={{ color: '#6366f1' }} />
                        Message <span style={{ color: '#6366f1' }}>Audit Logs</span>
                    </h1>
                    <p style={{ color: '#94a3b8' }}>Transparency & accountability for moderation actions.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                background: '#1e293b',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '10px 15px 10px 35px',
                                borderRadius: '8px',
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">All Actions</option>
                            <option value="DELETE">Admin Deletions</option>
                            <option value="USER_DELETE">User Self-Deletions</option>
                            <option value="ANNOUNCEMENT">Announcements</option>
                            <option value="PIN">Pins</option>
                            <option value="UNPIN">Unpins</option>
                            <option value="CLEAR_CHAT">Chat Cleared</option>
                        </select>
                        <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>

                    <button 
                        onClick={handleDownloadExcel}
                        className="btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald Green for Excel
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <Download size={18} /> Download Excel
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <History size={48} className="spin" style={{ color: '#6366f1', opacity: 0.5 }} />
                    <div style={{ color: '#94a3b8' }}>Synchronizing audit records...</div>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: 0, overflowX: 'auto', background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '15px 20px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                                <th style={{ padding: '15px 20px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                                <th style={{ padding: '15px 20px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                                <th style={{ padding: '15px 20px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                <th style={{ padding: '15px 20px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target/Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                                    <td style={{ padding: '15px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <History size={14} style={{ opacity: 0.5 }} />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{log.admin?.name || 'Deleted User'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.admin?.email || 'No email available'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ 
                                            textTransform: 'uppercase', 
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: log.admin?.role === 'admin' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                            color: log.admin?.role === 'admin' ? '#a855f7' : '#94a3b8',
                                            border: `1px solid ${log.admin?.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`
                                        }}>
                                            {log.admin?.role || 'Unknown'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: `${getActionColor(log.action)}15`, 
                                            color: getActionColor(log.action),
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            width: 'fit-content',
                                            border: `1px solid ${getActionColor(log.action)}30`
                                        }}>
                                            {getActionIcon(log.action)}
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                                            {log.chat?.chatName && <span style={{ color: '#6366f1', fontWeight: 600, marginRight: '4px' }}>[{log.chat.chatName.toUpperCase()}]</span>}
                                            {log.details || 'No additional details'}
                                        </div>
                                        {log.targetUser && (
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <ShieldAlert size={10} /> Affected: <span style={{ color: '#94a3b8' }}>{log.targetUser.name}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                            <FileText size={48} opacity={0.2} />
                                            <p>No audit logs found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
