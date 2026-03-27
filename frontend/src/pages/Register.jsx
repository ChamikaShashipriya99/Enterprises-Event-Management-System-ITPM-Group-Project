import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { CheckCircle2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', roleCode: '' });
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.email)) newErrors.email = 'Valid email is required';

        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number';
        }

        if ((formData.role === 'admin' || formData.role === 'organizer') && !formData.roleCode.trim()) {
            newErrors.roleCode = 'Secret code is required for this role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const data = await register(formData);
            setSuccess(true);
            setMessage(data.message || 'Registration successful! Please check your email to verify your account.');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Registration failed';
            alert(errorMsg);
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
                maxWidth: '500px',
                padding: '40px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Create Account</h2>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Join the enterprise event management platform</p>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <CheckCircle2 size={80} color="#10b981" weight="bold" />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Registration Successful!</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6' }}>{message}</p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>Full Name</div>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                        />
                        {errors.name && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '10px' }}>{errors.name}</p>}

                        <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>Email Address</div>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                        />
                        {errors.email && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '10px' }}>{errors.email}</p>}

                        <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>Password</div>
                        <input
                            type="password"
                            placeholder="Min. 8 characters + number"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                if (errors.password) setErrors({ ...errors, password: '' });
                            }}
                        />
                        <PasswordStrengthMeter password={formData.password} />
                        {errors.password && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '10px' }}>{errors.password}</p>}
                        <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#94a3b8' }}>I am a...</div>
                        <select
                            className="input-field"
                            style={{ appearance: 'none', background: 'rgba(15, 23, 42, 0.5) url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%3F%3E%3C%2Fsvg%3E") no-repeat right 1rem center / 12px' }}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="student" style={{ background: '#1e293b' }}>Student</option>
                            <option value="organizer" style={{ background: '#1e293b' }}>Organizer</option>
                            <option value="admin" style={{ background: '#1e293b' }}>Admin</option>
                        </select>
                        {errors.role && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '10px' }}>{errors.role}</p>}

                        {(formData.role === 'admin' || formData.role === 'organizer') && (
                            <>
                                <div style={{ marginBottom: '5px', marginTop: '15px', fontSize: '0.9rem', color: '#94a3b8' }}>
                                    {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Secret Code
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Enter ${formData.role} secret code`}
                                    className="input-field"
                                    value={formData.roleCode}
                                    onChange={(e) => {
                                        setFormData({ ...formData, roleCode: e.target.value });
                                        if (errors.roleCode) setErrors({ ...errors, roleCode: '' });
                                    }}
                                />
                                {errors.roleCode && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '10px' }}>{errors.roleCode}</p>}
                            </>
                        )}

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                            Create Account
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '30px', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: '600' }}>Log in</Link>
                </p>
            </div>
        </div >
    );
};

export default Register;
