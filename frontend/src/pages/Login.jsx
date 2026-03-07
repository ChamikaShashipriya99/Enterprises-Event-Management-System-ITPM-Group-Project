import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            await login({ email, password });
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const role = storedUser?.role;

            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else if (role === 'organizer') {
                navigate('/organizer-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (err) {
            alert('Login failed');
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
