import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { token } = useParams();
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let newErrors = {};
        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

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
            await axios.put(`http://localhost:5000/api/auth/resetpassword/${token}`, { password });
            setMessage('Password reset successful! Redirecting to login...');
            setLoading(false);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
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
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Reset Password</h2>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Enter your new password below</p>

                {message && <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}><CheckCircle2 size={18} /> {message}</div>}
                {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}><AlertCircle size={18} /> {error}</div>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>New Password</div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="input-field"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                    />
                    <PasswordStrengthMeter password={password} />
                    {errors.password && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '10px' }}>{errors.password}</p>}

                    <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>Confirm New Password</div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="input-field"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                        }}
                    />
                    {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '10px' }}>{errors.confirmPassword}</p>}

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
