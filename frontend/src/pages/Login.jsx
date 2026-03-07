import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const { login, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            const handleGoogleLogin = async () => {
                try {
                    const userData = await authService.getProfile(token);
                    if (userData) {
                        setUser(userData);
                        const role = userData.role;
                        if (role === 'admin') navigate('/admin-dashboard');
                        else if (role === 'organizer') navigate('/organizer-dashboard');
                        else navigate('/student-dashboard');
                    }
                } catch (err) {
                    console.error('Google login failed', err);
                    alert('Google login failed');
                }
            };
            handleGoogleLogin();
        }
    }, [location, setUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login({ email, password, mfaToken: mfaCode });

            if (data.mfaRequired) {
                setMfaRequired(true);
                return;
            }

            const role = data?.role;

            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else if (role === 'organizer') {
                navigate('/organizer-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 100px)',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '40px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Welcome Back</h2>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Enter your credentials to access your account</p>

                {!mfaRequired ? (
                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>Email Address</div>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>Password</div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: '500' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                            Sign In
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '15px', padding: '15px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <p style={{ color: '#6366f1', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
                                <b>MFA Required</b><br />
                                Please enter the 6-digit code from your authenticator app.
                            </p>
                        </div>
                        <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>Verification Code</div>
                        <input
                            type="text"
                            placeholder="000000"
                            className="input-field"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            required
                            maxLength={6}
                            style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }}
                            autoFocus
                        />
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                            Verify & Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setMfaRequired(false)}
                            style={{ width: '100%', marginTop: '10px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                <div style={{ margin: '25px 0', display: 'flex', alignItems: 'center', color: '#475569' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ padding: '0 10px', fontSize: '0.8rem' }}>OR CONTINUE WITH</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <button
                    onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '12px',
                        width: '100%',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontWeight: '500'
                    }}
                >
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" style={{ width: '20px' }} />
                    Google Account
                </button>

                <p style={{ marginTop: '30px', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#6366f1', fontWeight: '600' }}>Register now</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
