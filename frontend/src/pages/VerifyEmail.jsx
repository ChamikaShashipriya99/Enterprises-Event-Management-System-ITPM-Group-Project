import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle } from 'lucide-react';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const { token } = useParams();
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verifyEmailToken = async () => {
            if (verificationAttempted.current) return;
            verificationAttempted.current = true;
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/verifyemail/${token}`);
                setStatus('success');
                setMessage(response.data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        if (token) {
            verifyEmailToken();
        }
    }, [token]);

    return (
        <div style={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 10%'
        }}>
            <div className="glass-card" style={{ padding: '3rem', maxWidth: '500px', width: '100%' }}>
                {status === 'verifying' && (
                    <>
                        <div className="loader" style={{ marginBottom: '1.5rem', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #6366f1', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', marginLeft: 'auto', marginRight: 'auto' }}></div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Verifying...</h2>
                        <p style={{ color: '#94a3b8' }}>Please wait while we confirm your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <CheckCircle2 size={80} color="#10b981" weight="bold" />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Verification Successful!</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{message}</p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <XCircle size={80} color="#ef4444" weight="bold" />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Verification Failed</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{message}</p>
                        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Back to Register
                        </Link>
                    </>
                )}
            </div>
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default VerifyEmail;
