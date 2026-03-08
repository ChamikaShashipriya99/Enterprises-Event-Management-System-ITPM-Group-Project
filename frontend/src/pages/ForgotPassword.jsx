import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let newErrors = {};
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(email)) newErrors.email = 'Valid email is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
            setMessage('A password reset link has been sent to your email.');
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setLoading(false);
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
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Forgot Password</h2>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Enter your email to receive a password reset link</p>

                {message && <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
                {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>Email Address</div>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        className="input-field"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                    />
                    {errors.email && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '10px' }}>{errors.email}</p>}

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p style={{ marginTop: '30px', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Back to <Link to="/login" style={{ color: '#6366f1', fontWeight: '600' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
