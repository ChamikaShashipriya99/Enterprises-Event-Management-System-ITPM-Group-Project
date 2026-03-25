import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import chatService from '../services/chatService';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        🛡️ Message Audit Logs
                    </h1>
                    <p style={{ color: '#94a3b8' }}>Transparency & accountability for moderation actions.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            background: '#1e293b',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            outline: 'none'
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

                    <button 
                        onClick={handleDownloadExcel}
                        className="btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 20px',
                            fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald Green for Excel
                            border: 'none'
                        }}
                    >
                        <span>📊</span> Download Excel
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Loading logs...</div>
            ) : (
                <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '15px 20px' }}>Timestamp</th>
                                <th style={{ padding: '15px 20px' }}>User</th>
                                <th style={{ padding: '15px 20px' }}>Role</th>
                                <th style={{ padding: '15px 20px' }}>Action</th>
                                <th style={{ padding: '15px 20px' }}>Target/Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '15px 20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ fontWeight: 600 }}>{log.admin?.name || 'Deleted User'}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{log.admin?.email || 'No email available'}</div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ 
                                            textTransform: 'capitalize', 
                                            fontSize: '0.85rem',
                                            color: log.admin?.role === 'admin' ? '#a855f7' : '#94a3b8'
                                        }}>
                                            {log.admin?.role || 'Unknown'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ 
                                            background: `${getActionColor(log.action)}20`, 
                                            color: getActionColor(log.action),
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            border: `1px solid ${getActionColor(log.action)}40`
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {log.chat?.chatName && <span style={{ color: '#6366f1', fontWeight: 500 }}>[{log.chat.chatName}] </span>}
                                            {log.details || 'No additional details'}
                                        </div>
                                        {log.targetUser && (
                                            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}>
                                                Affected User: {log.targetUser.name}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                        No audit logs found.
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
